import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Select, Checkbox, Divider } from 'antd';
import React, { FC, ReactElement, SyntheticEvent, useContext, useEffect, useState } from 'react';
import { AddressInput, Blockie, EtherInput } from '~~/eth-components/ant';

import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

import './CreateMsTx.css';
import { MsSafeContext } from './MultiSig';

import { BigNumber, BytesLike, ethers } from 'ethers';
import { useContractReader } from 'eth-hooks';

import { parseEther } from '@ethersproject/units';
import { useEthersContext } from 'eth-hooks/context';
import { errorColor, mediumButtonMinWidth, softTextColor } from '~~/styles/styles';

import { useMoralis } from 'react-moralis';
import FormError from '../Shared/FormError';
import { InnerAppContext } from '~~/models/CustomContexts';
import { DecodedCalldata } from './models/decoded-calldata.model';
import { DecodedResult } from './DecodedResult';

const { Option } = Select;

const CreateMetaTx: FC = () => {
  const { Moralis } = useMoralis();

  const { multiSigSafe } = useContext(MsSafeContext);
  const { ethPrice } = useContext(InnerAppContext);
  const scaffoldAppProviders = useScaffoldAppProviders();
  const ethersContext = useEthersContext();

  const [visibleModal, setVisibleModal] = useState(false);

  const [requiredSigners] = useContractReader(multiSigSafe, multiSigSafe.confirmationsRequired, []);

  // FORM

  const txNameErrorText = 'Please provide a name.';
  const [txName, setTxName] = useState<string>('');
  const [txNameError, setTxNameError] = useState<string>(txNameErrorText);

  const [to, setTo] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');

  const [signerForOp, setSignerForOp] = useState<string>('');
  const [updateRequiredSigners, setUpdateRequiredSigners] = useState(false);

  const [calldata, setCalldata] = useState('0x');

  const [methodName, setMethodName] = useState<string | undefined>();

  const [decodeError, setDecodeError] = useState<string>();
  const [submitResult, setSubmitResult] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const [closing, setClosing] = useState(false);

  const [decodedDataObject, setDecodedDataObject] = useState<DecodedCalldata>();

  const [showResult, setShowResult] = useState(false);

  const inputStyle = {
    padding: '0.5rem',
  };
  const errorStyle = {
    padding: '0.5rem',
    color: errorColor,
  };

  const resetMethodState = () => {
    setTo('');
    setAmount('');
    setCalldata('0x');
    setDecodedDataObject(undefined);
    setShowResult(false);
    setDecodeError('');
    setSubmitResult('');
    setSubmitError('');
  };

  const resetAll = () => {
    setTxName('');
    setTxNameError(txNameErrorText);
    resetMethodState();
    setMethodName(undefined);
  };

  const updateTxName = (ev: SyntheticEvent) => {
    const inputEl = ev.target as HTMLInputElement;
    setTxName(inputEl.value);
    setTxNameError(!inputEl.value ? txNameErrorText : '');
  };

  useEffect(() => {
    if (!methodName || !visibleModal) return;

    const encodecode = () => {
      try {
        const calldata = createCalldata();
        const decoded = multiSigSafe.interface.parseTransaction({ data: calldata }) as DecodedCalldata;
        console.log('calldata: ', calldata);
        console.log('decodedDataObject', decoded);
        setDecodedDataObject(decoded);
        setCalldata(calldata);
        setDecodeError('');
        setShowResult(true); // flips to true on first successful decoding of inputs
      } catch (error) {
        setCalldata('0x');
        setDecodedDataObject(undefined);
        console.log('mistake: ', error);
        setDecodeError('Could not decode: Invalid inputs');
      }
    };

    const inputTimer = setTimeout(() => {
      void encodecode();
    }, 500);

    return () => {
      clearTimeout(inputTimer);
    };
  }, [to, signerForOp, amount, updateRequiredSigners]);

  const createCalldata = (): string => {
    switch (methodName) {
      case 'transferFunds':
        const amountStr = parseFloat(amount).toFixed(12).toString();
        return multiSigSafe.interface.encodeFunctionData('transferFunds', [to, parseEther(amountStr)]);

      case 'addSigner':
      case 'removeSigner':
        const requiredSignersDiff = updateRequiredSigners ? (methodName === 'addSigner' ? 1 : -1) : 0;
        const newNumberOfSigners = (requiredSigners as BigNumber).toNumber() + requiredSignersDiff;
        return multiSigSafe.interface.encodeFunctionData(methodName, [signerForOp, newNumberOfSigners]);

      default:
        throw 'Methodname not recognized';
    }
  };

  let submitResultDisplay: ReactElement | string = '';

  if (submitError) {
    submitResultDisplay = submitError;
  }

  if (!submitError && submitResult) {
    submitResultDisplay = (
      <div style={{ margin: 16, padding: 8, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>Tx Created!</div>
        <div className="flex-center-reg" style={{ gap: '1rem' }}>
          <Blockie scale={4} address={submitResult} />
          <div style={{ flex: 1, overflowWrap: 'anywhere' }}>{submitResult}</div>
        </div>
      </div>
    );
  }

  let decodeResultDisplay: ReactElement | string = '';

  if (decodeError) {
    decodeResultDisplay = decodeError;
  }

  if (!decodeError && decodedDataObject) {
    decodeResultDisplay = <DecodedResult decodedCalldata={decodedDataObject} />;
  }

  const handleSubmit = async () => {
    if (calldata === '0x') {
      return;
    }
    const txHash = (await multiSigSafe.getTransactionHash(calldata)) as string;
    console.log('txHash', txHash);

    const signature = await ethersContext.signer?.signMessage(ethers.utils.arrayify(txHash));
    console.log('signature', signature);

    const recover = await multiSigSafe.recover(txHash, signature);
    console.log('recover', recover);

    const isOwner = await multiSigSafe.isOwner(recover);
    console.log('isOwner', isOwner);

    if (isOwner) {
      const MetaTx = Moralis.Object.extend('MetaTx');
      // Create a new instance of that class.
      const metaTx = new MetaTx();

      metaTx.set('txName', txName);
      metaTx.set('creator', recover);
      metaTx.set('safeAddress', multiSigSafe.address);
      metaTx.set('signatures', [signature]);
      metaTx.set('signers', [recover]);
      metaTx.set('txHash', txHash);
      metaTx.set('calldata', calldata);
      metaTx.set('executedAt', 0);

      metaTx.set('methodName', methodName);
      if (methodName === 'transferFunds') {
        metaTx.set('to', to);
        const amountStr = parseFloat(amount).toFixed(12).toString();
        metaTx.set('amount', parseEther(amountStr));
      } else {
        metaTx.set('to', ethers.constants.AddressZero);
        metaTx.set('amount', BigNumber.from(0));
        metaTx.set('signerForOp', signerForOp);
        const requiredSignersDiff = updateRequiredSigners ? (methodName === 'addSigner' ? 1 : -1) : 0;
        const newNumberOfSigners = (requiredSigners as BigNumber).toNumber() + requiredSignersDiff;
        metaTx.set('newNumberOfSigners', BigNumber.from(newNumberOfSigners));
      }

      await metaTx.save();
      setSubmitResult(txHash);
      setSubmitError('');
      setClosing(true);
    } else {
      console.log('ERROR, NOT OWNER.');
      setSubmitError("Transaction can't be constructed: Unrecognized owner.");
    }
  };

  const handleCancel = () => {
    resetAll();
    setVisibleModal(false);
  };

  const selectedTransferOp = methodName === 'transferFunds';
  const selectedSignerOp = methodName === 'addSigner' || methodName === 'removeSigner';

  return (
    <div>
      <Button
        type="primary"
        size="large"
        className="flex-center-imp"
        onClick={() => setVisibleModal(true)}
        style={{ width: '7rem' }}>
        <PlusOutlined />
        New
      </Button>

      <Modal
        destroyOnClose={true}
        title="Create MultiSig Metatransaction"
        style={{ top: 120 }}
        width="30rem"
        visible={visibleModal}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key={1} type="default" style={{ minWidth: mediumButtonMinWidth }} onClick={handleCancel}>
            {closing ? 'Thanks!' : 'Cancel'}
          </Button>,
          ...(closing
            ? []
            : [
                <Button
                  key={2}
                  type="primary"
                  disabled={(calldata === '0x' && showResult) || !!txNameError}
                  style={{ minWidth: mediumButtonMinWidth }}
                  onClick={handleSubmit}>
                  Submit
                </Button>,
              ]),
        ]}>
        <div style={{ ...inputStyle }}>
          <Input type="text" placeholder="Name your transaction" value={txName} onChange={updateTxName} />
          {txNameError && showResult && <FormError text={txNameError} />}
        </div>
        <div style={inputStyle}>
          <Select
            value={methodName}
            style={{ width: '100%' }}
            placeholder="Transaction type"
            onChange={(v) => {
              resetMethodState();
              setMethodName(v);
            }}>
            <Option key="transferFunds">transferFunds()</Option>
            <Option key="addSigner">addSigner()</Option>
            <Option key="removeSigner">removeSigner()</Option>
          </Select>
        </div>

        {selectedTransferOp && (
          <>
            <div style={inputStyle}>
              <AddressInput
                autoFocus
                ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
                placeholder="to address"
                address={to}
                onChange={setTo}
                showError
              />
            </div>
            <div style={inputStyle}>
              <EtherInput price={ethPrice} etherMode={false} value={amount} onChange={setAmount} />
            </div>
          </>
        )}

        {selectedSignerOp && (
          <div style={{ ...inputStyle, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AddressInput
              autoFocus
              ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
              placeholder="signer"
              address={signerForOp}
              onChange={setSignerForOp}
              showError
            />

            <div style={{ margin: '0 0.5rem' }}>
              <Checkbox checked={updateRequiredSigners} onChange={(e) => setUpdateRequiredSigners(e.target.checked)}>
                {methodName === 'addSigner' ? 'Increase required signers' : 'Decrease required signers'}
              </Checkbox>
            </div>
          </div>
        )}

        {showResult && (
          <>
            <Divider orientation="left">
              <span style={{ color: softTextColor }}>Preview</span>
            </Divider>
            <p style={{ ...inputStyle, color: softTextColor }}>
              This calldata will be executed when your metatransaction executes.
            </p>
            <div style={decodeError ? errorStyle : {}}>{decodeResultDisplay}</div>
            <div style={submitError ? errorStyle : {}}>{submitResultDisplay}</div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CreateMetaTx;

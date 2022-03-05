import React, { FC, ReactElement, useContext, useState } from 'react';
import { RollbackOutlined, SendOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { MsVaultContext } from './MultiSig';
import { errorColor, softBorder, cardGradientGrey } from '~~/styles/styles';
import { MSTransactionModel } from './models/ms-transaction.model';
import { useEthersContext } from 'eth-hooks/context';
import { useMoralis } from 'react-moralis';
import { InnerAppContext } from '~~/models/CustomContexts';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Deferrable } from 'ethers/lib/utils';
import { BigNumber, ethers, utils } from 'ethers';
import { getCurrentSigner } from '../common/currentSigner';

export interface IMSTransactionActions {
  transaction: MSTransactionModel;
  canConfirm: boolean;
  canExecute: boolean;
  canRevoke: boolean;
  multiSigVault: any;
  onExecute?: () => void;
}

const MSTransactionActions: FC<IMSTransactionActions> = (props) => {
  const { tx } = useContext(InnerAppContext);
  const { balance, multiSigVault } = useContext(MsVaultContext);
  const ethersContext = useEthersContext();
  const account = ethersContext.account;

  const [pendingActionConfirm, setPendingActionConfirm] = useState<boolean>(false);
  const [pendingActionRevoke, setPendingActionRevoke] = useState<boolean>(false);
  const [pendingActionExecute, setPendingActionExecute] = useState<boolean>(false);

  const { Moralis } = useMoralis();

  const createSignatureForInnerTransaction = async (): Promise<string | undefined> => {
    const txHash = (await multiSigVault.getTransactionHash(props.transaction.calldata)) as string;
    // need to get signer as workaround for a bug in @web3-react after metamask account changes.
    const sgn = await getCurrentSigner();
    return sgn.signMessage(ethers.utils.arrayify(txHash));
  };

  const orderSigs = async (): Promise<string[]> => {
    const sigs = props.transaction.signatures;
    const txHash = (await multiSigVault.getTransactionHash(props.transaction.calldata)) as string;
    const recoveredProms = sigs.map((s) => multiSigVault.recover(txHash, s));
    const recovered = await Promise.all(recoveredProms);
    const pairs: [string, string][] = sigs.map((s, idx) => [s, recovered[idx]]);
    pairs.sort((a: [string, string], b: [string, string]) => (a[1] > b[1] ? 1 : -1));
    return pairs.map((pair: [string, string]) => pair[0]);
  };

  const confirmTx = async (): Promise<void> => {
    setPendingActionConfirm(true);

    const tr = props.transaction;
    const mObj = tr._moralisObject;

    const myIdx = tr.signers.findIndex((s) => s === account);
    if (myIdx !== -1) throw 'Present account found among tx signers. Confirm should be disabled';
    const newSigners = [...tr.signers, account];

    let signature;
    try {
      signature = await createSignatureForInnerTransaction();
    } catch (e) {
      console.error(e);
      setPendingActionConfirm(false);
      return;
    }

    const newSignatures = [...tr.signatures, signature];

    mObj.set('signers', newSigners);
    mObj.set('signatures', newSignatures);

    try {
      await mObj.save();
    } catch (e) {
      alert('Something went wrong, please reload the page to see the current confirmations');
      console.error(e);
    }

    setPendingActionConfirm(false);
  };

  const executeTx = async (): Promise<void> => {
    setPendingActionExecute(true);
    const orderedSignatures = await orderSigs();

    const sgn = await getCurrentSigner();
    const execTx: Deferrable<TransactionRequest> = multiSigVault
      .connect(sgn)
      .executeTransaction(props.transaction.calldata, orderedSignatures);

    const markExecuted = async (): Promise<void> => {
      const query = new Moralis.Query('MetaTx');
      query.equalTo('objectId', props.transaction.id);
      const executedTxQuery = await query.find();
      if (executedTxQuery.length) {
        const executedTx = executedTxQuery[0];
        executedTx.set('executedAt', Date.now());
        await executedTx.save();
        props.onExecute?.();
      } else {
        console.error('Could not identify executed tx in DB');
      }
    };

    try {
      await tx?.(execTx, (update) => {
        if (update && (update.error || update.reason)) {
          setPendingActionExecute(false);
        }
        if (update && (update.status === 'confirmed' || update.status === 1)) {
          setPendingActionExecute(false);
          void markExecuted();
        }
        if (update && update.code) {
          // metamask error
          // may be that user denied transaction, but also actual errors
          // handle them particularly if you need to
          // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
          setPendingActionExecute(false);
        }
      });
    } catch (e) {
      console.error(e);
      setPendingActionExecute(false);
    }
  };

  const revokeTx = async (): Promise<void> => {
    setPendingActionRevoke(true);

    const tr = props.transaction;
    const mObj = tr._moralisObject;

    const myIdx = tr.signers.findIndex((s) => s === account);
    if (myIdx === -1) throw 'Present account not found among tx signers';
    const newSigners = [...tr.signers];
    newSigners.splice(myIdx, 1);
    const newSignatures = [...tr.signatures];
    newSignatures.splice(myIdx, 1);

    mObj.set('signers', newSigners);
    mObj.set('signatures', newSignatures);

    try {
      await mObj.save();
    } catch (e) {
      alert('Something went wrong, please reload the page to see the current confirmations');
      console.error(e);
    }

    setPendingActionRevoke(false);
  };

  const bnAmount = BigNumber.from(props.transaction.amount ?? 0);
  const insufficientFunds = !!balance && bnAmount?.gt(balance);

  const actionButtonWith = (
    text: string,
    action: () => void | Promise<void>,
    icon: any,
    pendingAction: boolean,
    type: 'primary' | 'link' | 'text' | 'ghost' | 'default' | 'dashed' | undefined,
    disabled = false
  ): ReactElement => (
    <Button
      size="large"
      className="inline-flex-center-imp"
      type={type}
      onClick={action}
      style={{ minWidth: '8rem' }}
      loading={pendingAction}
      disabled={disabled}>
      {text}
      {icon}
    </Button>
  );
  const positiveActionButton = props.canConfirm
    ? actionButtonWith('Confirm', confirmTx, <SmileOutlined />, pendingActionConfirm, 'primary')
    : props.canExecute
    ? actionButtonWith('Execute', executeTx, <SendOutlined />, pendingActionExecute, 'primary', insufficientFunds)
    : '';

  const revokeButton = props.canRevoke
    ? actionButtonWith('Revoke', revokeTx, <RollbackOutlined />, pendingActionRevoke, 'default')
    : '';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
        <div style={{ flex: '1', display: 'flex', justifyContent: revokeButton ? 'space-between' : 'flex-end' }}>
          {revokeButton}
          {positiveActionButton}
        </div>
      </div>
      {insufficientFunds && (
        <div
          style={{
            marginTop: '1rem',
            // color: canExecute ? errorColor : softTextColor,
            color: errorColor,

            // background: dialogOverlayGradient,
            background: cardGradientGrey,
            padding: '0.5rem',
            border: softBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
          <WarningOutlined /> Safe: insufficient funds for the transaction
        </div>
      )}
    </div>
  );
};

export default MSTransactionActions;

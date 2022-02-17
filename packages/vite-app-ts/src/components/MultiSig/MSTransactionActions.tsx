import React, { FC, ReactElement, useContext, useState } from 'react';
import { RollbackOutlined, SendOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { MsSafeContext } from './MultiSig';
import { errorColor, softBorder, cardGradientGrey } from '~~/styles/styles';
import { MSTransactionModel } from './models/ms-transaction.model';
import { useEthersContext } from 'eth-hooks/context';
import { useMoralis } from 'react-moralis';
import { InnerAppContext } from '~~/models/CustomContexts';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Deferrable } from 'ethers/lib/utils';
import { BigNumber, ethers, utils } from 'ethers';

export interface IMSTransactionActions {
  transaction: MSTransactionModel;
  canConfirm: boolean;
  canExecute: boolean;
  canRevoke: boolean;
  multiSigSafe: any;
  onExecute?: () => void;
}

const MSTransactionActions: FC<IMSTransactionActions> = (props) => {
  const { tx } = useContext(InnerAppContext);
  const { balance, multiSigSafe } = useContext(MsSafeContext);
  const ethersContext = useEthersContext();
  const account = ethersContext.account;

  const [pendingActionConfirm, setPendingActionConfirm] = useState<boolean>(false);
  const [pendingActionRevoke, setPendingActionRevoke] = useState<boolean>(false);
  const [pendingActionExecute, setPendingActionExecute] = useState<boolean>(false);

  const { Moralis } = useMoralis();

  const createSignatureForInnerTransaction = async (): Promise<string | undefined> => {
    const methodName = props.transaction.methodName;
    const amount = methodName === 'transferFunds' ? BigNumber.from(props.transaction.amount).toString() ?? '0' : '0';
    const recipient = methodName === 'transferFunds' ? props.transaction.to : props.transaction.signerForOp;
    const txHash = (await multiSigSafe.getTransactionHash(recipient, amount, props.transaction.calldata)) as string;
    return ethersContext.signer?.signMessage(ethers.utils.arrayify(txHash));
  };

  const confirmTx = async (): Promise<void> => {
    setPendingActionConfirm(true);

    const tr = props.transaction;
    const mObj = tr._moralisObject;

    const myIdx = tr.signers.findIndex((s) => s === account);
    if (myIdx !== -1) throw 'Present account found among tx signers. Confirm should be disabled';
    const newSigners = [...tr.signers, account];

    const signature = await createSignatureForInnerTransaction();
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

  const executeTx = (): void => {
    setPendingActionExecute(true);
    const execTx: Deferrable<TransactionRequest> = multiSigSafe.executeTransaction(
      props.transaction.calldata,
      props.transaction.signatures
    );

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

    void tx?.(execTx, (update) => {
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

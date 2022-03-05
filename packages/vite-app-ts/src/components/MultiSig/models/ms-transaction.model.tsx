import { BigNumber } from '@ethersproject/bignumber';
import Moralis from 'moralis/types';
export interface MSTransactionModel {
  txName: string;
  creator: string;
  id: string;
  vaultAddress: string;
  signatures: string[];
  signers: string[];
  txHash: string;
  calldata: string;
  methodName: string;
  to?: string;
  amount?: BigNumber;
  signerForOp?: string;
  newNumberOfSigners?: BigNumber;

  dateSubmitted?: Date;
  executed: boolean;
  dateExecuted?: Date;

  _moralisObject: Moralis.Object;
}

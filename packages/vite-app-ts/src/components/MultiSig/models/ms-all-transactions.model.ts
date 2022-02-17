import { MSTransactionModel } from './ms-transaction.model';
export interface MultiSigAllTransactions {
  pending: MSTransactionModel[];
  executed: MSTransactionModel[];
}

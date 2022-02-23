import { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { MSTransactionModel } from './models/ms-transaction.model';
import { BigNumber } from 'ethers';

export interface MultiSigTransactionsResult {
  initializing: boolean;
  pending: MSTransactionModel[];
  executed: MSTransactionModel[];
}

export interface ExecutedEventModel {
  to: string;
  value: BigNumber;
  data: string;
  hash: string;
  result: string;
  dateExecuted: Date;
}

export const useMultiSigTransactions = (multiSigSafe: any): MultiSigTransactionsResult => {
  const safeAddress = multiSigSafe.address;

  const [pending, setPending] = useState<MSTransactionModel[]>([]);
  const [executed, setExecuted] = useState<MSTransactionModel[]>([]);

  const [hasSubscribedPending, setHasSubscribedPending] = useState(false);
  const [hasSubscribedExecuted, setHasSubscribedExecuted] = useState(false);

  const { Moralis } = useMoralis();

  const convertObjToModel = (obj: any): MSTransactionModel => {
    const fields = obj.attributes;
    return {
      ...fields,
      id: obj.id,
      executed: false,
      dateSubmitted: fields.createdAt,
      _moralisObject: obj,
    };
  };

  const convertObjExecuted = (obj: any): MSTransactionModel => {
    const fields = obj.attributes;
    return {
      ...fields,
      id: obj.id,
      executed: true,
      dateSubmitted: fields.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      dateExecuted: new Date(fields.executedAt),
      _moralisObject: obj,
    };
  };

  useEffect(() => {
    const qSubmitted = new Moralis.Query('MetaTx');
    qSubmitted.equalTo('safeAddress', safeAddress);
    qSubmitted.equalTo('executedAt', 0);
    qSubmitted.descending('createdAt');
    qSubmitted
      .find()
      .then((data) => {
        setPending(data.map(convertObjToModel));
      })
      .catch((err) => {
        console.error('MORALIS QUERY FAILED: ', err);
      });

    const qExecuted = new Moralis.Query('MetaTx');
    qExecuted.equalTo('safeAddress', safeAddress);
    qExecuted.greaterThan('executedAt', 0);
    qExecuted.descending('createdAt');
    qExecuted
      .find()
      .then((data) => {
        setExecuted(data.map(convertObjExecuted));
      })
      .catch((err) => {
        console.error('MORALIS QUERY FAILED: ', err);
      });
  }, [Moralis, safeAddress]);

  useEffect(() => {
    if (!!pending && !hasSubscribedPending) {
      setHasSubscribedPending(true);
      const query = new Moralis.Query('MetaTx');
      query.equalTo('safeAddress', safeAddress);
      query.equalTo('executedAt', 0);
      query.descending('createdAt');
      query
        .subscribe()
        .then((subscription) => {
          subscription.on('create', (createdObj) => {
            setPending((pending) => [convertObjToModel(createdObj), ...pending]);
          });
          subscription.on('update', (updatedObj) => {
            setPending((pending) => {
              const objIdx = pending.findIndex((o) => o.id === updatedObj.id);
              if (objIdx === -1) throw 'Updated metaTx not found among pending metaTxs';
              const newPending = [...pending];
              newPending.splice(objIdx, 1, convertObjToModel(updatedObj));
              return newPending;
            });
          });
        })
        .catch((err) => {
          console.error('MORALIS SUBSCRIPTION FAILED: ', err);
        });
    }
  }, [pending, hasSubscribedPending, Moralis, safeAddress]);

  useEffect(() => {
    if (!!executed && !hasSubscribedExecuted) {
      setHasSubscribedExecuted(true);
      const query = new Moralis.Query('MetaTx');
      query.equalTo('safeAddress', safeAddress);
      query.greaterThan('executedAt', 0);
      query.descending('createdAt');
      query.descending('executedAt');
      query
        .subscribe()
        .then((subscription) => {
          subscription.on('enter', (updatedObj) => {
            setExecuted((executed) => {
              const newExecuted = [convertObjExecuted(updatedObj), ...executed];
              return newExecuted;
            });
            // putting this here because pending subscription does not reliably fire 'leave' events
            setPending((pending) => {
              const newPending = pending.filter((o) => o.id !== updatedObj.id);
              return newPending;
            });
          });
        })
        .catch((err) => {
          console.error('MORALIS SUBSCRIPTION FAILED: ', err);
        });
    }
  }, [executed, hasSubscribedExecuted, Moralis, safeAddress]);

  return {
    initializing: !hasSubscribedExecuted || !hasSubscribedPending,
    pending,
    executed,
  };
};

import { Spin } from 'antd';
import { useBalance, useContractReader } from 'eth-hooks';
import './MultiSig.css';
import React, { useContext, createContext, FC, useEffect } from 'react';

import { useMultiSigTransactions } from './useMultiSigTransactions';
import UserStatus from '../Shared/UserStatus';
import { BaseContract } from 'ethers';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { useEthersContext } from 'eth-hooks/context';
import { MSSafeEntity } from '~~/models/contractFactory/ms-safe-entity.model';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { BigNumber } from '@ethersproject/bignumber';
import { MSTransactionModel } from './models/ms-transaction.model';
import { InnerAppContext } from '~~/models/CustomContexts';
import { MultiSigDisplay } from './MultiSigDisplay';

export const MsSafeContext = createContext<{
  multiSigSafe?: any;
  owners?: string[];
  confirmationsRequired?: number;
  pending?: MSTransactionModel[];
  executed?: MSTransactionModel[];
  balance?: BigNumber;
}>({});

export interface IMultiSigProps {
  contract: MSSafeEntity | undefined;
}

export const MultiSig: FC<IMultiSigProps> = (props) => {
  const { injectableAbis } = useContext(InnerAppContext);

  const ethersContext = useEthersContext();
  const signer = ethersContext.signer;
  const userAddress = ethersContext.account ?? '';
  const abi = injectableAbis?.MultiSigSafe;

  const multiSigSafeRaw: any | undefined =
    abi &&
    props.contract &&
    (new BaseContract(props.contract.address, abi, asEthersAdaptor(ethersContext).provider) as any);
  const multiSigSafe = signer ? multiSigSafeRaw?.connect(signer) : multiSigSafeRaw;

  const { pending, executed, initializing: initializingTxs } = useMultiSigTransactions(multiSigSafe);

  const scaffoldAppProviders = useScaffoldAppProviders();
  const injectedProvider = scaffoldAppProviders.localAdaptor;

  const [balance] = useBalance(props.contract?.address);
  const confirmationsRequired = props.contract?.confirmationsRequired;
  const owners = props.contract?.owners;

  const isSelfOwnerOfContract = !!props.contract && !!userAddress && owners?.includes(userAddress);
  const isSelfCreatorOfContract = props.contract?.creator.toLocaleUpperCase === userAddress.toLocaleUpperCase;
  const uncertain = !!injectedProvider ? !(props.contract && userAddress) : !props.contract;
  const userStatusDisplay = !uncertain && (
    <UserStatus
      isSelfCreator={isSelfCreatorOfContract}
      isSelfOwner={isSelfOwnerOfContract}
      idx={+(props.contract?.contractId ?? -1)}
    />
  );

  const msSafeContext = {
    multiSigSafe,
    owners,
    confirmationsRequired,
    pending,
    executed,
    balance,
  };

  const ready =
    !!props.contract &&
    multiSigSafe &&
    !!owners &&
    !!confirmationsRequired &&
    !initializingTxs &&
    !!pending &&
    !!executed;

  return ready ? (
    <MsSafeContext.Provider value={msSafeContext}>
      <MultiSigDisplay userStatusDisplay={userStatusDisplay} />
    </MsSafeContext.Provider>
  ) : (
    <div style={{ margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
      <Spin size="large" />
    </div>
  );
};

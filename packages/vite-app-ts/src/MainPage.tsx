/* eslint-disable import/order */
import React, { FC, useEffect, useState, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom';
import '~~/styles/main-page.css';
import { useContractReader, useEthersAdaptorFromProviderOrSigners, useGasPrice } from 'eth-hooks';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { MainPageContracts, MainPageFooter, MainPageHeader } from './components/main';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useBurnerFallback } from '~~/components/main/hooks/useBurnerFallback';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~~/config/contractContext';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { loadNonDeployedContractAbi } from './functions/loadNonDeployedAbis';
import { InjectableAbis } from './generated/injectable-abis/injectable-abis.type';
import { useWindowWidth } from '@react-hook/window-size';

import { transactor } from '~~/eth-components/functions';
import { EthComponentsSettingsContext } from '~~/eth-components/models';
import {
  breakPointMsFit,
  breakPointMsTxDetailsFit,
  breakPointUserStatusDisplayFit,
  softTextColor,
} from './styles/styles';
import { Button } from 'antd';
import MultiSigsPage from './components/pages/ContractFactory/MultiSigsPage';
import SingleMultiSigPage from './components/pages/ContractFactory/SingleMultiSigPage';
import { MAINNET_PROVIDER, BURNER_FALLBACK_ENABLED } from '~~/config/appConfig';
import { InnerAppContext, LayoutContext } from './models/CustomContexts';
import { useMultiSigVaults } from './components/MultiSig/useMultiSigVaults';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See config/appConfig.ts for configuration, such as TARGET_NETWORK
 * See MainPageContracts.tsx for your contracts component
 * See contractsConnectorConfig.ts for how to configure your contracts
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 *
 * For more
 */

/**
 * The main component
 * @returns
 */
export const Main: FC = () => {
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders();

  // 🦊 Get your web3 ethers context from current providers
  const ethersContext = useEthersContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersContext));

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  // init contracts
  const factory = useAppContracts('MSFactory', ethersContext.chainId);

  const account = ethersContext.account;
  const { vaults: createdContracts, loading: loadingVaults } = useMultiSigVaults(factory, account);

  const [numCreated] = useContractReader(
    factory,
    factory?.numberOfContracts,
    [],
    factory?.filters.CreateMultiSigVault()
  );

  const [injectableAbis, setInjectableAbis] = useState<InjectableAbis>();
  useEffect(() => {
    const load = async (): Promise<void> => {
      const MultiSigVault = await loadNonDeployedContractAbi('MultiSigVault');
      if (MultiSigVault) {
        setInjectableAbis({ MultiSigVault });
      } else {
        console.error(`Could not find injectable abi for MultiSigVault`);
      }
    };
    load().catch((e) => console.error(e));
  }, []);

  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(scaffoldAppProviders.mainnetAdaptor?.provider, scaffoldAppProviders.targetNetwork);

  const innerAppContext = {
    injectableAbis,
    createdContracts,
    numCreatedContracts: numCreated?.toNumber(),
    tx,
    gasPrice,
    ethPrice,
  };
  const windowWidth = useWindowWidth();
  const layoutContext = {
    windowWidth,
    widthAboveMsFit: windowWidth >= breakPointMsFit,
    widthAboveMsTxDetailsFit: windowWidth >= breakPointMsTxDetailsFit,
    widthAboveUserStatusDisplayFit: windowWidth >= breakPointUserStatusDisplayFit,
  };

  return (
    <LayoutContext.Provider value={layoutContext}>
      <InnerAppContext.Provider value={innerAppContext}>
        <div className="App">
          <BrowserRouter>
            <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
            <Link to="/contracts">
              <Button
                type="default"
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.8,
                  boxShadow: '0 3px 5px 1px #eaeaea',
                  zIndex: 10,
                }}>
                <div style={{ fontSize: '1rem', color: softTextColor }}>
                  <span style={{ marginRight: '0.75rem', fontSize: '0.875rem' }}>🛠</span>Debug
                </div>
              </Button>
            </Link>

            <div className="AppScroller">
              <Routes>
                <Route
                  path="/myvaults/:idx"
                  element={
                    <div className="AppCenteredCol">
                      <MultiSigsPage />
                    </div>
                  }
                />
                <Route
                  path="/myvaults"
                  element={
                    <div className="AppCenteredCol">
                      <MultiSigsPage />
                    </div>
                  }
                />
                <Route path="/" element={<Navigate replace to="/myvaults" />} />
                <Route path="/vault/:idx" element={<SingleMultiSigPage />} />
                <Route
                  path="/contracts"
                  element={
                    <div className="AppCenteredCol">
                      <MainPageContracts scaffoldAppProviders={scaffoldAppProviders} />
                    </div>
                  }
                />
              </Routes>
            </div>
          </BrowserRouter>

          <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
        </div>
      </InnerAppContext.Provider>
    </LayoutContext.Provider>
  );
};

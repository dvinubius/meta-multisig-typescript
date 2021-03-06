import React, { FC, useContext, useState } from 'react';
import { GenericContract } from '~~/eth-components/ant/generic-contract';
import { BaseContract } from 'ethers';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { Button, Divider } from 'antd';
import { MSVaultEntity } from '../../models/contractFactory/ms-vault-entity.model';
import { LeftOutlined } from '@ant-design/icons';
import { mediumButtonMinWidth } from '~~/styles/styles';

import ContractDebugHeader from '../common/ContractDebugHeader';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { InnerAppContext } from '~~/models/CustomContexts';
export interface IMainPageContractsProps {
  scaffoldAppProviders: IScaffoldAppProviders;
}

/**
 * 🎛 this scaffolding is full of commonly used components
    this <GenericContract/> component will automatically parse your ABI
    and give you a form to interact with it locally
 * @param props 
 * @returns 
 */
export const MainPageContracts: FC<IMainPageContractsProps> = (props) => {
  const ethersContext = useEthersContext();
  const multiSigFactory = useAppContracts('MSFactory', ethersContext.chainId);

  const signer = ethersContext.signer;

  const { injectableAbis, createdContracts } = useContext(InnerAppContext);
  const abi = injectableAbis?.MultiSigVault;

  const [openedDebugContract, setOpenedDebugContract] = useState<{
    multiSigVault: BaseContract;
    entity: MSVaultEntity;
  }>();
  const handleBack = (): void => setOpenedDebugContract(undefined);

  if (ethersContext.account == null) {
    return <></>;
  }

  return (
    <div
      style={{ width: '70vw', padding: '2rem 0 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <GenericContract
        contractName="MSFactory"
        contract={multiSigFactory}
        mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
        blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
      />
      <Divider style={{ margin: '3rem 0 0' }}>
        <span style={{ fontSize: '1.5rem' }}>Created Contracts</span>
      </Divider>
      <div style={{ alignSelf: 'stretch' }}>
        {/* HEAD SECTION */}
        <div style={{ height: '14rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '6rem',
            }}>
            🏗
          </div>
          {openedDebugContract && (
            <Button className="flex-center-imp" style={{ minWidth: mediumButtonMinWidth }} onClick={handleBack}>
              <LeftOutlined /> Back
            </Button>
          )}
        </div>
      </div>

      {createdContracts && injectableAbis && (
        <>
          {/* OPENED ONE */}
          {openedDebugContract && (
            <div>
              <ContractDebugHeader contract={openedDebugContract.entity} />
              <GenericContract
                contractName="MultiSigVault"
                contract={openedDebugContract.multiSigVault}
                key={openedDebugContract.entity.address}
                mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
                blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
                padding={0}
              />
            </div>
          )}
          {/* LIST */}
          {!openedDebugContract && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {createdContracts.map((createdContract: MSVaultEntity) => {
                const multiSigVaultRaw: any | undefined =
                  abi &&
                  (new BaseContract(createdContract.address, abi, asEthersAdaptor(ethersContext).provider) as any);
                const multiSigVault = signer ? multiSigVaultRaw?.connect(signer) : multiSigVaultRaw;

                const handleOpen = (): void =>
                  setOpenedDebugContract({
                    multiSigVault,
                    entity: createdContract,
                  });
                return (
                  <div className="hoverableLight" key={createdContract.address} onClick={handleOpen}>
                    <ContractDebugHeader contract={createdContract} hoverable />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

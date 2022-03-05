import React, { FC, useCallback, useContext, useEffect } from 'react';
import { CodeSandboxOutlined, HomeOutlined, LeftOutlined } from '@ant-design/icons';
import { Button, Divider, Spin, Typography } from 'antd';
import { useState } from 'react';
import { mainColWidthRem, mediumButtonMinWidth, softTextColor } from '~~/styles/styles';
import StackGrid from 'react-stack-grid';
import NaviMultiSigs from './NaviMultiSigs';
import { useNavigate, useParams } from 'react-router-dom';
import { MSVaultEntity } from '../../../models/contractFactory/ms-vault-entity.model';
import { useEthersContext } from 'eth-hooks/context';
import CreateMultiSig from '~~/components/Factory/CreateMultiSig';
import { MultiSig } from '~~/components/MultiSig/MultiSig';
import MSContractItem from '~~/components/Factory/MSContractItem';
import { InnerAppContext, LayoutContext } from '~~/models/CustomContexts';

const { Title } = Typography;

const MultiSigsPage: FC = () => {
  const { injectableAbis, createdContracts } = useContext(InnerAppContext);
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const navigate = useNavigate();
  const { idx: idxQueryParam } = useParams();
  const chosenContractMode = typeof idxQueryParam !== 'undefined';

  const [displayBack, setDisplayBack] = useState<boolean>(false);

  const [eventQueryExpired, setEventQueryExpired] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => setEventQueryExpired(true), 6500);
  }, []); // if after this time no results, assume this user nas no owned safes

  const [userAddressInitExpired, setUserAddressInitExpired] = useState(false);
  useEffect(() => {
    setTimeout(() => setUserAddressInitExpired(true), 2500);
  }, []); // wait for userAddress to initialize

  const ethersContext = useEthersContext();
  const account = ethersContext.account;
  const isMine = (c: MSVaultEntity): boolean => !!account && (c.owners.includes(account) || c.creator === account);

  const canGetData = chosenContractMode
    ? !!idxQueryParam && !!createdContracts && !!account && !!injectableAbis
    : !!createdContracts && !!injectableAbis && !!account;

  // just the chosen contract
  const identifiedParamContract =
    chosenContractMode && canGetData ? createdContracts?.find((c) => c.contractId === idxQueryParam) : undefined;

  // all owned or created ones
  const myContracts = !chosenContractMode && canGetData ? createdContracts?.filter(isMine) : undefined;
  const handleOpenContract = useCallback((c) => {
    setDisplayBack(true);
    navigate(`/mysafes/${c.contractId}`);
  }, []);

  const handleBack = (): void => {
    navigate(-1);
  };

  if (!canGetData) {
    // DISPLAY LOADING STATE / EMPTY STATE WITHOUT NAVI SHELL
    const showNoUserDisplay = userAddressInitExpired && !account;
    return (
      <div
        style={{
          height: '50vh',
          margin: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
        }}>
        {showNoUserDisplay && (
          <div
            style={{
              color: softTextColor,
              fontSize: '1.25rem',
            }}>
            Connect a wallet to view this page
          </div>
        )}
        {!showNoUserDisplay && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '1rem',
            }}>
            <Spin size="large" />
            <div style={{ color: softTextColor, fontSize: '1.25rem' }}>Connecting...</div>
          </div>
        )}
      </div>
    );
  }

  // BUILD SHELL

  const naviItems = chosenContractMode ? (
    <div style={{ width: '9rem', textAlign: 'left' }}>
      {displayBack && (
        <Button
          onClick={handleBack}
          className="inline-flex-center-imp"
          style={{ minWidth: mediumButtonMinWidth }}
          size="large">
          <LeftOutlined /> Back
        </Button>
      )}
      {!displayBack && (
        <Button
          style={{ minWidth: mediumButtonMinWidth }}
          className="inline-flex-center-imp"
          size="large"
          onClick={(): void => navigate('/')}>
          <HomeOutlined />
          My Safes
        </Button>
      )}
    </div>
  ) : (
    <div style={{ width: '9rem', textAlign: 'left' }}>
      <CreateMultiSig />
    </div>
  );

  const pageTitle = chosenContractMode ? (
    <CodeSandboxOutlined />
  ) : (
    <>
      <CodeSandboxOutlined /> My Safes
    </>
  );

  const viewDivider = (
    <Divider style={{ margin: identifiedParamContract ? '1rem 0 1rem' : '2rem 0 0' }}>
      {identifiedParamContract && (
        <Title
          level={2}
          style={{
            fontWeight: 400,
            height: '2rem',
            transform: 'translateY(-3px)',
            color: softTextColor,
            margin: '0',
          }}>
          {identifiedParamContract.name}
        </Title>
      )}
    </Divider>
  );

  const hasData: boolean = chosenContractMode ? !!identifiedParamContract : !!myContracts?.length;

  let viewContent;
  if (!hasData) {
    // EMPTY STATE
    viewContent = (
      <div style={{ color: softTextColor, marginTop: '20vh', fontSize: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
          }}>
          {!eventQueryExpired && (
            <>
              <Spin size="large" />
              <div style={{ color: softTextColor, fontSize: '1.25rem' }}>
                {chosenContractMode ? 'Connecting to your safe...' : 'Retrieving your safes...'}
              </div>
            </>
          )}

          {eventQueryExpired && (
            <div style={{ color: softTextColor, fontSize: '1.25rem' }}>
              {chosenContractMode
                ? 'Could not find this safe among your own'
                : "Looks like you don't own any safes yet"}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // PROPER CONTENT
    viewContent = chosenContractMode ? (
      <div style={{ alignSelf: 'stretch', flex: 1, overflow: 'hidden' }}>
        <MultiSig contract={identifiedParamContract} />
      </div>
    ) : (
      <div style={{ alignSelf: 'stretch', flex: 1, overflowY: 'auto', paddingTop: '2rem' }}>
        <div
          style={{
            maxWidth: widthAboveMsTxDetailsFit ? `${mainColWidthRem}rem` : '28rem',
            margin: '0 auto 8rem',
          }}>
          <StackGrid columnWidth="100%" gutterHeight={16}>
            {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}> */}
            {myContracts?.map((c: MSVaultEntity) => (
              <div key={c.address}>
                <MSContractItem openContract={handleOpenContract} contract={c} />
              </div>
            ))}
            {/* </div> */}
          </StackGrid>
        </div>
      </div>
    );
  }

  return (
    <NaviMultiSigs naviItems={naviItems} pageTitle={pageTitle} viewDivider={viewDivider} viewContent={viewContent} />
  );
};

export default MultiSigsPage;

import { Descriptions, Spin } from 'antd';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Address, Balance } from '~~/eth-components/ant';
import { primaryColor } from '~~/styles/styles';
import { MSTransactionModel } from './models/ms-transaction.model';
import { contentWrapperStyle, labelStyle } from './MSTransactionStyles';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { remToPx } from '~~/helpers/layoutCalc';
import TxData from '../Shared/TxData';
import { InnerAppContext } from '~~/models/CustomContexts';
import { DecodedCalldata } from './models/decoded-calldata.model';
import { MsSafeContext } from './MultiSig';
import { DecodedResult } from './DecodedResult';

export interface IMSTransactionOverviewProps {
  transaction: MSTransactionModel;
}

const MSTransactionOverview: FC<IMSTransactionOverviewProps> = (props) => {
  const { ethPrice } = useContext(InnerAppContext);
  const { multiSigSafe } = useContext(MsSafeContext);
  const scaffoldAppProviders = useScaffoldAppProviders();
  const blockExplorer = scaffoldAppProviders.targetNetwork.blockExplorer;
  const decodedCalldata = multiSigSafe.interface.parseTransaction({ data: props.transaction.calldata });

  const detailsLeft = [
    {
      label: 'Name',
      content: <div>{props.transaction.txName}</div>,
    },
    {
      label: 'Creator',
      content: (
        <Address
          address={props.transaction.creator}
          ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
          blockExplorer={blockExplorer}
          fontSize={16}
        />
      ),
    },
    {
      label: 'Submitted',
      content: (
        <div style={{}} className="mono-nice">
          {props.transaction.dateSubmitted?.toLocaleString()}
        </div>
      ),
    },
  ];

  const detailsRight = [
    {
      label: 'Recipient',
      content: (
        <Address
          address={props.transaction.to}
          ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
          blockExplorer={blockExplorer}
          fontSize={16}
        />
      ),
    },
    {
      label: 'Value',
      content: (
        <Balance
          balance={props.transaction.amount}
          etherMode
          fontSize={remToPx(1)}
          padding={0}
          price={ethPrice}
          customColor={primaryColor}
        />
      ),
    },
    {
      label: 'Data',
      content: <TxData data={props.transaction.calldata} fontSize="0.875rem" width="12rem" iconFontSize="1rem" />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
      <div
        style={{
          flex: '1',
          minWidth: '21rem',
        }}>
        <Descriptions bordered size="small" style={{ width: '100%' }}>
          {detailsLeft.map((item) => (
            <Descriptions.Item key={item.label} label={<span style={labelStyle}>{item.label}</span>} span={6}>
              <div style={{ ...contentWrapperStyle }}>{item.content}</div>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>

      <div
        style={{
          flex: '1',
          minWidth: '21rem',
        }}>
        {/* <Descriptions bordered size="small" style={{ width: '100%' }}>
          {detailsRight.map((item) => (
            <Descriptions.Item label={<span style={labelStyle}>{item.label}</span>} span={6}>
              <div style={{ ...contentWrapperStyle }}>{item.content}</div>
            </Descriptions.Item>
          ))}
        </Descriptions> */}

        <DecodedResult decodedCalldata={decodedCalldata} />

        {props.transaction.executed && (
          <Descriptions bordered size="small" style={{ width: '100%', marginTop: '1rem' }}>
            <Descriptions.Item label={<span style={labelStyle}>Executed</span>} span={6}>
              <div style={{ ...contentWrapperStyle }} className="mono-nice">
                {props.transaction.dateExecuted ? (
                  <div>{props.transaction.dateExecuted.toLocaleString()}</div>
                ) : (
                  <Spin size="small" />
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
    </div>
  );
};

export default MSTransactionOverview;

import { Descriptions, Spin, Divider } from 'antd';
import React, { FC, useContext, useState } from 'react';
import { Address } from '~~/eth-components/ant';

import { MSTransactionModel } from './models/ms-transaction.model';
import { contentWrapperStyle, labelStyle } from './MSTransactionStyles';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

import { MsVaultContext } from './MultiSig';
import { DecodedResult } from './DecodedResult';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

export interface IMSTransactionOverviewProps {
  transaction: MSTransactionModel;
  isParentExpanded: boolean;
}

const MSTransactionOverview: FC<IMSTransactionOverviewProps> = (props) => {
  const { multiSigVault } = useContext(MsVaultContext);
  const scaffoldAppProviders = useScaffoldAppProviders();
  const blockExplorer = scaffoldAppProviders.targetNetwork.blockExplorer;
  const decodedCalldata = multiSigVault.interface.parseTransaction({ data: props.transaction.calldata });

  const [expanded, setExpanded] = useState(props.isParentExpanded);

  const toggleExpansion = () => {
    setExpanded((exp) => !exp);
  };

  const detailsTop = [
    {
      label: 'Submitted',
      content: <div className="mono-nice">{props.transaction.dateSubmitted?.toLocaleString()}</div>,
    },
    {
      label: 'By',
      content: (
        <Address
          address={props.transaction.creator}
          ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
          blockExplorer={blockExplorer}
          fontSize={16}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '1rem',
      }}>
      <div
        style={{
          flex: '1',
          minWidth: '21rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '0 0.5rem',
        }}>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '1.25rem',
          }}>
          {props.transaction.txName}
        </div>

        <Descriptions bordered size="small">
          {detailsTop.map((item) => (
            <Descriptions.Item key={item.label} label={<span style={labelStyle}>{item.label}</span>} span={4}>
              <div style={{ ...contentWrapperStyle }}>{item.content}</div>
            </Descriptions.Item>
          ))}
          {props.transaction.executed && (
            <Descriptions.Item label={<span style={labelStyle}>Executed</span>} span={3}>
              <div style={{ ...contentWrapperStyle }} className="mono-nice">
                {props.transaction.dateExecuted ? (
                  <div>{props.transaction.dateExecuted.toLocaleString()}</div>
                ) : (
                  <Spin size="small" />
                )}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
      <Divider style={{ margin: 0 }}>
        {!props.isParentExpanded && (
          <div
            onClick={toggleExpansion}
            style={{
              cursor: 'pointer',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              // border: softBorder,
              backgroundColor: '#fff',
              boxShadow: 'rgb(0 0 0 / 5%) 0px 2px 6px 3px',
            }}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        )}
      </Divider>

      <div
        style={{
          display: expanded ? 'block' : 'none',
          flex: '1',
        }}>
        <DecodedResult decodedCalldata={decodedCalldata} />
      </div>
    </div>
  );
};

export default MSTransactionOverview;

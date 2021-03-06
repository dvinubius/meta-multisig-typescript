import React, { FC, useContext } from 'react';
import { cardGradient, mediumButtonMinWidth, softTextColor } from '~~/styles/styles';

import { Button, Card, Descriptions } from 'antd';
import { ArrowsAltOutlined } from '@ant-design/icons';
import { MSVaultEntity } from '~~/models/contractFactory/ms-vault-entity.model';
import { Address } from '~~/eth-components/ant';
import { LayoutContext } from '~~/models/CustomContexts';

export interface IMSContractItemProps {
  openContract: (c: MSVaultEntity) => void;
  contract: MSVaultEntity;
}

const MSContractItem: FC<IMSContractItemProps> = (props) => {
  const cellHeight = '2.5rem';
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const descriptionSpan = widthAboveMsTxDetailsFit ? 0 : 3;

  return (
    <Card
      size="small"
      style={{ background: cardGradient }}
      className="hoverableLight"
      title={
        <div
          style={{
            padding: '0 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'space-between',
            fontWeight: 400,
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              flex: '66%',
            }}>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 400,

                // color: softTextColor,
              }}>
              {props.contract.name}
            </div>
            <Address fontSize={18} address={props.contract.address} />
          </div>
          <Button
            size="large"
            style={{
              fontSize: '1rem',
              width: mediumButtonMinWidth,
            }}
            className="flex-center-imp"
            onClick={(): void => props.openContract(props.contract)}>
            Open <ArrowsAltOutlined />
            {/* Open <LoginOutlined /> */}
          </Button>
        </div>
      }>
      <div style={{ padding: '0.5rem' }}>
        <Descriptions bordered size="small" labelStyle={{ textAlign: 'center', height: cellHeight }}>
          <Descriptions.Item
            label="Created"
            labelStyle={{ color: softTextColor }}
            contentStyle={{
              padding: '0 1rem',
            }}
            span={descriptionSpan}>
            <div className="mono-nice">{props.contract.createdAt.toLocaleString()}</div>
          </Descriptions.Item>
          <Descriptions.Item
            label="By"
            labelStyle={{ color: softTextColor }}
            contentStyle={{
              padding: '0 1rem',
              height: cellHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              position: 'relative',
            }}
            span={descriptionSpan}>
            <Address fontSize={14} address={props.contract.creator} />
          </Descriptions.Item>
          <Descriptions.Item label="Confirmations" labelStyle={{ color: softTextColor }} span={descriptionSpan}>
            <span className="mono-nice">
              {props.contract.confirmationsRequired} of {props.contract.owners.length}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
};

export default MSContractItem;

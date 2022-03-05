import { LeftOutlined } from '@ant-design/icons';
import { Button, Tabs, Select } from 'antd';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useContext, useState, useEffect } from 'react';

import { LayoutContext } from '~~/models/CustomContexts';
import { mainColWidthRem, mediumButtonMinWidth, softTextColor } from '~~/styles/styles';
import CreateMetaTx from './CreateMetaTx';
import { MsVaultContext } from './MultiSig';
import TransactionListItem from './TransactionListItem';

const { TabPane } = Tabs;
const MSTransactionsSection: FC = () => {
  const ethersContext = useEthersContext();
  const userAddress = ethersContext.account;

  const { owners, pending, executed } = useContext(MsVaultContext);
  const { widthAboveMsFit, widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const isSelfOwner = !!owners && !!userAddress && owners.includes(userAddress);

  const [selectedItemId, setSelectedItemId] = useState<string | null>();
  const [selectedItem, setSelectedItem] = useState<any>();
  useEffect(() => {
    setSelectedItem(!!selectedItemId ? pending?.find((tx) => tx.id === selectedItemId) : null);
  }, [selectedItemId, pending]);

  const handleExecuted = (): void => {
    setSelectedItemId(null);
  };

  const emptyStateTxs = (text: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '10rem',
        fontSize: '1rem',
        color: softTextColor,
      }}>
      {text}
    </div>
  );

  const tabStyle = {
    letterSpacing: widthAboveMsTxDetailsFit ? '0.1rem' : '0.05rem',
    margin: widthAboveMsTxDetailsFit ? '0 3rem' : '0 1.5rem',
  };
  return (
    <div
      style={{
        position: 'relative',
        width: widthAboveMsFit ? `${mainColWidthRem}rem` : '100%',
        margin: 'auto',
      }}>
      {selectedItem && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '1rem',
            }}>
            {
              <Button
                onClick={() => setSelectedItemId(null)}
                className="flex-center-imp"
                style={{ minWidth: mediumButtonMinWidth }}
                size="large">
                <LeftOutlined /> Back
              </Button>
            }
          </div>
          <div>
            <TransactionListItem transaction={selectedItem} expanded={true} onExecute={handleExecuted} />
          </div>
        </>
      )}
      {!selectedItem && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'relative',
              top: '0.5rem',
              marginBottom: widthAboveMsTxDetailsFit ? 0 : '1rem',
            }}>
            {isSelfOwner && <CreateMetaTx />}
          </div>
          <Tabs defaultActiveKey="1" size="small" centered>
            <TabPane tab={<span style={tabStyle}>Pending</span>} key="1">
              {pending?.length === 0 && emptyStateTxs('No pending transactions')}
              {pending?.map((tx) => (
                <TransactionListItem
                  transaction={tx}
                  key={tx.id}
                  expanded={false}
                  onExpand={() => setSelectedItemId(tx.id)}
                />
              ))}
            </TabPane>
            <TabPane tab={<span style={tabStyle}>Executed</span>} key="2">
              {executed?.length === 0 && emptyStateTxs('No executed transactions')}
              {executed?.map((tx) => (
                <TransactionListItem transaction={tx} key={tx.id} expanded={false} />
              ))}
            </TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MSTransactionsSection;

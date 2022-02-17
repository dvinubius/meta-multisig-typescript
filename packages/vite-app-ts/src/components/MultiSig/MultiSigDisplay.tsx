import { Descriptions, Divider } from 'antd';
import { FC, useContext } from 'react';
import { Address, Balance } from '~~/eth-components/ant';
import QR from 'qrcode.react';
import { remToPx } from '~~/helpers/layoutCalc';
import { InnerAppContext, LayoutContext } from '~~/models/CustomContexts';
import {
  cardGradient,
  cardGradientVert,
  mainColWidthRem,
  msSafeColGapRem,
  msSafeColWidthRem,
  primaryColor,
  softBorder,
  softBorder2,
} from '~~/styles/styles';
import MSTransactionsSection from './MSTransactionsSection';
import { MsSafeContext } from './MultiSig';
import Owners from './Owners';
import Requirements from './Requirements';

export interface IMultiSigDisplayProps {
  userStatusDisplay: any;
}

export const MultiSigDisplay: FC<IMultiSigDisplayProps> = (props) => {
  const { ethPrice } = useContext(InnerAppContext);
  const { owners, balance, multiSigSafe } = useContext(MsSafeContext);
  const { widthAboveMsTxDetailsFit, widthAboveUserStatusDisplayFit } = useContext(LayoutContext);
  const labelStyle = {
    fontSize: '0.875rem',
    // color: 'hsl(0, 0%, 40%)',
    flexShrink: 0,
    color: '#111111',
  };
  const balanceWrapperStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    height: '1.875rem',
    alignItems: 'center',
  };

  return (
    <div style={{ maxWidth: '100%', height: '100%' }} className="MultiSig">
      <div
        style={{
          margin: '0 auto',
          height: '100%',
          overflow: 'auto',
          background: cardGradientVert,
          padding: '1rem 1rem 6rem',
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'space-between',
            }}>
            <div
              style={{
                width: '100%',
                maxWidth: widthAboveUserStatusDisplayFit ? `${msSafeColWidthRem * 2 + msSafeColGapRem}rem` : '100%',
                margin: '0 auto 2rem',
              }}>
              {props.userStatusDisplay}
            </div>
            <div
              style={{
                display: 'flex',
                gap: `${msSafeColGapRem}rem`,
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '0 0 2rem',
              }}
              className="WalletOverview">
              <div
                style={{
                  width: `${msSafeColWidthRem}rem`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: '1rem',
                }}>
                <Descriptions bordered size="small" style={{ width: '100%' }}>
                  <Descriptions.Item label={<span style={labelStyle}>{'Balance'}</span>} span={6}>
                    <div style={{ ...balanceWrapperStyle, opacity: 0.8 }}>
                      <Balance
                        balance={balance}
                        etherMode
                        padding={0}
                        customColor={primaryColor}
                        price={ethPrice}
                        fontSize={remToPx(1.25)}
                      />
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <div
                  style={{
                    height: 38,
                    border: softBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Address fontSize={18} address={multiSigSafe?.address} />
                </div>

                <div
                  style={{
                    // flex: 1,
                    alignSelf: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: softBorder,
                  }}>
                  <QR
                    value={multiSigSafe ? multiSigSafe.address : ''}
                    size={180}
                    level="H"
                    includeMargin
                    renderAs="svg"
                    imageSettings={{ excavate: false, src: '' }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: `${msSafeColWidthRem}rem`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: '1rem',
                }}>
                <Descriptions bordered size="small" style={{ width: '100%' }}>
                  <Descriptions.Item
                    label={<div style={{ ...labelStyle, width: '6rem' }}>{'Confirmations'}</div>}
                    span={6}>
                    <div style={{ ...balanceWrapperStyle, justifyContent: 'center' }}>
                      <Requirements />
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" style={{ width: '100%' }}>
                  <Descriptions.Item label={<div style={{ ...labelStyle, width: '6rem' }}>{'Owners'}</div>} span={6}>
                    <div
                      style={{ ...balanceWrapperStyle, justifyContent: 'flex-end', fontSize: '1rem' }}
                      className="mono-nice">
                      {owners?.length}
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <div
                  style={{
                    flex: 1,
                    maxHeight: '16rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    border: softBorder2,
                    // background: swapGradient,
                    background: cardGradient,
                    padding: '0.5rem 0',
                  }}>
                  <div style={{ height: '100%' }}>
                    <Owners />
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                width: widthAboveMsTxDetailsFit ? `${mainColWidthRem}rem` : '100%',
                margin: 'auto',
              }}>
              <Divider>TRANSACTIONS</Divider>
            </div>
            <MSTransactionsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

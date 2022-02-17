import { InjectableAbis } from '~~/generated/injectable-abis/injectable-abis.type';
import { MSSafeEntity } from '~~/models/contractFactory/ms-safe-entity.model';
import { TTransactorFunc } from '../eth-components/functions';
import { createContext } from 'react';

export interface InnerAppContext {
  injectableAbis?: InjectableAbis;
  createdContracts?: MSSafeEntity[];
  numCreatedContracts?: number;
  ethPrice?: number;
  gasPrice?: number;
  tx?: TTransactorFunc;
}
export const InnerAppContext = createContext<InnerAppContext>({});

export interface ILayoutContext {
  windowWidth: number | undefined;
  widthAboveMsFit: boolean | undefined;
  widthAboveMsTxDetailsFit: boolean | undefined;
  widthAboveUserStatusDisplayFit: boolean | undefined;
}

export const LayoutContext = createContext<ILayoutContext>({
  windowWidth: 0,
  widthAboveMsFit: false,
  widthAboveMsTxDetailsFit: false,
  widthAboveUserStatusDisplayFit: false,
});

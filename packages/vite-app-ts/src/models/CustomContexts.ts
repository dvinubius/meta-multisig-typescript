import { InjectableAbis } from '~~/generated/injectable-abis/injectable-abis.type';
import { MSVaultEntity } from '~~/models/contractFactory/ms-vault-entity.model';
import { TTransactorFunc } from '../eth-components/functions';
import { createContext } from 'react';

export interface InnerAppContext {
  injectableAbis?: InjectableAbis;
  createdContracts?: MSVaultEntity[];
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

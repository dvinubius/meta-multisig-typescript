export interface MSVaultEntity {
  contractId: string;
  address: string;
  name: string;
  createdAt: Date;
  creator: string;
  owners: string[];
  confirmationsRequired: number;
}

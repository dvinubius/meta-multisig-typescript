import { useState, useEffect, useCallback } from 'react';
import { useMoralis } from 'react-moralis';
import { MSVaultEntity } from '~~/models/contractFactory/ms-vault-entity.model';
import { MSFactory } from '../../generated/contract-types/MSFactory';

export const useMultiSigVaults = (
  factory: MSFactory | undefined,
  owner: string | undefined
): { loading: boolean; vaults: MSVaultEntity[] } => {
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<MSVaultEntity[]>([]);
  const { Moralis } = useMoralis();

  const updateVaults = useCallback(
    () => async () => {
      const vaults = await Moralis.Cloud.run('MultiSigVaults', {
        owner,
      });
      setVaults((_) =>
        vaults.map((s: any) => ({
          ...s,
          address: s.contractAddress,
          confirmationsRequired: +s.confirmationsRequired,
        }))
      );
      setLoading(false);
    },
    [Moralis, owner]
  );

  // init & update on owner changes
  useEffect(() => {
    void updateVaults()();
  }, [updateVaults]);

  // update on vault created events
  const [factSubscribed, setFactSubscribed] = useState(false);
  useEffect(() => {
    if (!factory || factSubscribed) return;
    factory?.on('CreateMultiSigVault', (v) => {
      void updateVaults()();
    });
    setFactSubscribed(true);
  }, [factory, factSubscribed, updateVaults]);

  // update on owner change events
  const [ownersSubscribed, setOwnersSubscribed] = useState(false);
  useEffect(() => {
    if (!factory || ownersSubscribed) return;
    factory?.on('Owners', (v) => {
      void updateVaults()();
    });
    setOwnersSubscribed(true);
  }, [factory, ownersSubscribed, updateVaults]);

  return { loading, vaults };
};

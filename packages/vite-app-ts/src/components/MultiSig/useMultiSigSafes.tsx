import { useState, useEffect, useCallback } from 'react';
import { useMoralis } from 'react-moralis';
import { MSSafeEntity } from '~~/models/contractFactory/ms-safe-entity.model';
import { MSFactory } from '../../generated/contract-types/MSFactory';

export const useMultiSigSafes = (
  factory: MSFactory | undefined,
  owner: string | undefined
): { loading: boolean; safes: MSSafeEntity[] } => {
  const [loading, setLoading] = useState(true);
  const [safes, setSafes] = useState<MSSafeEntity[]>([]);
  const { Moralis } = useMoralis();

  const updateSafes = useCallback(
    () => async () => {
      const safes = await Moralis.Cloud.run('MultiSigSafes', {
        owner,
      });
      setSafes((_) =>
        safes.map((s: any) => ({
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
    void updateSafes()();
  }, [updateSafes]);

  // update on safe created events
  const [factSubscribed, setFactSubscribed] = useState(false);
  useEffect(() => {
    if (!factory || factSubscribed) return;
    factory?.on('CreateMultiSigSafe', (v) => {
      void updateSafes()();
    });
    setFactSubscribed(true);
  }, [factory, factSubscribed, updateSafes]);

  // update on owner change events
  const [ownersSubscribed, setOwnersSubscribed] = useState(false);
  useEffect(() => {
    if (!factory || ownersSubscribed) return;
    factory?.on('Owners', (v) => {
      void updateSafes()();
    });
    setOwnersSubscribed(true);
  }, [factory, ownersSubscribed, updateSafes]);

  return { loading, safes };
};

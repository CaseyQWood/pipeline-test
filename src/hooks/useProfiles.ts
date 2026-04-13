import { useState, useEffect, useCallback } from 'react';
import type { AttackProfile, DefenseProfile } from '../types/profiles';
import { getProfileStoreInstance } from '../storage/profileStore';

interface UseProfilesResult {
  attackProfiles: AttackProfile[];
  defenseProfiles: DefenseProfile[];
  loading: boolean;
  saveAttackProfile: (profile: AttackProfile) => Promise<void>;
  saveDefenseProfile: (profile: DefenseProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export function useProfiles(): UseProfilesResult {
  const [attackProfiles, setAttackProfiles] = useState<AttackProfile[]>([]);
  const [defenseProfiles, setDefenseProfiles] = useState<DefenseProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const store = getProfileStoreInstance();

  const loadProfiles = useCallback(async () => {
    try {
      const [attacks, defenses] = await Promise.all([
        store.getAttackProfiles(),
        store.getDefenseProfiles(),
      ]);
      setAttackProfiles(attacks);
      setDefenseProfiles(defenses);
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const saveAttackProfile = useCallback(
    async (profile: AttackProfile) => {
      await store.saveAttackProfile(profile);
      const updated = await store.getAttackProfiles();
      setAttackProfiles(updated);
    },
    [store]
  );

  const saveDefenseProfile = useCallback(
    async (profile: DefenseProfile) => {
      await store.saveDefenseProfile(profile);
      const updated = await store.getDefenseProfiles();
      setDefenseProfiles(updated);
    },
    [store]
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      await store.deleteProfile(id);
      const [attacks, defenses] = await Promise.all([
        store.getAttackProfiles(),
        store.getDefenseProfiles(),
      ]);
      setAttackProfiles(attacks);
      setDefenseProfiles(defenses);
    },
    [store]
  );

  return {
    attackProfiles,
    defenseProfiles,
    loading,
    saveAttackProfile,
    saveDefenseProfile,
    deleteProfile,
  };
}

export default useProfiles;

import type { AttackProfile, DefenseProfile } from '../types/profiles';
import type { IProfileStore } from '../types/storage';

const ATTACK_PROFILES_KEY = 'mathhammer:attack-profiles';
const DEFENSE_PROFILES_KEY = 'mathhammer:defense-profiles';

/**
 * Extends AttackProfile with a lastModified timestamp for future
 * sync conflict resolution (T9: cloud sync).
 */
interface StoredAttackProfile extends AttackProfile {
  lastModified: number;
}

/**
 * Extends DefenseProfile with a lastModified timestamp for future
 * sync conflict resolution (T9: cloud sync).
 */
interface StoredDefenseProfile extends DefenseProfile {
  lastModified: number;
}

function readJSON<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    // Corrupt data — return empty rather than crashing.
    return [];
  }
}

function writeJSON<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * LocalStorageAdapter — offline-first implementation of IProfileStore.
 *
 * All methods return Promises even though the underlying storage is
 * synchronous.  This keeps the interface identical to future async
 * adapters (e.g. a cloud-backed RemoteStorageAdapter for T9) so that
 * consuming code never needs to change.
 *
 * Storage layout:
 *   mathhammer:attack-profiles   → JSON array of StoredAttackProfile
 *   mathhammer:defense-profiles  → JSON array of StoredDefenseProfile
 *
 * Each stored record carries a `lastModified` epoch-ms timestamp that
 * the future sync layer will use for conflict resolution.
 */
export class LocalStorageAdapter implements IProfileStore {
  async getAttackProfiles(): Promise<AttackProfile[]> {
    const stored = readJSON<StoredAttackProfile>(ATTACK_PROFILES_KEY);
    // Strip the storage-internal field before returning to callers.
    return stored.map(({ lastModified: _lm, ...profile }) => profile);
  }

  async getDefenseProfiles(): Promise<DefenseProfile[]> {
    const stored = readJSON<StoredDefenseProfile>(DEFENSE_PROFILES_KEY);
    return stored.map(({ lastModified: _lm, ...profile }) => profile);
  }

  async saveAttackProfile(profile: AttackProfile): Promise<void> {
    const stored = readJSON<StoredAttackProfile>(ATTACK_PROFILES_KEY);
    const now = Date.now();
    const index = stored.findIndex((p) => p.id === profile.id);
    const record: StoredAttackProfile = { ...profile, lastModified: now };

    if (index === -1) {
      stored.push(record);
    } else {
      stored[index] = record;
    }

    writeJSON(ATTACK_PROFILES_KEY, stored);
  }

  async saveDefenseProfile(profile: DefenseProfile): Promise<void> {
    const stored = readJSON<StoredDefenseProfile>(DEFENSE_PROFILES_KEY);
    const now = Date.now();
    const index = stored.findIndex((p) => p.id === profile.id);
    const record: StoredDefenseProfile = { ...profile, lastModified: now };

    if (index === -1) {
      stored.push(record);
    } else {
      stored[index] = record;
    }

    writeJSON(DEFENSE_PROFILES_KEY, stored);
  }

  /**
   * Deletes a profile by id from whichever store it belongs to.
   * Silently succeeds if the id is not found in either store.
   */
  async deleteProfile(id: string): Promise<void> {
    const attackProfiles = readJSON<StoredAttackProfile>(ATTACK_PROFILES_KEY);
    const filteredAttack = attackProfiles.filter((p) => p.id !== id);
    if (filteredAttack.length !== attackProfiles.length) {
      writeJSON(ATTACK_PROFILES_KEY, filteredAttack);
      return;
    }

    const defenseProfiles = readJSON<StoredDefenseProfile>(DEFENSE_PROFILES_KEY);
    const filteredDefense = defenseProfiles.filter((p) => p.id !== id);
    if (filteredDefense.length !== defenseProfiles.length) {
      writeJSON(DEFENSE_PROFILES_KEY, filteredDefense);
    }
  }
}

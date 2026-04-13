import type { AttackProfile, DefenseProfile } from '../types/profiles';
import type { IProfileStore } from '../types/storage';
import { supabase, type SupabaseProfileRow } from '../lib/supabase';

const ATTACK_PROFILES_KEY = 'mathhammer:attack-profiles';
const DEFENSE_PROFILES_KEY = 'mathhammer:defense-profiles';

interface StoredLocalProfile {
  id: string;
  lastModified: number;
  [key: string]: unknown;
}

function readLocalJSON<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeLocalJSON<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * CloudSyncAdapter — dual-write implementation of IProfileStore.
 *
 * Writes to both Supabase and localStorage on every mutation so the app
 * keeps working when offline.  Reads prefer the Supabase source of truth
 * when online; the merge logic in AuthProvider handles reconciliation at
 * login time.
 */
export class CloudSyncAdapter implements IProfileStore {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getAttackProfiles(): Promise<AttackProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.userId)
        .eq('type', 'attack');

      if (error) throw error;

      return (data as SupabaseProfileRow[]).map((row) => row.data as unknown as AttackProfile);
    } catch {
      // Fall back to localStorage when offline
      const stored = readLocalJSON<StoredLocalProfile & AttackProfile>(ATTACK_PROFILES_KEY);
      return stored.map(({ lastModified: _lm, ...profile }) => profile as AttackProfile);
    }
  }

  async getDefenseProfiles(): Promise<DefenseProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.userId)
        .eq('type', 'defense');

      if (error) throw error;

      return (data as SupabaseProfileRow[]).map((row) => row.data as unknown as DefenseProfile);
    } catch {
      // Fall back to localStorage when offline
      const stored = readLocalJSON<StoredLocalProfile & DefenseProfile>(DEFENSE_PROFILES_KEY);
      return stored.map(({ lastModified: _lm, ...profile }) => profile as DefenseProfile);
    }
  }

  async saveAttackProfile(profile: AttackProfile): Promise<void> {
    const now = Date.now();

    // Write to localStorage (dual-write for offline support)
    const stored = readLocalJSON<StoredLocalProfile & AttackProfile>(ATTACK_PROFILES_KEY);
    const index = stored.findIndex((p) => p.id === profile.id);
    const record = { ...profile, lastModified: now };
    if (index === -1) {
      stored.push(record);
    } else {
      stored[index] = record;
    }
    writeLocalJSON(ATTACK_PROFILES_KEY, stored);

    // Write to Supabase
    const row: Omit<SupabaseProfileRow, 'user_id'> & { user_id: string } = {
      id: profile.id,
      user_id: this.userId,
      type: 'attack',
      data: profile as unknown as Record<string, unknown>,
      last_modified: now,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      // Log but don't throw — local write already succeeded
      console.error('[CloudSync] Failed to save attack profile to cloud:', error.message);
    }
  }

  async saveDefenseProfile(profile: DefenseProfile): Promise<void> {
    const now = Date.now();

    // Write to localStorage (dual-write for offline support)
    const stored = readLocalJSON<StoredLocalProfile & DefenseProfile>(DEFENSE_PROFILES_KEY);
    const index = stored.findIndex((p) => p.id === profile.id);
    const record = { ...profile, lastModified: now };
    if (index === -1) {
      stored.push(record);
    } else {
      stored[index] = record;
    }
    writeLocalJSON(DEFENSE_PROFILES_KEY, stored);

    // Write to Supabase
    const row: Omit<SupabaseProfileRow, 'user_id'> & { user_id: string } = {
      id: profile.id,
      user_id: this.userId,
      type: 'defense',
      data: profile as unknown as Record<string, unknown>,
      last_modified: now,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('[CloudSync] Failed to save defense profile to cloud:', error.message);
    }
  }

  async deleteProfile(id: string): Promise<void> {
    // Delete from localStorage
    const attackProfiles = readLocalJSON<StoredLocalProfile & AttackProfile>(ATTACK_PROFILES_KEY);
    const filteredAttack = attackProfiles.filter((p) => p.id !== id);
    if (filteredAttack.length !== attackProfiles.length) {
      writeLocalJSON(ATTACK_PROFILES_KEY, filteredAttack);
    }

    const defenseProfiles = readLocalJSON<StoredLocalProfile & DefenseProfile>(DEFENSE_PROFILES_KEY);
    const filteredDefense = defenseProfiles.filter((p) => p.id !== id);
    if (filteredDefense.length !== defenseProfiles.length) {
      writeLocalJSON(DEFENSE_PROFILES_KEY, filteredDefense);
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId);

    if (error) {
      console.error('[CloudSync] Failed to delete profile from cloud:', error.message);
    }
  }
}

/**
 * Merges local profiles with cloud profiles using last-write-wins strategy.
 * Saves the merged result to both localStorage and Supabase.
 */
export async function mergeLocalAndCloud(userId: string): Promise<void> {
  const now = Date.now();

  // Fetch local profiles (with lastModified)
  const localAttacks = readLocalJSON<StoredLocalProfile & AttackProfile>(ATTACK_PROFILES_KEY);
  const localDefenses = readLocalJSON<StoredLocalProfile & DefenseProfile>(DEFENSE_PROFILES_KEY);

  // Fetch cloud profiles
  let cloudAttacks: SupabaseProfileRow[] = [];
  let cloudDefenses: SupabaseProfileRow[] = [];

  try {
    const { data: attackData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'attack');
    cloudAttacks = (attackData as SupabaseProfileRow[]) ?? [];

    const { data: defenseData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'defense');
    cloudDefenses = (defenseData as SupabaseProfileRow[]) ?? [];
  } catch {
    // If cloud fetch fails, skip merge
    console.error('[CloudSync] Failed to fetch cloud profiles for merge');
    return;
  }

  // Merge attack profiles: last-write-wins by lastModified
  const mergedAttackMap = new Map<string, { profile: AttackProfile; lastModified: number }>();

  for (const local of localAttacks) {
    const { lastModified, ...profile } = local;
    mergedAttackMap.set(local.id, { profile: profile as AttackProfile, lastModified });
  }

  for (const cloud of cloudAttacks) {
    const existing = mergedAttackMap.get(cloud.id);
    if (!existing || cloud.last_modified > existing.lastModified) {
      mergedAttackMap.set(cloud.id, {
        profile: cloud.data as unknown as AttackProfile,
        lastModified: cloud.last_modified,
      });
    }
  }

  // Merge defense profiles: last-write-wins by lastModified
  const mergedDefenseMap = new Map<string, { profile: DefenseProfile; lastModified: number }>();

  for (const local of localDefenses) {
    const { lastModified, ...profile } = local;
    mergedDefenseMap.set(local.id, { profile: profile as DefenseProfile, lastModified });
  }

  for (const cloud of cloudDefenses) {
    const existing = mergedDefenseMap.get(cloud.id);
    if (!existing || cloud.last_modified > existing.lastModified) {
      mergedDefenseMap.set(cloud.id, {
        profile: cloud.data as unknown as DefenseProfile,
        lastModified: cloud.last_modified,
      });
    }
  }

  // Save merged attacks to localStorage
  const mergedAttacks = Array.from(mergedAttackMap.values()).map(({ profile, lastModified }) => ({
    ...profile,
    lastModified,
  }));
  writeLocalJSON(ATTACK_PROFILES_KEY, mergedAttacks);

  // Save merged defenses to localStorage
  const mergedDefenses = Array.from(mergedDefenseMap.values()).map(({ profile, lastModified }) => ({
    ...profile,
    lastModified,
  }));
  writeLocalJSON(DEFENSE_PROFILES_KEY, mergedDefenses);

  // Upsert merged profiles to cloud
  const attackRows: SupabaseProfileRow[] = mergedAttacks.map((p) => {
    const { lastModified, ...profile } = p;
    return {
      id: profile.id,
      user_id: userId,
      type: 'attack' as const,
      data: profile as unknown as Record<string, unknown>,
      last_modified: lastModified,
    };
  });

  const defenseRows: SupabaseProfileRow[] = mergedDefenses.map((p) => {
    const { lastModified, ...profile } = p;
    return {
      id: profile.id,
      user_id: userId,
      type: 'defense' as const,
      data: profile as unknown as Record<string, unknown>,
      last_modified: lastModified,
    };
  });

  const allRows = [...attackRows, ...defenseRows];

  if (allRows.length > 0) {
    const { error } = await supabase
      .from('profiles')
      .upsert(allRows, { onConflict: 'id' });

    if (error) {
      console.error('[CloudSync] Failed to upsert merged profiles to cloud:', error.message);
    }
  }

  // Update lastSynced timestamp
  localStorage.setItem('mathhammer:lastSynced', String(now));
}

import type { AttackProfile, DefenseProfile } from './profiles';

export interface IProfileStore {
  getAttackProfiles(): Promise<AttackProfile[]>;
  getDefenseProfiles(): Promise<DefenseProfile[]>;
  saveAttackProfile(profile: AttackProfile): Promise<void>;
  saveDefenseProfile(profile: DefenseProfile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
}

export type StorageEventType = 'created' | 'updated' | 'deleted';

export interface StorageEvent {
  type: StorageEventType;
  profileId: string;
  profileType: 'attack' | 'defense';
  timestamp: number;
}

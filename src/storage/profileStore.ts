import type { IProfileStore } from '../types/storage';
import { LocalStorageAdapter } from './localStorage';

/**
 * ProfileStore factory.
 *
 * Returns the active IProfileStore adapter.  The indirection here is
 * intentional: when T9 (cloud sync) lands, the factory can accept an
 * adapter argument or inspect runtime configuration to return a
 * RemoteStorageAdapter (or a hybrid) without touching any call sites.
 *
 * Usage:
 *   const store = getProfileStore();
 *   const attacks = await store.getAttackProfiles();
 */
export function getProfileStore(): IProfileStore {
  return new LocalStorageAdapter();
}

/**
 * Singleton accessor — returns the same adapter instance for the
 * lifetime of the module.  Prefer this over getProfileStore() when
 * you want a stable reference (e.g. inside a React context provider).
 */
let _instance: IProfileStore | null = null;

export function getProfileStoreInstance(): IProfileStore {
  if (!_instance) {
    _instance = getProfileStore();
  }
  return _instance;
}

/**
 * Replaces the singleton with a custom adapter.  Primarily intended
 * for testing (inject a mock) or for T9 to swap in a cloud adapter
 * after authentication without reloading the page.
 */
export function setProfileStoreAdapter(adapter: IProfileStore): void {
  _instance = adapter;
}

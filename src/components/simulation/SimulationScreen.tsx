import { useState, useEffect } from 'react';
import type { AttackProfile, DefenseProfile } from '../../types/profiles';
import { getProfileStoreInstance } from '../../storage/profileStore';
import { ProfileCard } from '../profiles/ProfileCard';
import { AttackProfileForm } from '../profiles/AttackProfileForm';
import { DefenseProfileForm } from '../profiles/DefenseProfileForm';

interface SimulationScreenProps {
  selectedAttack: AttackProfile | null;
  selectedDefense: DefenseProfile | null;
  onSelectAttack: (profile: AttackProfile) => void;
  onSelectDefense: (profile: DefenseProfile) => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

interface AttackPanelProps {
  selectedProfile: AttackProfile | null;
  onSelect: (profile: AttackProfile) => void;
}

function AttackPanel({ selectedProfile, onSelect }: AttackPanelProps) {
  const [profiles, setProfiles] = useState<AttackProfile[]>([]);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const store = getProfileStoreInstance();

  useEffect(() => {
    store.getAttackProfiles().then(setProfiles).catch(console.error);
  }, []);

  const handleQuickCreate = async (profile: AttackProfile) => {
    await store.saveAttackProfile(profile);
    const updated = await store.getAttackProfiles();
    setProfiles(updated);
    onSelect(profile);
    setQuickCreateOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Attack Profile
          </h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {selectedProfile ? selectedProfile.name : 'None selected'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setQuickCreateOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            quickCreateOpen
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-[#1a1a2e] border-neutral-700 text-[#9ca3af] hover:text-amber-400 hover:border-amber-700'
          }`}
        >
          <PlusIcon />
          Quick Create
        </button>
      </div>

      {/* Quick create form */}
      {quickCreateOpen && (
        <div className="border border-amber-800/40 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-amber-900/20 border-b border-amber-800/30">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              New Attack Profile
            </span>
            <button
              type="button"
              onClick={() => setQuickCreateOpen(false)}
              className="text-[#9ca3af] hover:text-[#f3f4f6] transition-colors"
              aria-label="Close quick create"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="p-3 bg-[#0f0f1a]">
            <AttackProfileForm onSubmit={handleQuickCreate} />
          </div>
        </div>
      )}

      {/* Saved profiles */}
      {profiles.length === 0 && !quickCreateOpen ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-neutral-700 rounded-lg text-center">
          <p className="text-sm text-[#9ca3af] mb-2">No attack profiles saved yet</p>
          <button
            type="button"
            onClick={() => setQuickCreateOpen(true)}
            className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            Create your first attack profile
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              selected={selectedProfile?.id === profile.id}
              onSelect={(p) => onSelect(p as AttackProfile)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DefensePanelProps {
  selectedProfile: DefenseProfile | null;
  onSelect: (profile: DefenseProfile) => void;
}

function DefensePanel({ selectedProfile, onSelect }: DefensePanelProps) {
  const [profiles, setProfiles] = useState<DefenseProfile[]>([]);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const store = getProfileStoreInstance();

  useEffect(() => {
    store.getDefenseProfiles().then(setProfiles).catch(console.error);
  }, []);

  const handleQuickCreate = async (profile: DefenseProfile) => {
    await store.saveDefenseProfile(profile);
    const updated = await store.getDefenseProfiles();
    setProfiles(updated);
    onSelect(profile);
    setQuickCreateOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Defense Profile
          </h2>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {selectedProfile ? selectedProfile.name : 'None selected'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setQuickCreateOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            quickCreateOpen
              ? 'bg-cyan-700 border-cyan-600 text-white'
              : 'bg-[#1a1a2e] border-neutral-700 text-[#9ca3af] hover:text-cyan-400 hover:border-cyan-700'
          }`}
        >
          <PlusIcon />
          Quick Create
        </button>
      </div>

      {/* Quick create form */}
      {quickCreateOpen && (
        <div className="border border-cyan-800/40 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-cyan-900/20 border-b border-cyan-800/30">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
              New Defense Profile
            </span>
            <button
              type="button"
              onClick={() => setQuickCreateOpen(false)}
              className="text-[#9ca3af] hover:text-[#f3f4f6] transition-colors"
              aria-label="Close quick create"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="p-3 bg-[#0f0f1a]">
            <DefenseProfileForm onSubmit={handleQuickCreate} />
          </div>
        </div>
      )}

      {/* Saved profiles */}
      {profiles.length === 0 && !quickCreateOpen ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-neutral-700 rounded-lg text-center">
          <p className="text-sm text-[#9ca3af] mb-2">No defense profiles saved yet</p>
          <button
            type="button"
            onClick={() => setQuickCreateOpen(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          >
            Create your first defense profile
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              selected={selectedProfile?.id === profile.id}
              onSelect={(p) => onSelect(p as DefenseProfile)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SimulationScreen({
  selectedAttack,
  selectedDefense,
  onSelectAttack,
  onSelectDefense,
}: SimulationScreenProps) {
  const [attackExpanded, setAttackExpanded] = useState(true);
  const [defenseExpanded, setDefenseExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-32">
      {/* Attack panel */}
      <div className="rounded-xl border border-[#2e303a] bg-[#1a1a2e] overflow-hidden">
        <button
          type="button"
          onClick={() => setAttackExpanded((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1a2e] hover:bg-[#20203a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-800/50">
              ATK
            </span>
            <span className="text-sm font-semibold text-[#f3f4f6]">
              {selectedAttack ? selectedAttack.name : 'Select Attack Profile'}
            </span>
            {selectedAttack && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </div>
          <ChevronIcon open={attackExpanded} />
        </button>
        {attackExpanded && (
          <div className="px-4 pb-4 border-t border-[#2e303a]">
            <div className="pt-4">
              <AttackPanel selectedProfile={selectedAttack} onSelect={onSelectAttack} />
            </div>
          </div>
        )}
      </div>

      {/* Defense panel */}
      <div className="rounded-xl border border-[#2e303a] bg-[#1a1a2e] overflow-hidden">
        <button
          type="button"
          onClick={() => setDefenseExpanded((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1a2e] hover:bg-[#20203a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-400 border border-cyan-800/50">
              DEF
            </span>
            <span className="text-sm font-semibold text-[#f3f4f6]">
              {selectedDefense ? selectedDefense.name : 'Select Defense Profile'}
            </span>
            {selectedDefense && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </div>
          <ChevronIcon open={defenseExpanded} />
        </button>
        {defenseExpanded && (
          <div className="px-4 pb-4 border-t border-[#2e303a]">
            <div className="pt-4">
              <DefensePanel selectedProfile={selectedDefense} onSelect={onSelectDefense} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulationScreen;

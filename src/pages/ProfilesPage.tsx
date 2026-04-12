import { useState } from 'react';
import type { AttackProfile, DefenseProfile } from '../types/profiles';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileSelector } from '../components/profiles/ProfileSelector';
import { AttackProfileForm } from '../components/profiles/AttackProfileForm';
import { DefenseProfileForm } from '../components/profiles/DefenseProfileForm';

type Tab = 'attack' | 'defense';
type FormMode = 'add' | 'edit';

export default function ProfilesPage() {
  const {
    attackProfiles,
    defenseProfiles,
    loading,
    saveAttackProfile,
    saveDefenseProfile,
    deleteProfile,
  } = useProfiles();

  const [activeTab, setActiveTab] = useState<Tab>('attack');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [editingAttack, setEditingAttack] = useState<AttackProfile | undefined>(undefined);
  const [editingDefense, setEditingDefense] = useState<DefenseProfile | undefined>(undefined);

  const handleAddProfile = () => {
    setEditingAttack(undefined);
    setEditingDefense(undefined);
    setFormMode('add');
    setShowForm(true);
  };

  const handleEditAttack = (profile: AttackProfile) => {
    setEditingAttack(profile);
    setEditingDefense(undefined);
    setFormMode('edit');
    setActiveTab('attack');
    setShowForm(true);
  };

  const handleEditDefense = (profile: DefenseProfile) => {
    setEditingDefense(profile);
    setEditingAttack(undefined);
    setFormMode('edit');
    setActiveTab('defense');
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAttack(undefined);
    setEditingDefense(undefined);
  };

  const handleSubmitAttack = async (profile: AttackProfile) => {
    await saveAttackProfile(profile);
    setShowForm(false);
    setEditingAttack(undefined);
  };

  const handleSubmitDefense = async (profile: DefenseProfile) => {
    await saveDefenseProfile(profile);
    setShowForm(false);
    setEditingDefense(undefined);
  };

  const handleDelete = async (id: string) => {
    await deleteProfile(id);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (showForm && formMode === 'add') {
      setShowForm(false);
    }
  };

  const currentProfiles = activeTab === 'attack' ? attackProfiles : defenseProfiles;
  const emptyMessage =
    activeTab === 'attack'
      ? 'No attack profiles yet. Create your first one!'
      : 'No defense profiles yet. Create your first one!';

  return (
    <div className="min-h-full" style={{ backgroundColor: '#0f0f1a' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#f3f4f6' }}>
            Profiles
          </h1>
          {!showForm && (
            <button
              type="button"
              onClick={handleAddProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#c9a84c', color: '#0f0f1a' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d4b55d';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c9a84c';
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Profile
            </button>
          )}
          {showForm && (
            <button
              type="button"
              onClick={handleCancelForm}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex rounded-lg overflow-hidden border border-neutral-700 mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('attack')}
            className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'attack'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
            }`}
          >
            Attack
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('defense')}
            className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'defense'
                ? 'bg-cyan-700 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
            }`}
          >
            Defense
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-6">
            {activeTab === 'attack' ? (
              <AttackProfileForm
                key={editingAttack?.id ?? 'new-attack'}
                initialProfile={editingAttack}
                onSubmit={handleSubmitAttack}
              />
            ) : (
              <DefenseProfileForm
                key={editingDefense?.id ?? 'new-defense'}
                initialProfile={editingDefense}
                onSubmit={handleSubmitDefense}
              />
            )}
          </div>
        )}

        {/* Profile List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-neutral-600 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ProfileSelector
            profiles={currentProfiles}
            emptyMessage={emptyMessage}
            onEdit={(profile) => {
              if ('hitRoll' in profile) {
                handleEditAttack(profile as AttackProfile);
              } else {
                handleEditDefense(profile as DefenseProfile);
              }
            }}
            onDelete={handleDelete}
          />
        )}

        {/* Empty state CTA */}
        {!loading && !showForm && currentProfiles.length === 0 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleAddProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold border transition-colors"
              style={{ borderColor: '#c9a84c', color: '#c9a84c' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(201,168,76,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create your first{' '}
              {activeTab === 'attack' ? 'attack' : 'defense'} profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import type { AttackProfile, DefenseProfile } from '../../types/profiles';
import { ProfileCard } from './ProfileCard';

type Profile = AttackProfile | DefenseProfile;

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedId?: string;
  emptyMessage?: string;
  onSelect?: (profile: Profile) => void;
  onEdit?: (profile: Profile) => void;
  onDelete?: (id: string) => void;
}

export function ProfileSelector({
  profiles,
  selectedId,
  emptyMessage = 'No profiles yet.',
  onSelect,
  onEdit,
  onDelete,
}: ProfileSelectorProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-neutral-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          selected={selectedId === profile.id}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ProfileSelector;

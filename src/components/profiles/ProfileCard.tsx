import type { AttackProfile, DefenseProfile, DiceExpression } from '../../types/profiles';

type Profile = AttackProfile | DefenseProfile;

interface ProfileCardProps {
  profile: Profile;
  selected?: boolean;
  onSelect?: (profile: Profile) => void;
  onEdit?: (profile: Profile) => void;
  onDelete?: (id: string) => void;
}

function isAttackProfile(profile: Profile): profile is AttackProfile {
  return 'hitRoll' in profile;
}

function isDiceExpression(val: number | DiceExpression): val is DiceExpression {
  return typeof val === 'object' && val !== null;
}

function formatDiceValue(val: number | DiceExpression): string {
  if (isDiceExpression(val)) {
    const base = val.dice === 1 ? `D${val.sides}` : `${val.dice}D${val.sides}`;
    if (val.modifier > 0) return `${base}+${val.modifier}`;
    if (val.modifier < 0) return `${base}${val.modifier}`;
    return base;
  }
  return String(val);
}

interface StatPillProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

function StatPill({ label, value, accent = false }: StatPillProps) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-1 rounded bg-neutral-800 min-w-[40px]">
      <span className={`text-sm font-bold font-mono leading-tight ${accent ? 'text-amber-400' : 'text-neutral-100'}`}>
        {value}
      </span>
      <span className="text-[10px] text-neutral-500 uppercase tracking-wide leading-tight">{label}</span>
    </div>
  );
}

function AttackProfileCardBody({ profile }: { profile: AttackProfile }) {
  const activeModifiers: string[] = [];
  const m = profile.modifiers;
  if (m.torrent) activeModifiers.push('Torrent');
  if (m.lethalHits) activeModifiers.push('Lethal');
  if (m.sustainedHits > 0) activeModifiers.push(`Sus.${m.sustainedHits}`);
  if (m.devastatingWounds) activeModifiers.push('DevW');
  if (m.blast) activeModifiers.push('Blast');
  if (m.twinLinked) activeModifiers.push('Twin');
  if (m.rerollHits !== 'none') activeModifiers.push(`RH:${m.rerollHits}`);
  if (m.rerollWounds !== 'none') activeModifiers.push(`RW:${m.rerollWounds}`);
  if (m.antiKeyword !== null) activeModifiers.push(`Anti:${m.antiKeyword}+`);
  if (m.criticalHitThreshold !== 6) activeModifiers.push(`CH:${m.criticalHitThreshold}`);
  if (m.criticalWoundThreshold !== 6) activeModifiers.push(`CW:${m.criticalWoundThreshold}`);

  return (
    <>
      <div className="flex flex-wrap gap-1.5 items-center">
        <StatPill label="A" value={formatDiceValue(profile.attacks)} accent />
        <StatPill label="BS" value={`${profile.hitRoll}+`} />
        <StatPill label="S" value={profile.strength} />
        <StatPill label="AP" value={profile.ap === 0 ? '0' : `${profile.ap}`} />
        <StatPill label="D" value={formatDiceValue(profile.damage)} accent />
      </div>
      {activeModifiers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {activeModifiers.map((mod) => (
            <span
              key={mod}
              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/50 font-medium"
            >
              {mod}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function DefenseProfileCardBody({ profile }: { profile: DefenseProfile }) {
  const activeModifiers: string[] = [];
  if (profile.modifiers.coverBonus) activeModifiers.push('Cover');
  if (profile.modifiers.stealth) activeModifiers.push('Stealth');

  return (
    <>
      <div className="flex flex-wrap gap-1.5 items-center">
        <StatPill label="T" value={profile.toughness} accent />
        <StatPill label="Sv" value={`${profile.save}+`} />
        <StatPill label="W" value={profile.wounds} />
        {profile.modelCount > 1 && <StatPill label="N" value={`×${profile.modelCount}`} />}
        {profile.invulnerableSave !== null && (
          <StatPill label="Inv" value={`${profile.invulnerableSave}++`} accent />
        )}
        {profile.feelNoPain !== null && (
          <StatPill label="FNP" value={`${profile.feelNoPain}+++`} />
        )}
      </div>
      {activeModifiers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {activeModifiers.map((mod) => (
            <span
              key={mod}
              className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-800/50 font-medium"
            >
              {mod}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export function ProfileCard({ profile, selected = false, onSelect, onEdit, onDelete }: ProfileCardProps) {
  const isAttack = isAttackProfile(profile);

  const accentColor = isAttack ? 'amber' : 'cyan';
  const borderClass = selected
    ? `border-${accentColor}-500`
    : `border-neutral-700 hover:border-neutral-500`;

  const handleCardClick = () => {
    onSelect?.(profile);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      onSelect(profile);
    }
  };

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleCardClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      className={`relative bg-neutral-900 border rounded-lg p-3 transition-colors ${borderClass} ${
        onSelect ? 'cursor-pointer' : ''
      } ${selected ? `ring-1 ring-${accentColor}-500/50` : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              isAttack
                ? 'bg-amber-900/50 text-amber-400 border border-amber-800/50'
                : 'bg-cyan-900/50 text-cyan-400 border border-cyan-800/50'
            }`}
          >
            {isAttack ? 'ATK' : 'DEF'}
          </span>
          <span className="text-sm font-semibold text-neutral-100 truncate">{profile.name}</span>
        </div>

        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
                className="w-8 h-8 flex items-center justify-center rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                aria-label={`Edit ${profile.name}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                className="w-8 h-8 flex items-center justify-center rounded bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 transition-colors"
                aria-label={`Delete ${profile.name}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {isAttack ? (
        <AttackProfileCardBody profile={profile} />
      ) : (
        <DefenseProfileCardBody profile={profile as DefenseProfile} />
      )}

      {/* Selected indicator */}
      {selected && (
        <div
          className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
            isAttack ? 'bg-amber-400' : 'bg-cyan-400'
          }`}
        />
      )}
    </div>
  );
}

export default ProfileCard;

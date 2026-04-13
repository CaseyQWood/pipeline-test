import { useState } from 'react';
import type {
  AttackProfile,
  AttackModifiers,
  DiceExpression,
} from '../../types/profiles';

interface AttackProfileFormProps {
  initialProfile?: AttackProfile;
  onSubmit: (profile: AttackProfile) => void;
}

const defaultModifiers: AttackModifiers = {
  torrent: false,
  lethalHits: false,
  sustainedHits: 0,
  devastatingWounds: false,
  rerollHits: 'none',
  rerollWounds: 'none',
  criticalHitThreshold: 6,
  criticalWoundThreshold: 6,
  blast: false,
  twinLinked: false,
  antiKeyword: null,
};

function isDiceExpression(val: number | DiceExpression): val is DiceExpression {
  return typeof val === 'object' && val !== null;
}

interface NumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  className?: string;
}

function NumberStepper({ label, value, min, max, onChange, className = '' }: NumberStepperProps) {
  const decrement = () => {
    const next = value - 1;
    if (min === undefined || next >= min) onChange(next);
  };
  const increment = () => {
    const next = value + 1;
    if (max === undefined || next <= max) onChange(next);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{label}</label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrement}
          className="w-11 h-11 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 rounded-l-md text-lg font-bold select-none transition-colors"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) {
              if ((min === undefined || v >= min) && (max === undefined || v <= max)) {
                onChange(v);
              }
            }
          }}
          className="w-12 h-11 text-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono focus:outline-none focus:bg-neutral-750 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={increment}
          className="w-11 h-11 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 rounded-r-md text-lg font-bold select-none transition-colors"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none min-h-[44px]">
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(!checked); }}
        className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
          checked ? 'bg-amber-500' : 'bg-neutral-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
      <span className="text-sm text-neutral-200">{label}</span>
    </label>
  );
}

interface DiceInputProps {
  label: string;
  value: number | DiceExpression;
  onChange: (val: number | DiceExpression) => void;
  fixedMin?: number;
}

function DiceInput({ label, value, onChange, fixedMin = 1 }: DiceInputProps) {
  const isDice = isDiceExpression(value);

  const toggleMode = () => {
    if (isDice) {
      onChange(value.dice * value.sides + value.modifier || fixedMin);
    } else {
      onChange({ dice: 1, sides: 6, modifier: 0 });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{label}</span>
        <button
          type="button"
          onClick={toggleMode}
          className="ml-auto text-xs px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-colors border border-neutral-600"
        >
          {isDice ? 'Fixed' : 'Dice'}
        </button>
      </div>
      {isDice ? (
        <div className="flex items-center gap-1">
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs text-neutral-500">Count</span>
            <div className="flex items-center">
              <button type="button" onClick={() => onChange({ ...(value as DiceExpression), dice: Math.max(1, (value as DiceExpression).dice - 1) })} className="w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-l text-base font-bold select-none">−</button>
              <span className="w-8 h-9 flex items-center justify-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono">{(value as DiceExpression).dice}</span>
              <button type="button" onClick={() => onChange({ ...(value as DiceExpression), dice: (value as DiceExpression).dice + 1 })} className="w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-r text-base font-bold select-none">+</button>
            </div>
          </div>
          <span className="text-neutral-500 font-bold mt-4">D</span>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs text-neutral-500">Sides</span>
            <div className="flex items-center">
              <button type="button" onClick={() => onChange({ ...(value as DiceExpression), sides: Math.max(2, (value as DiceExpression).sides - 1) })} className="w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-l text-base font-bold select-none">−</button>
              <span className="w-8 h-9 flex items-center justify-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono">{(value as DiceExpression).sides}</span>
              <button type="button" onClick={() => onChange({ ...(value as DiceExpression), sides: (value as DiceExpression).sides + 1 })} className="w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-r text-base font-bold select-none">+</button>
            </div>
          </div>
          <span className="text-neutral-500 font-bold mt-4">+</span>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs text-neutral-500">Mod</span>
            <div className="flex items-center">
              <button type="button" onClick={() => onChange({ ...(value as DiceExpression), modifier: (value as DiceExpression).modifier - 1 })} className="w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-l text-base font-bold select-none">−</button>
              <span className="w-8 h-9 flex items-center justify-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono">{(value as DiceExpression).modifier}</span>
              <button type="button" onClick={() => onChange({ ...(value as DiceExpression), modifier: (value as DiceExpression).modifier + 1 })} className="w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-r text-base font-bold select-none">+</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <button type="button" onClick={() => onChange(Math.max(fixedMin, (value as number) - 1))} className="w-11 h-11 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 rounded-l-md text-lg font-bold select-none transition-colors">−</button>
          <input
            type="number"
            value={value as number}
            min={fixedMin}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= fixedMin) onChange(v); }}
            className="w-12 h-11 text-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" onClick={() => onChange((value as number) + 1)} className="w-11 h-11 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 rounded-r-md text-lg font-bold select-none transition-colors">+</button>
        </div>
      )}
    </div>
  );
}

type RerollOption = 'none' | 'ones' | 'all';

interface RerollSelectProps {
  label: string;
  value: RerollOption;
  onChange: (val: RerollOption) => void;
}

function RerollSelect({ label, value, onChange }: RerollSelectProps) {
  const options: { value: RerollOption; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'ones', label: 'Ones' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{label}</label>
      <div className="flex rounded-md overflow-hidden border border-neutral-600">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 h-11 text-sm font-medium transition-colors ${
              value === opt.value
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AttackProfileForm({ initialProfile, onSubmit }: AttackProfileFormProps) {
  const [name, setName] = useState(initialProfile?.name ?? '');
  const [attacks, setAttacks] = useState<number | DiceExpression>(initialProfile?.attacks ?? 1);
  const [hitRoll, setHitRoll] = useState(initialProfile?.hitRoll ?? 3);
  const [strength, setStrength] = useState(initialProfile?.strength ?? 4);
  const [ap, setAp] = useState(initialProfile?.ap ?? 0);
  const [damage, setDamage] = useState<number | DiceExpression>(initialProfile?.damage ?? 1);
  const [modifiers, setModifiers] = useState<AttackModifiers>(
    initialProfile?.modifiers ?? { ...defaultModifiers }
  );
  const [modifiersOpen, setModifiersOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setMod = <K extends keyof AttackModifiers>(key: K, value: AttackModifiers[K]) => {
    setModifiers((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (hitRoll < 2 || hitRoll > 6) newErrors.hitRoll = 'Hit roll must be 2–6';
    if (strength < 1) newErrors.strength = 'Strength must be ≥1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const profile: AttackProfile = {
      id: initialProfile?.id ?? crypto.randomUUID(),
      name: name.trim(),
      attacks,
      hitRoll,
      strength,
      ap,
      damage,
      modifiers,
    };
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-lg p-4 space-y-4 text-neutral-100">
      <h2 className="text-base font-semibold text-amber-400 uppercase tracking-wider">
        {initialProfile ? 'Edit Attack Profile' : 'New Attack Profile'}
      </h2>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="attack-name" className="text-xs text-neutral-400 font-medium uppercase tracking-wide">
          Profile Name
        </label>
        <input
          id="attack-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Intercessors"
          className={`h-11 px-3 bg-neutral-800 border rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${
            errors.name ? 'border-red-500' : 'border-neutral-600'
          }`}
        />
        {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
      </div>

      {/* Core stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <DiceInput label="Attacks" value={attacks} onChange={setAttacks} fixedMin={1} />
        <NumberStepper
          label={`Hit Roll (${errors.hitRoll ? '!' : '2–6'})`}
          value={hitRoll}
          min={2}
          max={6}
          onChange={setHitRoll}
        />
        {errors.hitRoll && <span className="col-span-2 text-xs text-red-400 -mt-2">{errors.hitRoll}</span>}
        <NumberStepper label="Strength" value={strength} min={1} onChange={setStrength} />
        <NumberStepper label="AP" value={ap} min={-6} max={0} onChange={setAp} />
        <div className="col-span-2">
          <DiceInput label="Damage" value={damage} onChange={setDamage} fixedMin={1} />
        </div>
      </div>

      {/* Modifiers (collapsible) */}
      <div className="border border-neutral-700 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setModifiersOpen(!modifiersOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-sm font-medium text-neutral-300 transition-colors"
        >
          <span>Modifiers</span>
          <svg
            className={`w-4 h-4 transition-transform ${modifiersOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {modifiersOpen && (
          <div className="p-3 space-y-3 bg-neutral-900">
            {/* Toggles */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Toggle label="Torrent" checked={modifiers.torrent} onChange={(v) => setMod('torrent', v)} />
              <Toggle label="Lethal Hits" checked={modifiers.lethalHits} onChange={(v) => setMod('lethalHits', v)} />
              <Toggle label="Dev. Wounds" checked={modifiers.devastatingWounds} onChange={(v) => setMod('devastatingWounds', v)} />
              <Toggle label="Blast" checked={modifiers.blast} onChange={(v) => setMod('blast', v)} />
              <Toggle label="Twin-Linked" checked={modifiers.twinLinked} onChange={(v) => setMod('twinLinked', v)} />
            </div>

            {/* Sustained Hits */}
            <NumberStepper
              label="Sustained Hits"
              value={modifiers.sustainedHits}
              min={0}
              max={6}
              onChange={(v) => setMod('sustainedHits', v)}
            />

            {/* Rerolls */}
            <RerollSelect
              label="Reroll Hits"
              value={modifiers.rerollHits}
              onChange={(v) => setMod('rerollHits', v)}
            />
            <RerollSelect
              label="Reroll Wounds"
              value={modifiers.rerollWounds}
              onChange={(v) => setMod('rerollWounds', v)}
            />

            {/* Critical thresholds */}
            <div className="grid grid-cols-2 gap-3">
              <NumberStepper
                label="Crit Hit"
                value={modifiers.criticalHitThreshold}
                min={2}
                max={6}
                onChange={(v) => setMod('criticalHitThreshold', v)}
              />
              <NumberStepper
                label="Crit Wound"
                value={modifiers.criticalWoundThreshold}
                min={2}
                max={6}
                onChange={(v) => setMod('criticalWoundThreshold', v)}
              />
            </div>

            {/* Anti-keyword */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Anti-Keyword</span>
                <Toggle
                  label={modifiers.antiKeyword !== null ? 'Enabled' : 'Disabled'}
                  checked={modifiers.antiKeyword !== null}
                  onChange={(v) => setMod('antiKeyword', v ? 4 : null)}
                />
              </div>
              {modifiers.antiKeyword !== null && (
                <NumberStepper
                  label="Wound On"
                  value={modifiers.antiKeyword}
                  min={2}
                  max={6}
                  onChange={(v) => setMod('antiKeyword', v)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full h-11 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold rounded-md transition-colors text-sm uppercase tracking-wider"
      >
        {initialProfile ? 'Update Profile' : 'Add Profile'}
      </button>
    </form>
  );
}

export default AttackProfileForm;

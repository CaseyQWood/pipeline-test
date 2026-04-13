import { useState } from 'react';
import type { DefenseProfile, DefenseModifiers } from '../../types/profiles';

interface DefenseProfileFormProps {
  initialProfile?: DefenseProfile;
  onSubmit: (profile: DefenseProfile) => void;
}

const defaultModifiers: DefenseModifiers = {
  coverBonus: false,
  stealth: false,
};

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
          className="w-12 h-11 text-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
        className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
          checked ? 'bg-cyan-500' : 'bg-neutral-600'
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

interface OptionalNumberProps {
  label: string;
  value: number | null;
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange: (val: number | null) => void;
}

function OptionalNumberStepper({ label, value, min, max, defaultValue = 4, onChange }: OptionalNumberProps) {
  const enabled = value !== null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{label}</span>
        <Toggle
          label={enabled ? 'Enabled' : 'Disabled'}
          checked={enabled}
          onChange={(v) => onChange(v ? defaultValue : null)}
        />
      </div>
      {enabled && value !== null && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => { if (min === undefined || value - 1 >= min) onChange(value - 1); }}
            className="w-11 h-11 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 rounded-l-md text-lg font-bold select-none transition-colors"
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
              if (!isNaN(v) && (min === undefined || v >= min) && (max === undefined || v <= max)) {
                onChange(v);
              }
            }}
            className="w-12 h-11 text-center bg-neutral-800 border-y border-neutral-600 text-neutral-100 text-sm font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => { if (max === undefined || value + 1 <= max) onChange(value + 1); }}
            className="w-11 h-11 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-neutral-200 rounded-r-md text-lg font-bold select-none transition-colors"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export function DefenseProfileForm({ initialProfile, onSubmit }: DefenseProfileFormProps) {
  const [name, setName] = useState(initialProfile?.name ?? '');
  const [toughness, setToughness] = useState(initialProfile?.toughness ?? 4);
  const [save, setSave] = useState(initialProfile?.save ?? 3);
  const [wounds, setWounds] = useState(initialProfile?.wounds ?? 1);
  const [invulnerableSave, setInvulnerableSave] = useState<number | null>(
    initialProfile?.invulnerableSave ?? null
  );
  const [feelNoPain, setFeelNoPain] = useState<number | null>(
    initialProfile?.feelNoPain ?? null
  );
  const [modelCount, setModelCount] = useState(initialProfile?.modelCount ?? 1);
  const [modifiers, setModifiers] = useState<DefenseModifiers>(
    initialProfile?.modifiers ?? { ...defaultModifiers }
  );
  const [modifiersOpen, setModifiersOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setMod = <K extends keyof DefenseModifiers>(key: K, value: DefenseModifiers[K]) => {
    setModifiers((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (toughness < 1) newErrors.toughness = 'Toughness must be ≥1';
    if (save < 2 || save > 7) newErrors.save = 'Save must be 2–7';
    if (invulnerableSave !== null && (invulnerableSave < 2 || invulnerableSave > 6)) {
      newErrors.invulnerableSave = 'Invuln save must be 2–6';
    }
    if (feelNoPain !== null && (feelNoPain < 2 || feelNoPain > 6)) {
      newErrors.feelNoPain = 'Feel No Pain must be 2–6';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const profile: DefenseProfile = {
      id: initialProfile?.id ?? crypto.randomUUID(),
      name: name.trim(),
      toughness,
      save,
      wounds,
      invulnerableSave,
      feelNoPain,
      modelCount,
      modifiers,
    };
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-lg p-4 space-y-4 text-neutral-100">
      <h2 className="text-base font-semibold text-cyan-400 uppercase tracking-wider">
        {initialProfile ? 'Edit Defense Profile' : 'New Defense Profile'}
      </h2>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="defense-name" className="text-xs text-neutral-400 font-medium uppercase tracking-wide">
          Profile Name
        </label>
        <input
          id="defense-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Intercessors"
          className={`h-11 px-3 bg-neutral-800 border rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
            errors.name ? 'border-red-500' : 'border-neutral-600'
          }`}
        />
        {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
      </div>

      {/* Core stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <NumberStepper
          label="Toughness"
          value={toughness}
          min={1}
          onChange={setToughness}
        />
        {errors.toughness && <span className="col-span-2 text-xs text-red-400 -mt-2">{errors.toughness}</span>}

        <NumberStepper
          label={`Save (${errors.save ? '!' : '2–7'})+`}
          value={save}
          min={2}
          max={7}
          onChange={setSave}
        />
        {errors.save && <span className="col-span-2 text-xs text-red-400 -mt-2">{errors.save}</span>}

        <NumberStepper
          label="Wounds (W)"
          value={wounds}
          min={1}
          onChange={setWounds}
        />
        <NumberStepper
          label="Model Count"
          value={modelCount}
          min={1}
          onChange={setModelCount}
        />
      </div>

      {/* Optional saves */}
      <div className="space-y-3">
        <OptionalNumberStepper
          label="Invulnerable Save"
          value={invulnerableSave}
          min={2}
          max={6}
          defaultValue={4}
          onChange={setInvulnerableSave}
        />
        {errors.invulnerableSave && (
          <span className="text-xs text-red-400">{errors.invulnerableSave}</span>
        )}

        <OptionalNumberStepper
          label="Feel No Pain"
          value={feelNoPain}
          min={2}
          max={6}
          defaultValue={5}
          onChange={setFeelNoPain}
        />
        {errors.feelNoPain && (
          <span className="text-xs text-red-400">{errors.feelNoPain}</span>
        )}
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
          <div className="p-3 space-y-2 bg-neutral-900">
            <Toggle label="Cover Bonus (+1 Save)" checked={modifiers.coverBonus} onChange={(v) => setMod('coverBonus', v)} />
            <Toggle label="Stealth (-1 to Hit vs Ranged)" checked={modifiers.stealth} onChange={(v) => setMod('stealth', v)} />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full h-11 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white font-semibold rounded-md transition-colors text-sm uppercase tracking-wider"
      >
        {initialProfile ? 'Update Profile' : 'Add Profile'}
      </button>
    </form>
  );
}

export default DefenseProfileForm;

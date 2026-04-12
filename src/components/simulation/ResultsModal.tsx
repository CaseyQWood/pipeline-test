import { useEffect, useCallback } from 'react';
import type { SimulationResult } from '../../types/simulation';
import { WoundChart } from './WoundChart';

interface ResultsModalProps {
  result: SimulationResult | null;
  onClose: () => void;
}

export function ResultsModal({ result, onClose }: ResultsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!result) return;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [result, handleKeyDown]);

  if (!result) return null;

  const { median, mean, p10, p90, totalIterations, config } = result;
  const modelWounds = config.defenseProfile.wounds;
  const modelsKilled = modelWounds > 0 ? Math.floor(median / modelWounds) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-[fadeIn_150ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-[#1a1a2e] border border-[#2e303a] shadow-2xl animate-[slideUp_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e303a]">
          <h2 className="text-lg font-semibold text-[#f3f4f6]">
            Simulation Results
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#2e303a] transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Chart */}
        <div className="px-5 py-4">
          <WoundChart result={result} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          <StatCard label="Median Wounds" value={median.toString()} />
          <StatCard label="Mean Wounds" value={mean.toFixed(1)} />
          <StatCard
            label="80% Confidence"
            value={`${p10}–${p90}`}
          />
          <StatCard
            label="Models Killed (median)"
            value={modelsKilled.toString()}
          />
          <StatCard
            label="Simulations"
            value={totalIterations.toLocaleString()}
            span2
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  span2 = false,
}: {
  label: string;
  value: string;
  span2?: boolean;
}) {
  return (
    <div
      className={`rounded-lg bg-[#0f0f1a] border border-[#2e303a] px-4 py-3 ${span2 ? 'col-span-2' : ''}`}
    >
      <div className="text-xs text-[#9ca3af] mb-1">{label}</div>
      <div className="text-xl font-bold text-[#c9a84c]">{value}</div>
    </div>
  );
}

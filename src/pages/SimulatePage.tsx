import { useState, useEffect } from 'react';
import type { AttackProfile, DefenseProfile } from '../types/profiles';
import { SimulationScreen } from '../components/simulation/SimulationScreen';
import { ResultsModal } from '../components/simulation/ResultsModal';
import { useSimulation } from '../hooks/useSimulation';

function SpinnerIcon() {
  return (
    <svg
      className="w-5 h-5 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function SimulatePage() {
  const [selectedAttack, setSelectedAttack] = useState<AttackProfile | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<DefenseProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { result, loading, error, simulate } = useSimulation();

  // Auto-open modal when a new result arrives
  useEffect(() => {
    if (result) {
      setModalOpen(true);
    }
  }, [result]);

  const canSimulate = selectedAttack !== null && selectedDefense !== null;

  const handleSimulate = async () => {
    if (!canSimulate) return;
    await simulate({
      attackProfile: selectedAttack,
      defenseProfile: selectedDefense,
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0f0f1a]">
      {/* Page header */}
      <div className="sticky top-0 z-10 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[#2e303a] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-[#f3f4f6] uppercase tracking-wider">
              Mathhammer
            </h1>
            <p className="text-xs text-[#9ca3af]">Warhammer 40k simulation</p>
          </div>
          {result && !loading && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-md bg-[#1a1a2e] border border-[#2e303a] text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors font-medium"
            >
              View Results
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <SimulationScreen
        selectedAttack={selectedAttack}
        selectedDefense={selectedDefense}
        onSelectAttack={setSelectedAttack}
        onSelectDefense={setSelectedDefense}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0f0f1a]/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#1a1a2e] border border-[#2e303a] shadow-2xl">
            <div className="text-[#c9a84c]">
              <SpinnerIcon />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#f3f4f6]">
                Simulating 25,000 battles...
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">
                Crunching the dice rolls
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && !loading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg bg-red-900/90 border border-red-700 text-sm text-red-200 shadow-xl">
          <span className="font-medium">Simulation failed:</span> {error}
        </div>
      )}

      {/* Fixed simulate button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f0f1a]/95 backdrop-blur-sm border-t border-[#2e303a] px-4 py-3 safe-area-inset-bottom md:pl-20">
        <div className="max-w-lg mx-auto">
          {!canSimulate && (
            <p className="text-xs text-center text-[#9ca3af] mb-2">
              Select both profiles to run the simulation
            </p>
          )}
          <button
            type="button"
            onClick={handleSimulate}
            disabled={!canSimulate || loading}
            className={`w-full h-12 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
              canSimulate && !loading
                ? 'bg-[#8b0000] hover:bg-[#a00000] active:bg-[#700000] text-white shadow-lg shadow-[#8b0000]/30'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon />
                Simulating...
              </span>
            ) : (
              'Simulate'
            )}
          </button>
        </div>
      </div>

      {/* Results modal */}
      <ResultsModal
        result={modalOpen ? result : null}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

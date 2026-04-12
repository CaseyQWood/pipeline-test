import type { SimulationConfig, SimulationResult, WoundDistribution } from '../types/simulation';
import { runCombatPass } from './combat';

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

/**
 * Given a sorted array of numbers, return the value at the given percentile (0–100).
 * Uses nearest-rank method.
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

/**
 * Compute the median of a sorted numeric array.
 */
function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Build a wound distribution histogram from raw damage samples.
 */
function buildDistribution(samples: number[], totalIterations: number): WoundDistribution[] {
  const counts = new Map<number, number>();
  for (const dmg of samples) {
    counts.set(dmg, (counts.get(dmg) ?? 0) + 1);
  }

  // Sort by wound count ascending
  const sorted = Array.from(counts.entries()).sort((a, b) => a[0] - b[0]);

  return sorted.map(([wounds, count]) => ({
    wounds,
    count,
    percentage: (count / totalIterations) * 100,
  }));
}

// ---------------------------------------------------------------------------
// Monte Carlo Runner
// ---------------------------------------------------------------------------

/**
 * Run a full Monte Carlo simulation and return aggregated statistics.
 *
 * This is the core computation loop: it calls `runCombatPass` `iterations`
 * times and collects the total damage dealt in each iteration.
 */
export function runSimulationSync(config: SimulationConfig): SimulationResult {
  const { attackProfile, defenseProfile, iterations } = config;

  const samples: number[] = new Array(iterations);

  for (let i = 0; i < iterations; i++) {
    const result = runCombatPass(attackProfile, defenseProfile);
    samples[i] = result.totalDamage;
  }

  // Sort for percentile calculations
  samples.sort((a, b) => a - b);

  const mean = samples.reduce((acc, v) => acc + v, 0) / iterations;
  const distribution = buildDistribution(samples, iterations);

  return {
    config,
    distribution,
    median: median(samples),
    mean,
    p10: percentile(samples, 10),
    p90: percentile(samples, 90),
    totalIterations: iterations,
  };
}

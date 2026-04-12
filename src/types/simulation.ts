import type { AttackProfile, DefenseProfile } from './profiles';

export interface SimulationConfig {
  attackProfile: AttackProfile;
  defenseProfile: DefenseProfile;
  iterations: number;
}

export interface WoundDistribution {
  wounds: number;
  count: number;
  percentage: number;
}

export interface SimulationResult {
  config: SimulationConfig;
  distribution: WoundDistribution[];
  median: number;
  mean: number;
  p10: number;
  p90: number;
  totalIterations: number;
}

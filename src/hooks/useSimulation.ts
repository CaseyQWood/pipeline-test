import { useState, useCallback } from 'react';
import { runSimulation } from '../engine/workerApi';
import type { SimulationConfig, SimulationResult } from '../types/simulation';

const DEFAULT_ITERATIONS = 25000;

interface UseSimulationReturn {
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  simulate: (config: Omit<SimulationConfig, 'iterations'> & { iterations?: number }) => Promise<void>;
}

export function useSimulation(): UseSimulationReturn {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(
    async (config: Omit<SimulationConfig, 'iterations'> & { iterations?: number }) => {
      setLoading(true);
      setError(null);

      const fullConfig: SimulationConfig = {
        ...config,
        iterations: config.iterations ?? DEFAULT_ITERATIONS,
      };

      try {
        const simResult = await runSimulation(fullConfig);
        setResult(simResult);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Simulation failed';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { result, loading, error, simulate };
}

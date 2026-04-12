/**
 * Promise-based wrapper around the simulation Web Worker.
 *
 * Usage:
 *   import { runSimulation } from './engine/workerApi';
 *   const result = await runSimulation(config);
 */

import type { SimulationConfig, SimulationResult } from '../types/simulation';

// ---------------------------------------------------------------------------
// Worker message types (mirror of worker.ts protocol)
// ---------------------------------------------------------------------------

interface SimulationResultMessage {
  type: 'SIMULATION_RESULT';
  result: SimulationResult;
}

interface SimulationErrorMessage {
  type: 'SIMULATION_ERROR';
  message: string;
}

type WorkerResponse = SimulationResultMessage | SimulationErrorMessage;

// ---------------------------------------------------------------------------
// Worker lifecycle
// ---------------------------------------------------------------------------

let workerInstance: Worker | null = null;

/**
 * Lazily create (and reuse) the simulation worker.
 * The worker is kept alive between calls for performance.
 */
function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return workerInstance;
}

/**
 * Terminate the shared worker instance.
 * Call this during app teardown if needed.
 */
export function terminateWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run a Monte Carlo simulation off the main thread.
 *
 * @param config - Attack/defense profiles and iteration count.
 * @returns Promise resolving to a SimulationResult with statistics.
 */
export function runSimulation(config: SimulationConfig): Promise<SimulationResult> {
  return new Promise<SimulationResult>((resolve, reject) => {
    const worker = getWorker();

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);

      if (event.data.type === 'SIMULATION_RESULT') {
        resolve(event.data.result);
      } else {
        reject(new Error(event.data.message));
      }
    };

    const handleError = (event: ErrorEvent) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      reject(new Error(event.message ?? 'Unknown worker error'));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    worker.postMessage({ type: 'RUN_SIMULATION', config });
  });
}

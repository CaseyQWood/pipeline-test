/**
 * Web Worker entry point for the Monte Carlo simulation engine.
 *
 * Receives a SimulationConfig via postMessage, runs the simulation
 * synchronously on the worker thread (off the main thread), and posts
 * a SimulationResult back.
 *
 * Message protocol:
 *   Incoming: { type: 'RUN_SIMULATION'; config: SimulationConfig }
 *   Outgoing (success): { type: 'SIMULATION_RESULT'; result: SimulationResult }
 *   Outgoing (error):   { type: 'SIMULATION_ERROR'; message: string }
 */

import type { SimulationConfig } from '../types/simulation';
import { runSimulationSync } from './simulation';

interface RunSimulationMessage {
  type: 'RUN_SIMULATION';
  config: SimulationConfig;
}

type IncomingMessage = RunSimulationMessage;

self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const { data } = event;

  if (data.type === 'RUN_SIMULATION') {
    try {
      const result = runSimulationSync(data.config);
      self.postMessage({ type: 'SIMULATION_RESULT', result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: 'SIMULATION_ERROR', message });
    }
  }
};

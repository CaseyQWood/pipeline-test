import type { DiceExpression } from '../types/profiles';

/**
 * Roll a single D6, returning a value 1–6.
 */
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll `count` dice with `sides` faces, sum the results and add `modifier`.
 */
export function rollDice(count: number, sides: number, modifier: number): number {
  let total = modifier;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

/**
 * Resolve a attacks/damage value that may be a fixed number or a DiceExpression.
 */
export function resolveValue(value: number | DiceExpression): number {
  if (typeof value === 'number') {
    return value;
  }
  return rollDice(value.dice, value.sides, value.modifier);
}

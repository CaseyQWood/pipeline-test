import type { AttackProfile, DefenseProfile } from '../types/profiles';
import { rollD6, resolveValue } from './dice';

/**
 * Result of a single simulation pass.
 */
export interface CombatResult {
  /** Total damage points applied (after FNP). */
  totalDamage: number;
  /** Number of models killed. */
  modelsKilled: number;
}

// ---------------------------------------------------------------------------
// Wound threshold helper
// ---------------------------------------------------------------------------

/**
 * Determine the wound roll threshold (the minimum d6 roll required to wound)
 * based on the Strength vs Toughness comparison.
 */
function woundThreshold(strength: number, toughness: number): number {
  if (strength >= toughness * 2) return 2;
  if (strength > toughness) return 3;
  if (strength === toughness) return 4;
  if (strength * 2 <= toughness) return 6;
  return 5;
}

// ---------------------------------------------------------------------------
// Reroll helper
// ---------------------------------------------------------------------------

/**
 * Roll a d6 with optional reroll logic.
 *   'none'  – no reroll
 *   'ones'  – reroll natural 1s
 *   'all'   – reroll any result below the threshold (failures)
 */
function rollWithReroll(
  reroll: 'none' | 'ones' | 'all',
  threshold: number,
): number {
  let roll = rollD6();
  if (reroll === 'ones' && roll === 1) {
    roll = rollD6();
  } else if (reroll === 'all' && roll < threshold) {
    roll = rollD6();
  }
  return roll;
}

// ---------------------------------------------------------------------------
// Full Combat Pass
// ---------------------------------------------------------------------------

/**
 * Run one complete Warhammer 40k combat sequence and return the result.
 * This is the hot inner loop called 25,000 times by the Monte Carlo runner.
 *
 * Sequence:
 *   1. Determine attacks
 *   2. Hit rolls
 *   3. Wound rolls
 *   4. Save rolls
 *   5. Damage allocation (FNP + model overflow)
 */
export function runCombatPass(
  attack: AttackProfile,
  defense: DefenseProfile,
): CombatResult {
  const atkMods = attack.modifiers;
  const defMods = defense.modifiers;

  // -----------------------------------------------------------------------
  // Phase 1 – Determine number of attacks
  // -----------------------------------------------------------------------
  const numAttacks = resolveValue(attack.attacks);

  // -----------------------------------------------------------------------
  // Phase 2 – Hit rolls
  // -----------------------------------------------------------------------
  const critHitThreshold = atkMods.criticalHitThreshold; // default 6
  // Stealth adds +1 to the roll required (makes hitting harder)
  const effectiveHitRoll = attack.hitRoll + (defMods.stealth ? 1 : 0);

  let normalHits = 0;
  let lethalAutoWounds = 0; // lethal-hit crits skip the wound roll

  if (atkMods.torrent) {
    // Torrent: all attacks automatically hit
    normalHits = numAttacks;
  } else {
    for (let i = 0; i < numAttacks; i++) {
      const roll = rollWithReroll(atkMods.rerollHits, effectiveHitRoll);

      const isCrit = roll >= critHitThreshold;
      const isHit = isCrit || roll >= effectiveHitRoll;

      if (isCrit) {
        if (atkMods.lethalHits) {
          // Lethal hits: crit auto-wounds, skips wound roll
          lethalAutoWounds += 1;
        } else {
          normalHits += 1;
        }
        // Sustained hits N: each crit generates N additional regular hits
        if (atkMods.sustainedHits > 0) {
          normalHits += atkMods.sustainedHits;
        }
      } else if (isHit) {
        normalHits += 1;
      }
    }
  }

  // -----------------------------------------------------------------------
  // Phase 3 – Wound rolls
  // -----------------------------------------------------------------------
  const critWoundThreshold = atkMods.criticalWoundThreshold; // default 6

  // S vs T wound threshold
  let baseWoundThreshold = woundThreshold(attack.strength, defense.toughness);

  // Anti-keyword: use the better (lower) threshold if applicable
  if (atkMods.antiKeyword !== null && atkMods.antiKeyword < baseWoundThreshold) {
    baseWoundThreshold = atkMods.antiKeyword;
  }

  // Twin-linked: reroll all failed wound rolls (overrides rerollWounds)
  const effectiveWoundReroll: 'none' | 'ones' | 'all' =
    atkMods.twinLinked ? 'all' : atkMods.rerollWounds;

  // lethalAutoWounds count as normal wounds entering the save step
  let normalWounds = lethalAutoWounds;
  let devastatingWoundCount = 0;

  for (let i = 0; i < normalHits; i++) {
    const roll = rollWithReroll(effectiveWoundReroll, baseWoundThreshold);

    const isCrit = roll >= critWoundThreshold;
    const isWound = isCrit || roll >= baseWoundThreshold;

    if (isCrit && atkMods.devastatingWounds) {
      // Devastating wounds: mortal wound damage, bypasses saves
      devastatingWoundCount += 1;
    } else if (isWound) {
      normalWounds += 1;
    }
  }

  // -----------------------------------------------------------------------
  // Phase 4 – Save rolls (devastating wounds bypass this phase)
  // -----------------------------------------------------------------------

  // AP worsens the armor save (adds to the target number)
  const armorSave = defense.save + attack.ap;
  // Cover: +1 bonus to armor save only (lowers the target number by 1)
  const coveredArmorSave = defMods.coverBonus ? armorSave - 1 : armorSave;

  // Invulnerable save is always un-modified by AP or cover
  const invuln = defense.invulnerableSave;

  // Use whichever effective save is easier (lower target number)
  let effectiveSave: number;
  if (invuln !== null && invuln < coveredArmorSave) {
    effectiveSave = invuln;
  } else {
    effectiveSave = coveredArmorSave;
  }

  let unsavedNormalWounds = 0;
  for (let i = 0; i < normalWounds; i++) {
    const roll = rollD6();
    if (roll < effectiveSave) {
      // Failed save
      unsavedNormalWounds += 1;
    }
  }

  // -----------------------------------------------------------------------
  // Phase 5 – Damage allocation (FNP + model overflow)
  // -----------------------------------------------------------------------
  const fnp = defense.feelNoPain;
  let remainingWoundsOnCurrentModel = defense.wounds;
  let remainingModels = defense.modelCount - 1; // the first model is already active
  let modelsKilled = 0;
  let totalDamage = 0;
  let outOfModels = false;

  /**
   * Apply `dmg` damage points to the unit, respecting FNP and model overflow.
   */
  function applyDamagePoints(dmg: number): void {
    for (let d = 0; d < dmg; d++) {
      if (outOfModels) break;

      // FNP: roll >= fnp to ignore one point of damage
      if (fnp !== null) {
        if (rollD6() >= fnp) {
          continue;
        }
      }

      totalDamage += 1;
      remainingWoundsOnCurrentModel -= 1;

      if (remainingWoundsOnCurrentModel <= 0) {
        modelsKilled += 1;
        if (remainingModels > 0) {
          remainingModels -= 1;
          remainingWoundsOnCurrentModel = defense.wounds;
        } else {
          outOfModels = true;
          break;
        }
      }
    }
  }

  // Normal unsaved wounds
  for (let w = 0; w < unsavedNormalWounds && !outOfModels; w++) {
    applyDamagePoints(resolveValue(attack.damage));
  }

  // Devastating wounds (mortal wounds — still subject to FNP)
  for (let w = 0; w < devastatingWoundCount && !outOfModels; w++) {
    applyDamagePoints(resolveValue(attack.damage));
  }

  return { totalDamage, modelsKilled };
}

export interface DiceExpression {
  dice: number;
  sides: number;
  modifier: number;
}

export interface AttackModifiers {
  torrent: boolean;
  lethalHits: boolean;
  sustainedHits: number;
  devastatingWounds: boolean;
  rerollHits: 'none' | 'ones' | 'all';
  rerollWounds: 'none' | 'ones' | 'all';
  criticalHitThreshold: number;
  criticalWoundThreshold: number;
  blast: boolean;
  twinLinked: boolean;
  antiKeyword: number | null;
}

export interface AttackProfile {
  id: string;
  name: string;
  attacks: number | DiceExpression;
  hitRoll: number;
  strength: number;
  ap: number;
  damage: number | DiceExpression;
  modifiers: AttackModifiers;
}

export interface DefenseModifiers {
  coverBonus: boolean;
  stealth: boolean;
}

export interface DefenseProfile {
  id: string;
  name: string;
  toughness: number;
  save: number;
  wounds: number;
  invulnerableSave: number | null;
  feelNoPain: number | null;
  modelCount: number;
  modifiers: DefenseModifiers;
}

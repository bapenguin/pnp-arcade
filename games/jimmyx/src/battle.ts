// Jimmy X's combat rolls, as pure functions so the simulation hook can run thousands of
// fights. From jimmyattack, enemyattack and magicattack in legacy/JIMMYX.BAS.

import type { Enemy, Spell } from './data';

export type Rng = () => number;

/** INT(RND * max) + 1, re-rolled until it's at least INT(0.75 * max). */
export function roll75(max: number, rng: Rng): number {
  const min = Math.floor(0.75 * max);
  for (;;) {
    const r = Math.floor(rng() * max) + 1;
    if (r >= min) return r;
  }
}

export const enemyStrength = (e: Enemy) => e.et + e.ew + e.ea;
export const enemyDefense = (e: Enemy) => e.ed + e.er + e.es;

/** Jimmy's swing: (strength + weapon + attack) against the enemy's guard. */
export function jimmyHits(jmaxstr: number, e: Enemy, rng: Rng): number {
  return Math.max(0, roll75(jmaxstr, rng) - roll75(enemyDefense(e), rng));
}

/** The enemy's swing against Jimmy's (defense + armor + shield). */
export function enemyHits(e: Enemy, jmaxdef: number, rng: Rng): number {
  return Math.max(0, roll75(enemyStrength(e), rng) - roll75(jmaxdef, rng));
}

/** A spell: rolled from 85% to 100% of its power, against an unweighted guard roll. */
export function spellHits(s: Spell, e: Enemy, rng: Rng): number {
  let mag: number;
  do mag = Math.floor(rng() * s.md) + 1;
  while (mag < 0.85 * s.md);
  const blk = Math.floor(rng() * enemyDefense(e)) + 1;
  return Math.max(0, mag - blk);
}

/** The sleep potion's free hit: at least 75% of (weapon + strength + attack). */
export function sleepHit(jattack: number, rng: Rng): number {
  let hit = 0;
  while (hit < 0.75 * jattack) hit = Math.floor(rng() * jattack) + 1;
  return hit;
}

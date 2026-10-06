// Jimmy X's tables, from the subroutines in legacy/JIMMYX.BAS that set them
// (the enemy labels, getweapname, getitom, initenemy, magic).

export interface Enemy {
  name: string; // en$
  weapon: string; // ew$
  ea: number; // attack
  et: number; // strength
  ew: number; // weapon
  er: number; // armor
  es: number; // shield
  ed: number; // defense
  /** One encounter in `ec` rolls. */
  ec: number;
  hp: number;
  ex: number; // experience
  eg: number; // gold
}

/** Indexed as in the original: 1 Rat … 10 bear. */
export const ENEMIES: Record<number, Enemy> = {
  1: { name: 'Giant Rat', weapon: 'Claws', ea: 13, et: 7, ew: 3, er: 4, es: 7, ed: 5, ec: 3, hp: 35, ex: 15, eg: 35 },
  2: { name: 'Rabid dog', weapon: 'Knife-like teeth', ea: 20, et: 6, ew: 10, er: 0, es: 0, ed: 8, ec: 5, hp: 40, ex: 20, eg: 45 },
  3: { name: 'Theif', weapon: 'Dagger', ea: 7, et: 14, ew: 2, er: 5, es: 3, ed: 4, ec: 8, hp: 37, ex: 15, eg: 75 },
  4: { name: 'Crazed Orangutan', weapon: 'furry fists', ea: 4, et: 24, ew: 5, er: 14, es: 0, ed: 6, ec: 5, hp: 60, ex: 25, eg: 50 },
  5: { name: 'Evil Ninja', weapon: 'Samori Sword', ea: 15, et: 9, ew: 30, er: 21, es: 3, ed: 13, ec: 7, hp: 75, ex: 30, eg: 60 },
  6: { name: 'Giant Vulture', weapon: 'Huge wings', ea: 45, et: 33, ew: 4, er: 32, es: 33, ed: 1, ec: 4, hp: 150, ex: 45, eg: 100 },
  7: { name: 'Raptor', weapon: 'Razor sharp talons', ea: 25, et: 10, ew: 24, er: 6, es: 18, ed: 20, ec: 8, hp: 55, ex: 65, eg: 250 },
  8: { name: 'Bearded Lady', weapon: 'stink bombs', ea: 15, et: 15, ew: 4, er: 1, es: 11, ed: 13, ec: 7, hp: 40, ex: 45, eg: 1000 },
  9: { name: 'Stone Giant', weapon: 'powerful stone smash', ea: 10, et: 5, ew: 3, er: 4, es: 5, ed: 1, ec: 5, hp: 250, ex: 175, eg: 400 },
  10: { name: 'Big black bear', weapon: 'powerful claw smash', ea: 13, et: 6, ew: 5, er: 6, es: 6, ed: 5, ec: 5, hp: 145, ex: 200, eg: 400 },
};

/** Which enemies roam each room (initenemy), in the order they're rolled for. */
export const ROOM_ENEMIES: Record<number, number[]> = {
  1: [1, 2, 4, 8], // field
  2: [1, 2, 4], // edge of the forest
  3: [3, 5], // Regelt, southwest
  7: [1, 2, 3, 6, 7], // dark forest
  8: [1, 2, 3, 5], // Regelt, northwest
  11: [7, 8, 9], // valley of death
  12: [8, 9], // cave
  13: [10], // creek
  14: [1], // the elves' town (never rolled: the original doesn't check for enemies there)
};

/** [name, strength (jw), price (wp)] by weapon number. */
export const WEAPONS: [string, number, number][] = [
  ['fists', 5, 0],
  ['Stick', 7, 75],
  ['Dagger', 15, 150],
  ['Axe', 20, 200],
  ['Short sword', 27, 400],
  ['Crossbow', 30, 750],
  ['Long sword', 50, 10000],
  ['Halberd', 70, 15000],
  ['Raptor claw', 100, 25000],
  ['Dragons Sword', 135, 27500],
  ['Cannon', 157, 30000],
  ['Trusted army', 250, 50000],
];

/**
 * [name, protection (jr), price (ap)] by armor number. The original set `sp = 350` for
 * Chain Mail (a typo for `ap`), so it sold at the previous armor's price.
 */
export const ARMORS: [string, number, number][] = [
  ['None', 1, 0],
  ['Leather Clothes', 5, 60],
  ['Leather Armor', 10, 125],
  ['Chain Mail', 24, 350],
  ['Iron Armor', 30, 500],
];

export const SHIELDS = ['None', "Dragon's Skin Shield", 'Cast Iron Sheild', 'Magical'];

/** Item names by number (getitom); 0 is an empty slot. */
export const ITEMS = [' ', 'poffite', 'hoffite', 'mega poffite', 'mega hoffite', 'sleep potion'];

export interface Spell {
  name: string;
  /** Damage up to md (rolled from 85% of it). */
  md: number;
  /** Mp cost. */
  mc: number;
  /** Needs `magic` above this. */
  above: number;
}

export const SPELLS: Spell[] = [
  { name: 'Fire', md: 45, mc: 5, above: 0 },
  { name: 'Fireball', md: 69, mc: 10, above: 2 },
  { name: 'Firestorm', md: 80, mc: 15, above: 3 },
  { name: 'Windbolt', md: 100, mc: 25, above: 4 },
  { name: 'Earthquake', md: 175, mc: 40, above: 5 },
];

/** The spell list as the battle's magic menu printed it. */
export const SPELL_LABELS = ['1 - Fire', '2 - FireBall', '3 - Firestorm', '4 - Wind Bolt', ' 5- Earthquake'];

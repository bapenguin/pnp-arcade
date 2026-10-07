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
  /** A clip that announces this enemy instead of the random three (new enemies only). */
  clip?: string;
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

  // ---- New (J7): Bob's army, tuned by simulation (PLAN.md) against a Jimmy carrying
  // the cave's raptor claw: soldiers and the cook are fodder at level 4, the gate captain
  // and the war machine want level 5, and Bob wants level 5 in the best armor or level 6.
  11: { name: "Bob's Soldier", weapon: 'pointy spear', ea: 40, et: 40, ew: 30, er: 30, es: 30, ed: 30, ec: 3, hp: 220, ex: 300, eg: 400, clip: 'gun' },
  12: { name: "Bob's Cook", weapon: 'three-day-old chili', ea: 35, et: 35, ew: 25, er: 20, es: 20, ed: 20, ec: 6, hp: 160, ex: 250, eg: 300, clip: 'fart' },
  13: { name: 'War Machine', weapon: 'flaming catapult', ea: 50, et: 60, ew: 40, er: 50, es: 50, ed: 50, ec: 6, hp: 380, ex: 650, eg: 900, clip: 'arty' },
  14: { name: 'Lieutenant Steve', weapon: 'really big stick', ea: 45, et: 40, ew: 40, er: 40, es: 35, ed: 35, ec: 8, hp: 320, ex: 500, eg: 1200 },
  15: { name: 'Gate Captain', weapon: 'rusty halberd', ea: 45, et: 50, ew: 40, er: 40, es: 40, ed: 40, ec: 1, hp: 420, ex: 700, eg: 800 },
  16: { name: 'BOB', weapon: 'lightning bolt magic', ea: 60, et: 55, ew: 45, er: 50, es: 45, ed: 50, ec: 1, hp: 900, ex: 5000, eg: 10000, clip: 'crushed' },
};

export const BOB = 16;
export const GATE_CAPTAIN = 15;

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
  21: [11, 12, 13, 14], // new: Bob's camp
};

/** New: the Regelt Colosseum's four tiers. Fights here can't kill Jimmy. */
export const ARENA: { name: string; fee: number; enemies: number[] }[] = [
  { name: 'Rookie', fee: 10, enemies: [1, 2, 3] },
  { name: 'Contender', fee: 50, enemies: [4, 5, 7, 8] },
  { name: 'Champion', fee: 200, enemies: [6, 9, 10] },
  { name: 'Legend', fee: 1000, enemies: [11, 13, 14] },
];

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
  // New: the Colosseum's grand prize, named for the weapon in Jimmy 2.
  ["Puleo's Pulverizer", 180, 40000],
];

export const PULVERIZER = 12;

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
  // New: sold in Snootsburg. Paul's Armor is the armor from Jimmy 2's hollow log.
  ['Gold Plated Armor', 45, 4000],
  ["Paul's Armor", 70, 15000],
];

/** The armors Regelt's shop sells; Snootsburg's boutique sells the rest. */
export const REGELT_ARMORS = 4;

/**
 * [name, protection (js), price]. The original named three shields but never sold any,
 * and Jimmy's shield bonus (js) was always 0. Snootsburg sells them (new).
 */
export const SHIELDS: [string, number, number][] = [
  ['None', 0, 0],
  ["Dragon's Skin Shield", 8, 800],
  ['Cast Iron Sheild', 15, 2500],
  ['Magical', 30, 9000],
];

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

/** New: the hermit's lesson, Jimmy 1's winning trick. It's how Bob stops disappearing. */
export const BLIND = { name: 'Blind', mc: 10 };

/** The spell list as the battle's magic menu printed it. */
export const SPELL_LABELS = ['1 - Fire', '2 - FireBall', '3 - Firestorm', '4 - Wind Bolt', ' 5- Earthquake'];

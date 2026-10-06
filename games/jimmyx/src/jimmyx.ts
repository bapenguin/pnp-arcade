// Jimmy X ("Memories.. and other stuff I remember"), Nick Puleo and David Paul, mid-90s.
// Ported from legacy/JIMMYX.BAS, with the fixes from the later JIMMYXNEW.BAS.
//
// The original is a main menu (MMenu) and a room loop (chkroom): each room is a
// `WHILE roomnum = n` loop that redraws its menu until the player moves. Battles break
// out of the room with GOTO chkroom (here: `throw new ToRoom()`), and Q, death and
// quitting jump back to the menu (`throw new ToMenu()`).
//
// Deliberate changes are marked "The original…" and listed in ../PLAN.md.

import type { QB } from '../../../shared/qb/qb';
import { enemyHits, jimmyHits, sleepHit, spellHits } from './battle';
import { ARMORS, ENEMIES, ITEMS, ROOM_ENEMIES, SHIELDS, SPELL_LABELS, SPELLS, WEAPONS, type Enemy } from './data';
import { instructions } from './instructions';
import { intro } from './intro';
import { saves, SLOTS, type Save } from './saves';

const WIN = 'Mb o3  l16 ccc l1e l16 ccc l1 f';
const ENEMY_HIT = 'MFO0L32EFGEFDC';

/** GOTO MMenu */
class ToMenu extends Error {}
/** GOTO chkroom */
class ToRoom extends Error {}
/** END */
class ToEnd extends Error {}

/** CINT: round half to even, as QB did when SPACE$ got a fraction. */
const cint = (x: number) => {
  const f = Math.floor(x);
  const d = x - f;
  return d > 0.5 || (d === 0.5 && f % 2 === 1) ? f + 1 : f;
};

export class JimmyX {
  // ---- The original's variables ----
  roomnum = 1;
  points = 0;
  money = 0;
  weapon = 0;
  armor = 0;
  shield = 0;
  lev = 1;
  jex = 0;
  nexp = 75;
  jhp = 45;
  maxhp = 45;
  jmp = 25;
  maxmp = 25;
  jt = 15; // strength
  ja = 15; // attack
  jd = 17; // defense
  js = 0; // shield bonus (nothing ever sets it)
  magic = 1;
  ittoms: number[] = Array(21).fill(0); // 1-20
  /** 0 = no game, 1 = playing (unsaved), 2 = just saved. */
  notsaved = 0;
  /** 1 right after a battle: the next room skips its enemy roll. */
  attack = 0;
  battle = 0;
  /** The Options menu's sound switch. The original started with it off. */
  soundon = 1;
  firsttime = 0;
  saveName = '';
  rng: () => number = Math.random;

  private t: string[] = [];

  constructor(private qb: QB) {}

  // ---- Little helpers the original used everywhere ----

  /**
   * CALL delay(x). The original was an empty FOR loop of x*1000 steps, so its length
   * depended on the PC; the later version used _DELAY x/10 (seconds) for x >= 1. Here it's
   * x/4 seconds (x itself below 1), long enough to read, and any key skips it.
   */
  private delay(x: number): Promise<void> {
    return this.qb.sleep(Math.max(0.05, x >= 1 ? x / 4 : x));
  }

  /** CALL pressenter: WHILE INKEY$ = "": WEND */
  private pressenter(): Promise<void> {
    return this.qb.anyKey();
  }

  private get jw(): number {
    return WEAPONS[this.weapon][1];
  }
  private get jr(): number {
    return ARMORS[this.armor]?.[1] ?? 1;
  }

  /** puts: clears the screen and prints t$(1-25), each line centred. */
  private puts(): void {
    const qb = this.qb;
    qb.cls();
    for (let row = 1; row <= 25; row++) {
      const s = this.t[row] ?? ' '.repeat(77);
      qb.locate(row, 1);
      qb.print(' '.repeat(cint((80 - s.length) / 2)), s);
    }
    this.t = [];
  }

  /** choice: the room prompt on the bottom line, with the commands that work anywhere. */
  private async choice(): Promise<string> {
    const qb = this.qb;
    qb.locate(25, 1);
    qb.print(' '.repeat(43));
    qb.locate(25, 1);
    let c = await qb.input();
    qb.locate(25, 1);
    qb.print(' '.repeat(46));
    c = c.toUpperCase();
    if (c === 'HELP') await this.help();
    if (c === 'INFO') await this.itemlist();
    if (c === 'Q') throw new ToMenu();
    if (c === 'USE') await this.useitem();
    return c;
  }

  /** SUB help: `points` is never earned, so this is all it ever says. */
  private async help(): Promise<void> {
    if (this.points < 1) {
      this.qb.print("Sorry, You're on your own.");
      // The original went straight back to the room, which cleared this unread.
      await this.delay(6);
      return;
    }
    this.points--;
  }

  // ---- Main menu ----

  /** The program: runs until the player quits (END). */
  async run(): Promise<void> {
    try {
      for (;;) await this.mainMenu();
    } catch (e) {
      if (!(e instanceof ToEnd)) throw e;
    }
  }

  private async mainMenu(): Promise<void> {
    const qb = this.qb;
    qb.cls();
    qb.color(15);
    // The original offered "Resume" only for a game still in memory. The autosave lets
    // it pick up a game from an earlier visit too.
    const canResume = this.notsaved === 1 || this.notsaved === 2 || saves.auto() !== null;
    this.t[9] = 'Memories.. and other stuff I remember';
    this.t[10] = 'By Jimmy';
    this.t[12] = 'Main  Menu';
    this.t[13] = '1 - Watch intro and then play game';
    this.t[14] = '2 - Jump direcly into game';
    this.t[15] = '3 - Read instructions';
    this.t[16] = '4 - Restore a saved game';
    if (this.notsaved === 1) this.t[17] = '5 - Save your current game';
    if (canResume) this.t[18] = '6 - Resume your game';
    this.t[19] = '7 - Quit Memories';
    this.t[20] = '8 - Options';
    this.puts();
    let c: string;
    try {
      c = await this.choice();
    } catch (e) {
      if (e instanceof ToMenu) return;
      throw e;
    }
    try {
      if (c === '1') {
        if (this.notsaved === 1 && !(await this.warning())) return;
        await intro(qb);
        this.start();
        await this.play();
      }
      if (c === '2') {
        if (this.notsaved === 1 && !(await this.warning())) return;
        this.start();
        await this.play();
      }
      if (c === '3') await instructions(qb);
      if (c === '4') await this.loadfile();
      if (c === '5' && this.notsaved !== 0) await this.savefile();
      if (c === '6' && canResume) {
        if (this.notsaved === 0) this.restore(saves.auto()!);
        this.notsaved = 1;
        await this.play();
      }
      if (c === '7') {
        if (this.notsaved === 1) {
          if (await this.warning()) throw new ToEnd();
          return;
        }
        await this.endgame();
      }
      if (c === '8') await this.options();
    } catch (e) {
      if (!(e instanceof ToMenu)) throw e;
    }
  }

  private async warning(): Promise<boolean> {
    this.qb.print('Your previous game is not saved. Do you still want to go on?');
    const c = await this.qb.input();
    return c === 'Y' || c === 'y';
  }

  private async endgame(): Promise<void> {
    const qb = this.qb;
    qb.color(20, 0, 0);
    qb.locate(25, 1);
    qb.print(' '.repeat(20));
    qb.locate(20, 10);
    qb.print('REALLY Quit your game?');
    const really = await qb.input();
    if (really.toUpperCase().startsWith('Y')) {
      qb.color(7, 0);
      throw new ToEnd();
    }
  }

  private async options(): Promise<void> {
    for (;;) {
      this.qb.print('Sound is currently ', this.soundon ? 'on. Turn it off?' : 'off. Turn it on?');
      const c = await this.choice();
      if (c === 'Y') {
        this.soundon = this.soundon ? 0 : 1;
        return;
      }
      if (c === 'N') return;
    }
  }

  private start(): void {
    this.ittoms = Array(21).fill(0);
    this.attack = 0;
    this.battle = 0;
    this.money = 0;
    this.weapon = 0;
    this.armor = 0;
    this.shield = 0;
    this.notsaved = 1;
    this.roomnum = 1;
    this.points = 0;
    this.maxhp = 45;
    this.maxmp = 25;
    this.saveName = '';
    this.jex = 0;
    this.lev = 1;
    this.jmp = this.maxmp;
    this.jhp = this.maxhp;
    this.jt = 15;
    this.ja = 15;
    this.js = 0;
    this.jd = 17;
    this.magic = 1;
    this.nexp = 75;
  }

  // ---- Saving (the original's loadfile/savefile, with browser slots for .JIM files) ----

  private snapshot(name: string): Save {
    return {
      name,
      savedAt: Date.now(),
      roomnum: this.roomnum,
      points: this.points,
      jt: this.jt,
      ja: this.ja,
      jd: this.jd,
      jhp: this.jhp,
      maxhp: this.maxhp,
      jmp: this.jmp,
      maxmp: this.maxmp,
      money: this.money,
      lev: this.lev,
      nexp: this.nexp,
      magic: this.magic,
      weapon: this.weapon,
      jex: this.jex,
      armor: this.armor,
      shield: this.shield,
      ittoms: this.ittoms.slice(1, 21),
    };
  }

  private restore(s: Save): void {
    Object.assign(this, {
      roomnum: s.roomnum, points: s.points, jt: s.jt, ja: s.ja, jd: s.jd, jhp: s.jhp, maxhp: s.maxhp,
      jmp: s.jmp, maxmp: s.maxmp, money: s.money, lev: s.lev, nexp: s.nexp, magic: s.magic,
      weapon: s.weapon, jex: s.jex, armor: s.armor, shield: s.shield, saveName: s.name,
    });
    this.ittoms = [0, ...s.ittoms];
    this.attack = 0;
    this.battle = 0;
  }

  private describe(s: Save | null): string {
    if (!s) return '(empty)';
    const when = new Date(s.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s.name.padEnd(12)} level${String(s.lev).padStart(3)}   $${String(s.money).padEnd(7)} ${when}`;
  }

  private async loadfile(): Promise<void> {
    const qb = this.qb;
    qb.cls();
    qb.color(15);
    qb.print('Saved games:');
    qb.print();
    const slots = saves.slots();
    slots.forEach((s, i) => qb.print(`${i + 1} - ${this.describe(s)}`));
    const auto = saves.auto();
    if (auto) qb.print(`${SLOTS + 1} - Autosave     ${this.describe(auto).slice(13)}`);
    qb.print();
    const n = await qb.inputNumber('Enter the number of the game to restore (0 to go back): ', false);
    const s = n >= 1 && n <= SLOTS ? slots[n - 1] : n === SLOTS + 1 ? auto : null;
    if (!s) return;
    this.restore(s);
    qb.print('Game ', s.name, ' has been loaded');
    qb.print('Press ENTER...');
    await this.pressenter();
    this.notsaved = 1;
    await this.play();
  }

  private async savefile(): Promise<void> {
    const qb = this.qb;
    qb.cls();
    qb.color(15);
    qb.print('Save your game in:');
    qb.print();
    const slots = saves.slots();
    slots.forEach((s, i) => qb.print(`${i + 1} - ${this.describe(s)}`));
    qb.print();
    const n = await qb.inputNumber('Which one (0 to go back): ', false);
    if (n < 1 || n > SLOTS) return;
    const name = (await qb.input(`Save as (Enter for "${this.saveName || 'JIMMY'}"): `, false)).slice(0, 12) || this.saveName || 'JIMMY';
    this.saveName = name;
    saves.putSlot(n - 1, this.snapshot(name));
    this.notsaved = 2;
  }

  // ---- The room loop ----

  /** chkroom, until the game ends or returns to the menu. */
  private async play(): Promise<void> {
    for (;;) {
      saves.putAuto(this.snapshot('Autosave'));
      try {
        await this.room();
      } catch (e) {
        if (!(e instanceof ToRoom)) throw e;
      }
    }
  }

  private async room(): Promise<void> {
    switch (this.roomnum) {
      case 1: return this.field1();
      case 2: return this.forest1();
      case 3: return this.town11();
      case 4: return this.weaponshop1();
      case 6: return this.heal();
      case 7: return this.forest2();
      case 8: return this.town12();
      case 9: return this.guild();
      case 10: return this.armorshop1();
      case 11: return this.valley();
      case 12: return this.cave();
      case 13: return this.creek();
      case 14: return this.elves();
      case 15: return this.weaponshop2();
      case 16: return this.talk();
      case 17: return this.road();
      case 18: return this.rich();
      case 19: return this.hermit();
    }
  }

  /** Each room's opening: roll for enemies unless Jimmy just fought. */
  private async enemyCheck(): Promise<void> {
    if (this.attack === 0) await this.enemy();
    this.attack = 0;
  }

  private async field1(): Promise<void> {
    while (this.roomnum === 1) {
      await this.enemyCheck();
      this.qb.color(4);
      this.t[9] = 'Jimmy is standing in a wide, open field. He can see a forest to the east, ';
      this.t[10] = 'and to then north he can see some smoke coming from a small village';
      this.t[11] = '1 - search the fields';
      this.t[12] = '2 - go East';
      this.t[13] = '3 - go North';
      this.t[14] = '4 - go West';
      this.puts();
      const c = await this.choice();
      if (c === '1') await this.search();
      if (c === '4') this.roomnum = 2;
      if (c === '2') this.roomnum = 3;
      if (c === '3') this.roomnum = 11;
    }
  }

  private async search(): Promise<void> {
    const qb = this.qb;
    const opp = Math.floor(this.rng() * 20) + 1;
    // `CASE IS = 9 OR opp = 5` only ever matched 9 (BASIC reads it as 9 OR (opp = 5)),
    // so the pond turns up 1 time in 20, as it did.
    if (opp === 7) {
      qb.print('You find an axe.');
      if (this.weapon < 3) this.weapon = 3;
      await this.delay(7);
    } else if (opp === 9) {
      qb.print('You find a small pond. You drink then water and feel refreshed ');
      this.jhp = this.maxhp;
      await this.delay(8);
    } else if (opp === 13) {
      qb.print('You bump into a wizard. He waves his wand at you then dissapears.');
      this.jmp = this.maxmp;
      await this.delay(10);
    } else if (opp === 4) {
      qb.print('You find a bag of money!!');
      this.money += 100;
      await this.delay(10);
    } else {
      qb.print(' You find nothing.');
      await this.delay(5);
    }
  }

  private async forest1(): Promise<void> {
    while (this.roomnum === 2) {
      await this.enemyCheck();
      this.qb.color(3);
      this.t[9] = 'Jimmy is standing at the edge of a dark forest. He can hear the';
      this.t[10] = 'wind blowing through the trees in the forest. There is also a ';
      this.t[11] = 'road heading north.';
      this.t[12] = '1 -  go west';
      this.t[13] = '2 -  go east';
      this.t[14] = '3 -  go north';
      this.puts();
      const c = await this.choice();
      if (c === '2') this.roomnum = 1;
      if (c === '1') this.roomnum = 7;
      if (c === '3') this.roomnum = 17;
    }
  }

  private async forest2(): Promise<void> {
    while (this.roomnum === 7) {
      await this.enemyCheck();
      this.qb.color(1);
      this.t[9] = 'Jimmy is in a Dark part of the forrest. The trees tower over his head.';
      this.t[10] = 'Very faintly, to the south, Jimmy hears the sound of running water.';
      this.t[11] = '1 - go east';
      this.t[12] = '2 - go south';
      this.t[13] = '3 - climb a tree';
      this.puts();
      const c = await this.choice();
      if (c === '1') this.roomnum = 2;
      if (c === '2') this.roomnum = 13;
      if (c === '3') this.roomnum = 14;
    }
  }

  private async town11(): Promise<void> {
    while (this.roomnum === 3) {
      await this.enemyCheck();
      this.qb.color(6);
      this.t[9] = 'Jimmy is standing in the Southwest corner of the town Regelt. There is';
      this.t[10] = 'a small weapons shop here, along with many small houses.  To the';
      this.t[11] = 'West and South Jimmy sees a large, open feild.';
      this.t[12] = '1 - go in the weapon shop';
      this.t[13] = '2 - look for someone to talk to';
      this.t[14] = '3 - go North';
      this.t[15] = '4 - go South';
      this.t[16] = '5 - go East ';
      this.t[17] = '6 - go West ';
      this.puts();
      const c = await this.choice();
      if (c === '1') this.roomnum = 4;
      if (c === '2') this.roomnum = 6;
      if (c === '3') this.roomnum = 8;
      if (c === '6') this.roomnum = 1;
      // South and East lead nowhere, as in the original.
    }
  }

  private async heal(): Promise<void> {
    const qb = this.qb;
    qb.cls();
    await this.enemyCheck();
    qb.color(5);
    qb.locate(15, 1);
    qb.print('As you wander around, you bump into an old man.');
    qb.color(3);
    const hh = this.lev * 15;
    qb.print('I can heal you for $', hh);
    qb.color(5);
    qb.print('[Y/N]');
    const c = await this.choice();
    if (c === 'Y') {
      qb.color(7);
      if (this.money - hh < 0) {
        qb.print('Not enough cash');
        await qb.sleep();
        this.roomnum = 3;
        return;
      }
      qb.print('You are healed.');
      this.jhp = this.maxhp;
      this.money -= hh;
      // The original went straight back to the town, clearing this unread.
      await this.delay(6);
    }
    this.roomnum = 3;
  }

  private async town12(): Promise<void> {
    while (this.roomnum === 8) {
      await this.enemyCheck();
      this.qb.color(6);
      this.t[9] = 'Jimmy is in the Northwest corner of the town Regelt.';
      this.t[10] = 'There are many small shops, and people are walking around';
      this.t[12] = '1 - go to the armor shop ';
      this.t[13] = '2 - go to the magic guild';
      this.t[14] = '3 - go south';
      this.t[15] = '4 - go north';
      this.t[16] = '5 - go east ';
      this.t[17] = '6 - go west ';
      this.puts();
      const c = await this.choice();
      if (c === '3') this.roomnum = 3;
      if (c === '2') this.roomnum = 9;
      if (c === '1') this.roomnum = 10;
    }
  }

  // ---- Regelt's weapon shop ----

  private async weaponshop1(): Promise<void> {
    while (this.roomnum === 4) {
      this.t[9] = 'You walk into the weapon shop. The clerk comes up to you at once.';
      this.t[11] = "'How may I help you?' he asks.";
      this.t[12] = '1 - Buy weapon ';
      this.t[13] = '2 - Sell Weapon';
      this.t[14] = '3 - Leave';
      this.puts();
      const c = await this.choice();
      if (c === '1') await this.buyweapon(false);
      if (c === '2') await this.sellweapon();
      if (c === '3') this.roomnum = 3;
    }
  }

  /**
   * buyweapon: weapons 1-7. `elves` is true when the elves' shop opened it with "M".
   * The original kept a `shop` flag that was never cleared, so after a visit to the elves
   * every purchase in Regelt jumped to the elves' price list.
   */
  private async buyweapon(elves: boolean): Promise<'bought' | 'left'> {
    const qb = this.qb;
    for (;;) {
      this.t[4] = "Well, what'll it be?";
      this.puts();
      qb.locate(5, 10);
      qb.print('Press 0 to exit');
      for (let w = 1; w <= 7; w++) {
        qb.locate(w + 5, 10);
        qb.print(w, ' - ', WEAPONS[w][0], ' (', WEAPONS[w][2], ')');
      }
      const c = await this.choice();
      if (c === '0') return 'left';
      const w = Number(c);
      if (!(Number.isInteger(w) && w >= 1 && w <= 7)) continue;
      const [name, , wp] = WEAPONS[w];
      if (this.weapon !== 0) {
        qb.print('You have to sell your weapon first');
        await this.delay(3);
        return 'left';
      }
      if (this.money < wp) {
        qb.print('You need ', wp - this.money, ' more dollars.');
        await this.delay(3);
        continue;
      }
      qb.print('You buy the ', name, '.');
      await this.delay(5);
      this.weapon = w;
      this.money -= wp;
      return elves ? 'bought' : 'left';
    }
  }

  private async sellweapon(): Promise<void> {
    const qb = this.qb;
    const [name, , wp] = WEAPONS[this.weapon];
    const gets = Math.floor(wp / 2);
    qb.locate(15, 1);
    qb.print("I'll buy that ", name, ' from you for', gets, 'dollars.');
    qb.print('Deal?[Y/N]');
    const c = (await qb.input()).toUpperCase();
    if (c === 'Y') {
      qb.color(0);
      qb.cls();
      await qb.clip('thankyou');
      // COLOR 21 is blinking magenta: the shop stays blinking until Jimmy leaves, as it did.
      qb.color(21);
      qb.cls();
      qb.print('Thank you very much.');
      this.money += gets;
      this.weapon = 0;
      await this.delay(3);
    } else if (c === 'N') {
      qb.print('Very well.');
      await this.delay(3);
    }
  }

  // ---- The magic guild ----

  private async guild(): Promise<void> {
    while (this.roomnum === 9) {
      this.t[9] = 'You enter the Guild.';
      this.t[10] = "'What may I do for you?' a wizard asks";
      this.t[12] = '1 - Restore Mp';
      this.t[13] = '2 - Purchase a magic item ';
      this.t[14] = '3 - Recieve a magic lesson';
      this.t[15] = '4 - Leave     ';
      this.puts();
      const c = await this.choice();
      if (c === '1') await this.restmp();
      if (c === '2') await this.magicitem();
      // 3 (a magic lesson) did nothing in the original.
      if (c === '4') this.roomnum = 8;
    }
  }

  private async restmp(): Promise<void> {
    const qb = this.qb;
    qb.locate(15, 1);
    for (;;) {
      const hhh = this.lev * 10;
      qb.print('It will cost', hhh, 'dollars for my services');
      qb.print('     [Y/N]');
      const c = (await qb.input()).toUpperCase();
      if (c === 'Y') {
        if (this.money - hhh < 0) {
          qb.print("You don't have enough money");
          await this.delay(5);
          return;
        }
        qb.print('Magic points are restored.');
        this.jmp = this.maxmp;
        this.money -= hhh;
        await this.delay(5);
        return;
      }
      if (c === 'N') {
        qb.print("Then you shouldn't of said so.");
        await this.delay(5);
        return;
      }
    }
  }

  private async magicitem(): Promise<void> {
    const qb = this.qb;
    for (;;) {
      qb.print('What would you like to buy?');
      qb.print();
      qb.print('0 to exit');
      qb.print('1 - Poffite(restores some Hp- $10)');
      qb.print('2 - Hoffite(restores some Mp- $10)');
      qb.print('3 - Mega- Poffite(restores more Hp- $20)');
      qb.print('4 - Mega- Hoffite(restores more Mp- $20)');
      qb.print("5 - Sleep potion(your enemies can't block or attack!!- $50)");
      const hhh = await qb.inputNumber();
      if (hhh === 0) return;
      const price = hhh === 1 || hhh === 2 ? 10 : hhh === 3 || hhh === 4 ? 20 : hhh === 5 ? 50 : 0;
      if (!price) continue;
      if (this.money < price) {
        qb.print(hhh === 5 ? 'Not enough Money!!' : hhh >= 3 ? 'Not enough money!!' : 'not enough money!!');
        await this.delay(3);
        return;
      }
      // The original printed every slot's contents as it searched (a debugging leftover),
      // and said "Not enough room" when the item had gone into the last slot.
      const slot = this.ittoms.findIndex((v, i) => i >= 1 && v < 1);
      if (slot < 0) {
        qb.print('Not enough room');
        return;
      }
      this.money -= price;
      this.ittoms[slot] = hhh;
      qb.print('You buy it!');
      await this.delay(3);
    }
  }

  // ---- Regelt's armor shop ----

  private async armorshop1(): Promise<void> {
    while (this.roomnum === 10) {
      this.t[9] = 'You walk into the armor shop. The clerk comes up to you at once.';
      this.t[11] = "'How may I help you?' he asks.";
      this.t[12] = '1 - Buy armor ';
      this.t[13] = '2 - Sell armor';
      this.t[14] = '3 - Leave';
      this.puts();
      const c = await this.choice();
      if (c === '1') await this.buyarmor();
      if (c === '2') await this.sellarmor();
      if (c === '3') this.roomnum = 8;
    }
  }

  private async buyarmor(): Promise<void> {
    const qb = this.qb;
    for (;;) {
      this.t[4] = "Well, what'll it be?";
      this.puts();
      qb.locate(5, 10);
      qb.print('Press 0 to exit');
      // The original listed 1-7, but only 1-4 exist: 5-7 repeated Iron Armor.
      for (let a = 1; a < ARMORS.length; a++) {
        qb.locate(a + 5, 10);
        qb.print(a, ' - ', ARMORS[a][0], ' (', ARMORS[a][2], ')');
      }
      const c = await this.choice();
      if (c === '0') return;
      const a = Number(c);
      if (!(Number.isInteger(a) && a >= 1 && a < ARMORS.length)) continue;
      const [name, , ap] = ARMORS[a];
      if (this.armor !== 0) {
        qb.print('You have to sell your armor first');
        await this.delay(3);
        return;
      }
      if (this.money < ap) {
        qb.print('You need ', ap - this.money, ' more dollars.');
        await this.delay(3);
        continue;
      }
      qb.print('You buy the ', name, '.');
      await this.delay(5);
      this.armor = a;
      this.money -= ap;
      return;
    }
  }

  private async sellarmor(): Promise<void> {
    const qb = this.qb;
    const [name, , ap] = ARMORS[this.armor];
    const gets = Math.floor(ap / 2);
    qb.locate(15, 1);
    for (;;) {
      qb.print("I'll buy that ", name, ' from you for', gets, 'dollars.');
      qb.print('Deal?[Y/N]');
      const c = (await qb.input()).toUpperCase();
      if (c === 'Y') {
        qb.color(0);
        qb.cls();
        await qb.clip('thankyou');
        qb.color(2);
        qb.cls();
        qb.print('Thank you very much.');
        this.money += gets;
        this.armor = 0;
        await this.delay(3);
        return;
      }
      if (c === 'N') {
        qb.print('Very well.');
        await this.delay(3);
        return;
      }
      // The original went on to sellweapon here, offering to buy Jimmy's weapon instead.
    }
  }

  // ---- North: the valley of death and its cave ----

  private async valley(): Promise<void> {
    while (this.roomnum === 11) {
      await this.enemyCheck();
      this.qb.color(5);
      this.t[8] = 'Jimmy enters the Valley of death';
      this.t[9] = 'he sees many weird things around';
      this.t[10] = 'Press 1 to go south';
      this.t[11] = 'Press 2 to go into the cave';
      this.puts();
      const c = await this.choice();
      if (c === '1') this.roomnum = 1;
      if (c === '2') this.roomnum = 12;
    }
  }

  private async cave(): Promise<void> {
    this.qb.print('Jimmy enters the cave...');
    await this.delay(5);
    // The cave doesn't reset `attack` afterwards, so the next room skips its roll too.
    if (this.attack === 0) await this.enemy();
    if (this.weapon < 8) {
      this.qb.print('Jimmy gets the raptor claw!!');
      this.weapon = 8;
      // The original went straight back to the field, clearing this unread.
      await this.delay(6);
    }
    this.roomnum = 1;
  }

  // ---- West: the creek, the hermit, the elves ----

  private async creek(): Promise<void> {
    this.qb.cls();
    this.qb.color(5);
    while (this.roomnum === 13) {
      this.qb.cls();
      await this.enemyCheck();
      this.qb.color(5);
      this.t[9] = 'You walk south and are glad to be out of the dark forest.';
      this.t[10] = 'There is a small creek and it is bright and sunny out you see a small house';
      this.t[11] = 'Press 1 to make camp';
      this.t[12] = 'Press 2 to go north';
      this.t[13] = 'Press 3 to knock on the houses door';
      this.puts();
      const c = await this.choice();
      if (c === '1') this.jhp = this.maxhp;
      if (c === '2') this.roomnum = 7;
      if (c === '3') this.roomnum = 19;
    }
  }

  /**
   * The hermit's house. The original's `hermit:` label was empty and fell through to the
   * next rooms' loops and back, freezing the game the moment Jimmy knocked. Until the
   * hermit is written (PLAN.md, J7), nobody answers.
   */
  private async hermit(): Promise<void> {
    this.qb.print('Jimmy knocks, but nobody answers.');
    await this.delay(8);
    this.roomnum = 13;
  }

  private async elves(): Promise<void> {
    while (this.roomnum === 14) {
      this.qb.color(4);
      this.t[8] = ' You enter the elves town of Askburest.';
      this.t[9] = ' Press 1 to go to the weapon shop';
      this.t[10] = 'Press 2 to talk to someone';
      this.t[11] = 'Press 3 to go back';
      this.puts();
      const c = await this.choice();
      if (c === '1') this.roomnum = 15;
      if (c === '3') this.roomnum = 7;
      if (c === '2') this.roomnum = 16;
    }
  }

  /**
   * An elf passes on a rumour. The original's GOSUBs here fell through into each other,
   * so the clips played twice and the rumour was shown two or three times.
   */
  private async talk(): Promise<void> {
    const qb = this.qb;
    if (this.soundon) {
      qb.color(0);
      qb.cls();
      await qb.clip('hello');
      await qb.clip('army');
      qb.color(4);
    }
    qb.cls();
    qb.print('Hello, Hello');
    qb.color(3);
    qb.print(" Well I've heard rumors of a small army assembling near here");
    qb.print('I have a belief it is BOB');
    await qb.sleep(5);
    this.roomnum = 14;
  }

  private async weaponshop2(): Promise<void> {
    while (this.roomnum === 15) {
      this.t[9] = 'You walk into the weapon shop. The clerk comes up to you at once.';
      this.t[11] = "'How may I help you?' he asks.";
      this.t[12] = '1 - Buy weapon ';
      this.t[13] = '2 - Sell Weapon';
      this.t[14] = '3 - Leave';
      this.puts();
      const c = await this.choice();
      if (c === '1') await this.buyweapon2();
      if (c === '2') await this.sellweapon2();
      if (c === '3') this.roomnum = 14;
    }
  }

  /** The elves' list: weapons 6-11, with "M" for Regelt's list. */
  private async buyweapon2(): Promise<void> {
    const qb = this.qb;
    for (;;) {
      this.t[4] = "Well, what'll it be?";
      this.puts();
      qb.locate(5, 10);
      qb.print('Press 0 to exit');
      qb.print('(M for more)');
      for (let w = 6; w <= 11; w++) {
        qb.locate(undefined, 10);
        qb.print(w - 5, ' - ', WEAPONS[w][0], ' (', WEAPONS[w][2], ')');
      }
      const c = await this.choice();
      if (c === '0') return;
      if (c === 'M') {
        if ((await this.buyweapon(true)) === 'bought') return;
        continue;
      }
      const n = Number(c);
      if (!(Number.isInteger(n) && n >= 1 && n <= 6)) continue;
      const w = n + 5;
      const [name, , wp] = WEAPONS[w];
      if (this.weapon !== 0) {
        qb.print('You have to sell your weapon first');
        await this.delay(3);
        return;
      }
      if (this.money < wp) {
        qb.print('You need ', wp - this.money, ' more dollars.');
        await this.delay(3);
        continue;
      }
      qb.print('You buy the ', name, '.');
      await this.delay(5);
      this.weapon = w;
      this.money -= wp;
      return;
    }
  }

  private async sellweapon2(): Promise<void> {
    const qb = this.qb;
    const [name, , wp] = WEAPONS[this.weapon];
    const gets = Math.floor(wp / 2);
    qb.locate(15, 1);
    for (;;) {
      qb.print("I'll buy that ", name, ' from you for', gets, 'dollars.');
      qb.print('Deal?[Y/N]');
      const c = (await qb.input()).toUpperCase();
      if (c === 'Y') {
        qb.color(0);
        qb.cls();
        await qb.clip('thankyou');
        qb.color(3);
        qb.cls();
        qb.print('Thank you very much.');
        this.money += gets;
        this.weapon = 0;
        await this.delay(3);
        return;
      }
      if (c === 'N') {
        qb.print('Very well.');
        await this.delay(3);
        return;
      }
      // The original went on to Regelt's sellweapon here.
    }
  }

  // ---- North of the forest: the toll road ----

  private async road(): Promise<void> {
    const qb = this.qb;
    while (this.roomnum === 17) {
      qb.cls();
      qb.color(4);
      this.t[7] = 'You find the road to the rich part of the land';
      this.t[8] = 'there is a toll booth.';
      this.t[10] = 'Pay toll of $20?[Y/N]';
      this.puts();
      if (this.soundon && this.firsttime === 0) {
        qb.color(0);
        qb.cls();
        await qb.clip('toll');
        this.firsttime = 1;
        continue;
      }
      const c = await this.choice();
      // There's no money check: the toll can leave Jimmy in debt, as in the original.
      if (c === 'Y') {
        this.money -= 20;
        this.roomnum = 18;
      }
      if (c === 'N') this.roomnum = 2;
    }
    this.firsttime = 0;
  }

  /** The rich part of the land: unwritten in the original, which sent Jimmy back to the field (PLAN.md, J7). */
  private async rich(): Promise<void> {
    this.qb.color(14);
    this.roomnum = 1;
  }

  // ---- Battle ----

  /** enemy/getenemy: rolls for each enemy that roams this room, in order. */
  private async enemy(): Promise<void> {
    for (const id of ROOM_ENEMIES[this.roomnum] ?? []) {
      // The original stopped scanning at slot 10 before reading it, so the creek's bear
      // (enemy 10) never appeared. Several enemies also lacked a RETURN and fell into the
      // next one's roll (the orangutan into the ninja; the stone giant into the bearded
      // lady and the raptor), adding enemies to rooms they weren't listed for.
      if (Math.floor(this.rng() * ENEMIES[id].ec) + 1 === 1) await this.fight(ENEMIES[id]);
    }
  }

  /** attack: the encounter, then the battle until someone wins or Jimmy runs. */
  private async fight(e: Enemy): Promise<void> {
    const qb = this.qb;
    if (this.soundon) {
      qb.color(3);
      qb.print('Here comes a bad guy');
      // The original cleared this at once to play the clip.
      await this.delay(3);
      qb.color(0);
      const clip = Math.floor(this.rng() * 3);
      qb.cls();
      await qb.clip(['myday', 'backoff', 'meanswar'][clip]);
      qb.color([3, 4, 8][clip]);
    }
    let ehp = e.hp;
    this.battle = 1;
    const jmaxstr = () => this.jt + this.jw + this.ja;
    const jmaxdef = () => this.jd + this.jr + this.js;

    const win = async (): Promise<never> => {
      if (this.soundon) void qb.play(WIN);
      qb.color(4);
      this.battle = 0;
      qb.print('Jimmy defeated the ', e.name, '!!');
      qb.print('       Jimmy gains ', e.ex, ' Exp Points!!');
      qb.print('       Jimmy gains $ ', e.eg, '!!!');
      this.jex += e.ex;
      this.money += e.eg;
      this.attack = 1;
      if (this.jex >= this.nexp) {
        qb.color(15);
        this.nexp = Math.floor(this.nexp * 2.3476);
        this.ja = Math.floor(this.ja * 1.53);
        this.jt = Math.floor(this.jt * 1.55);
        this.jd = Math.floor(this.jd * 1.47);
        this.lev++;
        const tmaxhp = Math.floor(this.maxhp * 1.25);
        this.maxmp += 20;
        this.magic++;
        qb.print('Jimmy gains a level!!!  Currently on level ', this.lev);
        qb.write('Max Hp goes up by', tmaxhp - this.maxhp, '!!  ', 'Now at');
        this.maxhp = tmaxhp;
        qb.print(tmaxhp, '!');
        qb.print();
        qb.print('Max Mp  now at', this.maxmp);
        qb.print('Attack - ', this.ja);
        qb.print('Strength - ', this.jt);
        qb.print('Defense - ', this.jd);
        qb.print(this.nexp - this.jex, ' Exp points to next level.');
      }
      await this.pressenter();
      throw new ToRoom();
    };

    // enemyattack. The original used strengths left over from Jimmy's last swing, so
    // an enemy that struck first (time ran out, or after a spell) hit with the previous
    // enemy's strength, or 0 at the start of a game.
    const enemyattack = async () => {
      if (this.soundon) await qb.play(ENEMY_HIT);
      qb.locate(12, 1);
      qb.write('The ');
      qb.color(4);
      qb.write(e.name);
      qb.color(5);
      qb.write(' attacks you with its ');
      qb.color(4);
      qb.write(e.weapon);
      qb.color(5);
      qb.write(' causing');
      const dmg = enemyHits(e, jmaxdef(), this.rng);
      qb.color(4);
      qb.write(dmg);
      qb.color(5);
      qb.print('damage!!');
      this.jhp -= dmg;
      if (this.jhp < 1) {
        if (this.soundon) await qb.clip('ouch');
        qb.color(4);
        qb.write('The ');
        qb.color(15);
        qb.write(e.name);
        qb.color(4);
        qb.print(' laughes as you fall down, bleeding. What a fool you were.');
        qb.print('The last thing you remember is the ', e.name, ' raising his ', e.weapon, ' to deliver one final blow...');
        await this.pressenter();
        this.battle = 0;
        this.notsaved = 0;
        // A death ends the game: there's nothing to resume.
        saves.putAuto(null);
        throw new ToMenu();
      }
      await this.delay(10);
    };

    for (;;) {
      // ppt: a fresh screen and a fresh 10-second count.
      qb.cls();
      const t1 = qb.clock.now();
      let redraw = false;
      for (;;) {
        // part0
        if (redraw) qb.cls();
        redraw = false;
        qb.color(5);
        const elapsed = (qb.clock.now() - t1) / 1000;
        if (elapsed > 10) {
          await enemyattack();
          break;
        }
        qb.locate(1, 39);
        qb.print(10 - Math.floor(elapsed));
        qb.locate(2, 1);
        qb.write('~'.repeat(80));
        qb.locate(4, 5);
        qb.print("Jimmy's Hp - ", this.jhp);
        qb.locate(4, 40);
        qb.print(e.name, "'s Hp - ", ehp);
        qb.locate(5, 5);
        qb.print("Jimmy's Mp - ", this.jmp);
        qb.tab(15);
        qb.write('You encounter a', /^[AEIOU]/i.test(e.name) ? 'n ' : ' ');
        qb.color(15);
        qb.write(e.name);
        qb.color(5);
        qb.print('!!!');
        qb.tab(15);
        qb.print('1 - attack');
        qb.tab(15);
        qb.print('2 - Magic');
        qb.tab(15);
        qb.print('3 - Run');
        qb.tab(15);
        qb.print('4 - Use item');

        // ON KEY: 1-4 on the top row (or the keypad's End, Down, PgDn, Left).
        const k = await qb.inkey(Math.max(50, 1000 - ((qb.clock.now() - t1) % 1000)));
        if (k === '1') {
          const name = WEAPONS[this.weapon][0];
          const dmg = jimmyHits(jmaxstr(), e, this.rng);
          qb.locate(11, 1);
          qb.write('     You attack with your ');
          qb.color(15);
          qb.write(name);
          qb.color(5);
          qb.write('...');
          if (dmg === 0) qb.print('And miss!!!');
          else {
            qb.write('causing ');
            qb.color(15);
            qb.write(dmg);
            qb.color(5);
            qb.print('damage!!');
          }
          ehp -= dmg;
          await this.delay(5);
          if (ehp < 1) await win();
          await enemyattack();
          break;
        }
        if (k === '2') {
          const r = await this.castMagic(e);
          if (r === 'back') {
            // The original went back with the battle keys switched off, so Jimmy had to
            // wait for the enemy to strike before he could act again.
            redraw = true;
            continue;
          }
          ehp -= r;
          if (ehp < 1) await win();
          await enemyattack();
          break;
        }
        if (k === '3') {
          // flee: always works, and the next room skips its enemy roll.
          this.battle = 0;
          this.attack = 1;
          throw new ToRoom();
        }
        if (k === '4') {
          const hit = await this.useitem(e);
          ehp -= hit;
          if (ehp < 1) await win();
          // Using an item is free: back to the menu without the enemy's turn. The original
          // drew the menu over the item list without clearing it.
          redraw = true;
        }
      }
    }
  }

  /** magic: the spell menu. Returns the damage dealt, or 'back'. */
  private async castMagic(e: Enemy): Promise<number | 'back'> {
    const qb = this.qb;
    for (;;) {
      qb.cls();
      // getmagic. `CASE IS = 1 OR 2` meant CASE 3 to BASIC, and some cases fell through
      // into printing "1 - Fire" again, so the list was often wrong. It now lists the
      // spells Jimmy can cast, which is what the casting checks below always allowed.
      if (this.magic === 0) qb.print("You don't know any magic!!");
      else qb.print();
      SPELLS.forEach((s, i) => {
        if (this.magic > s.above) qb.print(SPELL_LABELS[i]);
      });
      const v = await qb.input();
      if (v === '0') return 'back';
      const i = Number(v) - 1;
      const s = SPELLS[i];
      if (!s || !(this.magic > s.above)) continue;
      // The original only checked Mp for the first three spells; Windbolt and
      // Earthquake could take Jimmy's Mp below zero.
      if (this.jmp - s.mc < 0) {
        qb.print('Sorry, you need ', s.mc, ' Mp.');
        await qb.sleep();
        return 'back';
      }
      qb.write('Jimmy casts ');
      qb.color(15);
      qb.write(s.name);
      qb.color(5);
      qb.write(' and hits the ');
      qb.color(15);
      qb.write(e.name);
      qb.color(5);
      qb.write(' for ');
      this.jmp -= s.mc;
      const dmg = spellHits(s, e, this.rng);
      qb.color(15);
      qb.write(dmg);
      qb.color(5);
      qb.print('damage!!');
      return dmg;
    }
  }

  // ---- Items ----

  private async itemlist(): Promise<void> {
    const qb = this.qb;
    qb.cls();
    qb.print('Weapon:  ', WEAPONS[this.weapon][0], ' (strength: ', this.jw, ')');
    qb.print('Armor:  ', ARMORS[this.armor]?.[0] ?? '');
    qb.print('Shield:  ', SHIELDS[this.shield] ?? '');
    qb.print('Money:  $', this.money);
    qb.print('Hit Points: ', this.jhp, '/', this.maxhp);
    qb.print('Magic points: ', this.jmp, '/', this.maxmp);
    qb.print('level: ', this.lev);
    qb.print('Exp points: ', this.jex);
    qb.print('     to next level: ', this.nexp - this.jex, '(to ', this.nexp, ')');
    qb.print();
    qb.print('Attack: ', this.ja);
    qb.print('Strength: ', this.jt);
    qb.print('Defense: ', this.jd);
    qb.print();
    qb.print();
    qb.locate(1, 40);
    qb.print('Items:');
    for (let inum = 1; inum <= 20; inum++) {
      qb.locate(inum + 1, 40);
      qb.print(ITEMS[this.ittoms[inum]] ?? ' ');
    }
    qb.print('Press ENTER...');
    await this.pressenter();
  }

  /** useitem: returns the damage a sleep potion did (0 otherwise). */
  private async useitem(e?: Enemy): Promise<number> {
    const qb = this.qb;
    for (;;) {
      qb.print('Use what number?');
      qb.print('0 to exit');
      for (let inum = 1; inum <= 20; inum++) qb.print(inum, '-', ITEMS[this.ittoms[inum]] ?? ' ');
      const inum = await qb.inputNumber();
      if (inum === 0) return 0;
      if (!(inum > 0 && inum < 21 && Number.isInteger(inum))) continue;
      const item = this.ittoms[inum];
      if (!item) {
        qb.print("You don't have that!");
        await this.delay(3);
        continue;
      }
      if (item === 1 || item === 3) {
        // The original didn't handle the mega potions at all: buying one wasted the
        // money. They restore twice as much here.
        this.ittoms[inum] = 0;
        qb.print('Jimmy uses ', ITEMS[item]);
        await this.delay(1.5);
        qb.print('Jimmy feels better!');
        this.jhp = Math.min(this.maxhp, this.jhp + (item === 1 ? 10 : 20));
        await this.pressenter();
      } else if (item === 2 || item === 4) {
        this.ittoms[inum] = 0;
        qb.print('Jimmy uses ', ITEMS[item]);
        await this.delay(1.5);
        qb.print('Jimmy feels restored');
        this.jmp = Math.min(this.maxmp, this.jmp + (item === 2 ? 10 : 20));
        await this.pressenter();
      } else if (item === 5) {
        if (this.battle === 0 || !e) {
          qb.print('Can only be used in battle');
          await this.pressenter();
          return 0;
        }
        // The original never used the potion up, so one bought endless free hits.
        this.ittoms[inum] = 0;
        qb.print('Jimmy uses the sleep potion...');
        await this.delay(2);
        qb.print('The ', e.name, ' falls asleep!!');
        await this.delay(4);
        qb.write('Jimmy attacks for ');
        qb.color(15);
        const hit = sleepHit(this.jw + this.jt + this.ja, this.rng);
        qb.write(hit);
        qb.color(5);
        qb.print('damage!!');
        return hit;
      }
      return 0;
    }
  }
}

export async function jimmyx(qb: QB): Promise<void> {
  const game = new JimmyX(qb);
  if (import.meta.env.DEV) (window as unknown as { __jx: JimmyX }).__jx = game;
  await game.run();
}

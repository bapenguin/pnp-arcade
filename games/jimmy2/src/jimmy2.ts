// Jimmy 2: The Final Voyage, Nick Puleo and David Paul, ported from legacy/JIMMY2.BAS
// (the last save is dated May 1996).
//
// Like Jimmy 1, the original is labels joined by GOTO, GOSUB that never RETURNs, and code
// that falls through from one label into the next, so this port keeps the shape: one
// block per label, each returning the label to go to next.
//
// The original was never finished. Past the Well of Elders every choice ran into " DIE",
// " YOU die" and the item list, and then (because the item list RETURNed to the last
// GOSUB) back to the same menu, forever. The blocks marked "New" finish the story along
// the route the game itself gives ("turn left at the Well Of Elders and then turn right at
// the Temple of Asterixey"), using the items its item list names but never hands out.
//
// Deliberate changes are marked "The original…" and listed in ../PLAN.md. In short:
//  - Typing something that isn't a choice asks again. The original usually fell through
//    into the next block instead (at the warrior, that was "Talk", and death).
//  - Finding the bow after meeting the monkey no longer loses the monkey.
//  - Messages the original cleared before they could be read get a pause.

import type { QB } from '../../../shared/qb/qb';
import { flash, magic } from './effects';
import { intro } from './intro';

type Block = () => Promise<string>;

// New: Jimmy 1's win$ tune, for the ending (Jimmy 2 has only its two spooky ones), and a
// hum for the Magic Sword.
const WIN = 'Mb o3  l16 ccc l1e l16 ccc l1 f';
const HUM = 'mf o4 l16 c e g o5 c o4 g e l4 c';

/** New: what Brother Larry pays for a weapon. The lance comes back at full price ("store credit"). */
const SELL_WEAPON = [0, 25, 225, 10, 500, 0];

export async function jimmy2(qb: QB): Promise<void> {
  // BASIC variables. `time` is the story flag, not a clock (the item list calls it
  // "Points"): 0 = start, 1 = has a weapon, 2 = has the monkey, and in the new content
  // 3 = passed the trial, 4 = crossed the chasm, 5 = got past the chief, 15 = won. The
  // original also set up guESS, NOMO, charm, leave and flag, which it never got to use.
  let shield = 0, armor = 0, weapon = 0, MONEY = 0, time = 0, win = 0;
  let rope = false, chainsaw = false, woodpcs = false;

  const ask = async () => (await qb.input()).toUpperCase();
  /** New: lines of dialogue in colours, as Jimmy X does it ([colour, text]). */
  const say = (lines: [number, string][]) => {
    for (const [c, text] of lines) {
      qb.color(c, 0, 0);
      qb.print(text);
    }
  };

  async function itemlist(): Promise<void> {
    qb.cls();
    const weapname = ['Unarmed', 'Ginsu Knife', "Lulu's Lance", 'Bow and arrow', "Puleo's Pulverizer", 'Magic Sword'][weapon] ?? '';
    qb.print('Weapon:  ', weapname);
    qb.print('Armor:  ', ['None', "Paul's Armor", 'Chain Mail', 'Magical'][armor] ?? '');
    qb.print('Shield:  ', ['None', "Dragon's Skin Shield", 'Iron', 'Magical'][shield] ?? '');
    qb.print('Money:  $', MONEY);
    qb.print('Points: $', time);
    qb.print('Items:');
    if (rope) qb.print('Rope');
    if (chainsaw) qb.print('Chainsaw');
    if (woodpcs) qb.print('500 pieces of wood');
    qb.print('Press ENTER...');
    await qb.sleep();
  }

  const B: Record<string, Block> = {
    async start() {
      qb.print('PLAY INTRO?');
      // The original only took a capital "Y" (Caps Lock was meant to be on).
      if ((await ask()) === 'Y') await intro(qb);
      shield = armor = weapon = MONEY = time = win = 0;
      rope = chainsaw = woodpcs = false;
      qb.cls();
      return 'here';
    },

    // ---- The edge of the jungle ----
    async here() {
      qb.cls();
      qb.color(5, 0, 0);
      qb.print(' Jimmy is on the edge of the jungle.  What should he do.');
      qb.print(' Press 1 to search for a weapon.  ');
      qb.print(' Press 2 to walk deeper into the jungle');
      qb.print(' Press 3 to try and find someone to talk to');
      return 'hereAsk';
    },
    async hereAsk() {
      const jun = await ask();
      if (jun === '1') return 'weap';
      if (jun === '2') return 'deeper';
      if (jun === '3') return 'monkey';
      // The original fell through into weap.
      return 'hereAsk';
    },
    async weap() {
      qb.cls();
      // The original checked `time = 1` here and then set `time = 1`, so looking for a
      // weapon after finding the monkey (time 2) silently lost the monkey, and with it the
      // only way past the hunter's pit. Now the bow is found once and the monkey stays.
      if (weapon !== 0) {
        qb.print(' You already have a weapon');
        await qb.sleep(5);
        return 'here';
      }
      qb.color(8, 0, 0);
      qb.print(' Jimmy searches around and finds a stick.  As he looks more he finds an');
      qb.print(' arrow head.  Then he makes a bow and arrow.');
      await qb.sleep(10);
      if (time === 0) time = 1;
      weapon = 3;
      await qb.sleep();
      return 'here';
    },
    async deeper() {
      qb.color(9, 0, 0);
      qb.cls();
      if (time === 0) qb.print(" Don't you think you should get a weapon first");
      // The original paused here first, then printed "You walk deeper" and cleared it
      // straight away in `deep`. The line now shows during the pause.
      qb.color(5, 0, 0);
      if (time === 1 || time === 2) qb.print(' You walk deeper into the jungle');
      await qb.sleep();
      return 'deep';
    },
    async monkey() {
      if (time === 2) {
        qb.print(' No one is around');
        // The original also paused 4 seconds before finding the monkey, with nothing on screen.
        await qb.sleep(4);
        return 'here';
      }
      qb.color(3, 0, 0);
      qb.cls();
      qb.print(' Jimmy searches around and sees a monkey on a tree');
      qb.print(' The monkey seems to be attracted to Jimmy and it follows him around');
      await qb.sleep(7);
      time = 2;
      return 'here';
    },

    // ---- Deeper in ----
    async deep() {
      qb.cls();
      qb.color(1, 0, 0);
      if (time === 2) return 'nopit';
      qb.print(' Jimmy walks right over a hunters trap pit.');
      // The original ended the game (CLS, END) before this could be read.
      await qb.sleep();
      return 'fini';
    },
    async nopit() {
      qb.cls();
      qb.print(' Jimmy is just about to take another step when the monkey points');
      qb.print(' out a hunters pit. BOY that was close! ');
      await qb.sleep(10);
      qb.cls();
      qb.print(' Press 1 to walk further in');
      qb.print(' press 2 to see your items');
      return 'nopitAsk';
    },
    async nopitAsk() {
      const t = await ask();
      if (t === '1') return 'fut';
      if (t === '2') {
        // The item list RETURNs here, and the original fell through into fut.
        await itemlist();
        return 'fut';
      }
      return 'nopitAsk';
    },
    async fut() {
      qb.cls();
      qb.color(2, 0, 0);
      qb.print(' You walk further into the jungle when you see a light ');
      qb.print(' over towards the opposite of the opposite of your right.');
      qb.print(' Press 1 to go right');
      qb.print(' Press 2 to go left');
      const r = await ask();
      if (r === '1') return 'righ';
      if (r === '2') return 'left';
      return 'fut';
    },
    async left() {
      qb.color(4, 0, 0);
      qb.cls();
      qb.print(" That's not the opposite of the opposite or your right.");
      qb.print(' You get lost forever.');
      await qb.sleep();
      return 'fini';
    },

    // ---- The hut ----
    async righ() {
      qb.cls();
      qb.print(' You found the hut. ');
      qb.print('Press 1 to knock on the door');
      qb.print('Press 2 to BANG on the door');
      const b = await ask();
      if (b === '1') return 'noone';
      if (b === '2') return 'man';
      return 'righ';
    },
    async noone() {
      qb.print(' You knock on the door but know one answers');
      // The original went straight back to `righ`, which cleared the screen.
      await qb.sleep(3);
      return 'righ';
    },
    async man() {
      qb.print(' You knock on the door and a man answers');
      qb.print(' I will let you come in if you guess the number I am thinking of in six');
      qb.print(' tries(hint: 1-100)');
      await qb.sleep();
      qb.cls();
      const num = Math.floor(100 * Math.random()) + 1;
      for (let x = 1; x <= 6; x++) {
        const numb = await qb.inputNumber();
        if (numb < num) qb.print("Nup, It's higher than that!");
        if (numb > num) qb.print('Lower, like lower than dirt ');
        if (numb === num) return 'win';
      }
      qb.print('You lose the numdber was', num);
      await qb.sleep();
      return 'more';
    },
    async win() {
      qb.print('WOW!! You read my mind; come in and lets chat.');
      win = 1;
      await qb.sleep();
      return 'RIGHT';
    },
    async RIGHT() {
      qb.cls();
      qb.color(2, 0, 0);
      qb.print(' Good Job.  Now I will tell you how to find the man you are looking for');
      qb.print(' To find him you must first turn left at the Well Of Elders and then turn ');
      qb.print(' right at the Temple of Asterixey. The old man says I see you found ');
      qb.print(" monkey.  Thankyou.  Here is a bit of a reward.  Jimmy gets Puleo's Pulverizer.");
      weapon = 4;
      qb.print('You leave the hut ');
      await qb.sleep();
      qb.cls();
      qb.color(4, 0, 0);
      qb.print(' Should you walk forward (1)');
      qb.print(' Or should you turn around (2) ');
      return 'RIGHTAsk';
    },
    async RIGHTAsk() {
      const now = await ask();
      if (now === '1') return 'more';
      if (now === '2') return 'deep';
      // The original fell through into `more`.
      return 'RIGHTAsk';
    },

    // ---- The hollow log and the Mombizan warrior ----
    async more() {
      qb.cls();
      if (win === 0) {
        qb.print(' You strained your brain trying to think of that number you pass out and die.');
        // The original ended the game before this could be read.
        await qb.sleep();
        return 'fini';
      }
      qb.color(4, 0, 0);
      qb.print(' As you walk deeper into the jungle you come across a hollow log');
      qb.print(' Press 1 to search the log');
      qb.print(' Press 2 to keep going');
      return 'moreAsk';
    },
    async moreAsk() {
      const log = await ask();
      if (log === '1') return 'login';
      if (log === '2') return 'keep';
      // The original fell through into searching the log.
      return 'moreAsk';
    },
    async login() {
      if (armor === 1) qb.print(' You find nothing of value');
      if (armor === 0) {
        qb.color(6, 0, 0);
        qb.cls();
        qb.print(" You look in the log and find Paul's Armor");
        await qb.sleep();
        armor = 1;
      }
      return 'keep';
    },
    async keep() {
      qb.print(' You keep going farther into the jungle when you come across a Mombizan warrior');
      qb.print(' Press 1 to attack ');
      qb.print(' Press 2 to talk');
      return 'keepAsk';
    },
    async keepAsk() {
      const mam = await ask();
      if (mam === '1') return 'attack';
      if (mam === '2') return 'Talk';
      // The original fell through into Talk, and death.
      return 'keepAsk';
    },
    async Talk() {
      qb.print(' before Jimmy can say  a word he is killed.');
      await qb.sleep();
      return 'fini';
    },
    async attack() {
      if (armor === 0) {
        qb.print(' Before Jimmy can lift to strike he is pierced by 10 arrows.');
        await qb.sleep();
        return 'fini';
      }
      qb.color(3, 0, 0);
      qb.print(' Before Jimmy can attack 10 arrows are shot at him.  Thank God he');
      qb.print("was wearing Paul's armor.  Jimmy lifts up the pulvorizer and knocks the");
      qb.print(' warrior flat on his butt.  Jimmy takes the warriors shield and weapons.');
      await qb.sleep();
      shield = 1;
      weapon = 1;
      return 'nex';
    },

    // ---- The Well of Elders, where the original stops ----
    async nex() {
      qb.cls();
      qb.print(' You walk further into the jungle when you come across an old man.');
      qb.print(' You follow him to a well; he takes a sip of the water.');
      qb.print('Press 1 to go left ');
      qb.print(' Press 2 to go right');
      qb.print(' Press 3 to take a sip of water');
      const well = await ask();
      if (well === '1') return 'le';
      if (well === '2') return 'ri';
      if (well === '3') return 'old';
      return 'nex';
    },
    async le() {
      qb.cls();
      qb.color(4, 0, 0);
      qb.print(' You go left a see a huge temple');
      qb.print('Jimmy heeds the words of the wise old man and goes left at the well.');
      qb.print('Press 1 to go in th temple');
      qb.print('Press 2 to go to the right');
      qb.print('Press 3 to go back to the well');
      const tem = await ask();
      // `intemple`, `rt` and `lt` were empty labels that ran on into `ri`, `old` and the
      // item list, then back to this menu, forever. They're written now (New).
      if (tem === '1') return 'intemple';
      if (tem === '2') return 'rt';
      if (tem === '3') return 'nex';
      return 'le';
    },
    // The original's " DIE" and " YOU die" had no lead-up and didn't end the game (above).
    // New: a reason each, then the end.
    async ri() {
      qb.color(4, 0, 0);
      qb.print(' Jimmy goes right.  The old man in the hut said LEFT at the well.');
      qb.print(' Jimmy walks right into a Mombizan cooking pot.  It is soup night.');
      qb.print(' DIE');
      await qb.sleep();
      return 'fini';
    },
    async old() {
      qb.color(4, 0, 0);
      qb.print(' Jimmy takes a sip of the water.  The old man smiles.  He has no teeth.');
      qb.print(' This is the Well of Elders.  Its water makes you an elder.  Jimmy turns 90,');
      qb.print(' then 100, then 110...');
      qb.print(' YOU die');
      await qb.sleep();
      return 'fini';
    },

    // ---- New: inside the Temple of Asterixey ----
    async intemple() {
      qb.cls();
      qb.color(6, 0, 0);
      qb.print(" Jimmy walks into the Temple of Asterixey.  It's huge, and it smells like feet.");
      qb.print(' A little monk sits behind a counter by the door, under a sign:');
      qb.color(14, 0, 0);
      qb.print('     TEMPLE GIFT SHOP.  NO REFUNDS.  NO SHIRT, NO SHOES, NO SALVATION.');
      qb.color(6, 0, 0);
      if (time >= 3) qb.print(' At the far end, a pile of gravel lies in front of an empty altar.');
      else qb.print(' At the far end, a stone guardian stands in front of an altar.');
      qb.print(' Press 1 to visit the gift shop');
      qb.print(time >= 3 ? ' Press 2 to look at the altar' : ' Press 2 to go up to the altar');
      qb.print(' Press 3 to see your items');
      qb.print(' Press 4 to leave the temple');
      return 'intempleAsk';
    },
    async intempleAsk() {
      const c = await ask();
      if (c === '1') return 'shop';
      if (c === '2') return time >= 3 ? 'gravel' : 'altar';
      if (c === '3') {
        await itemlist();
        return 'intemple';
      }
      if (c === '4') return 'le';
      return 'intempleAsk';
    },
    async gravel() {
      qb.print(' Brother Larry is sweeping up the guardian.  He glares at Jimmy the whole time.');
      await qb.sleep(4);
      return 'intemple';
    },

    // ---- New: Brother Larry's gift shop. Jimmy 1's hint, "when you buy your weapons make
    // sure you sell the one you have", finally applies. The jungle holds exactly $275 (the
    // knife and the shield), which is the lance plus the rope. ----
    async shop() {
      qb.cls();
      qb.color(3, 0, 0);
      qb.print(' Brother Larry: Welcome to the Temple of Asterixey gift shop!  Everything is');
      qb.print('                blessed.  Blessing costs extra.');
      qb.print();
      qb.color(7, 0, 0);
      qb.print(' Money: $', MONEY);
      qb.print();
      qb.print(" Press 1 to buy Lulu's Lance ($225)");
      qb.print(' Press 2 to buy some rope ($50)');
      qb.print(' Press 3 to buy Chain Mail ($200)');
      qb.print(' Press 4 to buy the Magic Sword ($5000)');
      qb.print(' Press 5 to sell your weapon');
      qb.print(' Press 6 to sell your shield');
      qb.print(' Press 7 to leave the shop');
      return 'shopAsk';
    },
    async shopAsk() {
      const c = await ask();
      qb.color(3, 0, 0);
      if (c === '1') {
        if (weapon === 2) qb.print(" Brother Larry: You've already got it.  It's in your hand.  Genius.");
        else if (weapon !== 0) qb.print(' Brother Larry: One weapon at a time, pal.  Sell the one you have first.');
        else if (MONEY < 225) qb.print(" Brother Larry: Will that be cash or...  oh.  You don't have enough money.");
        else {
          MONEY -= 225;
          weapon = 2;
          qb.print(" Brother Larry: Lulu's Lance!  Long, pointy, and it's got a tassel.  Enjoy.");
        }
      } else if (c === '2') {
        if (rope) qb.print(" Brother Larry: You've already got rope.  It's still rope.");
        else if (MONEY < 50) qb.print(" Brother Larry: It's ROPE.  You can't afford ROPE?  How are you this broke?");
        else {
          MONEY -= 50;
          rope = true;
          qb.print(' Brother Larry: One rope.  Holy rope.  Do not hang anything unholy on it.');
        }
      } else if (c === '3') {
        qb.print(" Brother Larry: You're already wearing Paul's Armor.  That's like ten times");
        qb.print("                better.  I can't sell you this in good conscience.");
        qb.print(' Brother Larry: ...For $200 I could.');
        qb.color(5, 0, 0);
        qb.print(" Jimmy: I'll pass.");
      } else if (c === '4') {
        if (weapon === 5) qb.print(' Brother Larry: Oh.  You got the real one.  Mine is fake.  Sell it?  $3.');
        else {
          qb.print(" Brother Larry: That's the display model.  For $5000 you can look at it from");
          qb.print('                closer up.  The real one is on the altar.  Ask the guardian.');
        }
      } else if (c === '5') {
        if (weapon === 0) qb.print(" Brother Larry: You don't HAVE a weapon, genius.");
        else if (weapon === 5) qb.print(" Brother Larry: The Magic Sword?  Keep it.  You're going to need it.");
        else {
          const names = ['', 'A Ginsu Knife!  It cuts a tin can AND a tomato!', "Lulu's Lance?  No refunds.  Store credit.", 'A homemade bow.  Cute.', "Puleo's Pulverizer!  Now we're talking."];
          qb.print(' Brother Larry: ' + names[weapon], ' $' + String(SELL_WEAPON[weapon]) + '.');
          MONEY += SELL_WEAPON[weapon];
          weapon = 0;
        }
      } else if (c === '6') {
        if (shield === 0) qb.print(" Brother Larry: You don't HAVE a shield, genius.");
        else {
          qb.print(" Brother Larry: Dragon's skin!  A real dragon?  ...Don't answer that.  $250.");
          MONEY += 250;
          shield = 0;
        }
      } else if (c === '7') {
        return 'intemple';
      } else {
        return 'shopAsk';
      }
      await qb.sleep(4);
      return 'shop';
    },

    // ---- New: the altar, and the Trial of Asterixey. Uses SUB magic, which the
    // original declared and never called. ----
    async altar() {
      qb.cls();
      say([
        [4, " Jimmy walks up to the altar.  The stone guardian's eyes start to glow."],
        [12, ' Guardian: WHO DISTURBS THE ALTAR OF ASTERIXEY?'],
        [5, ' Jimmy: Uh... Jimmy?'],
        [12, ' Guardian: NONE SHALL TAKE THE MAGIC SWORD WHO HAS NOT PASSED THE TRIAL.'],
        [5, " Jimmy: Is the trial a number game?  Please don't let it be a number game."],
        [12, ' Guardian: BEHOLD!'],
        [7, ''],
        [7, ' (Press any key to stop beholding)'],
      ]);
      await qb.sleep(4);
      await magic(qb);
      // Mashed keys from stopping the magic would otherwise turn up in the next answer.
      qb.keys.clear();
      return 'fist';
    },
    async fist() {
      qb.cls();
      qb.color(4, 0, 0);
      qb.print(' The guardian swings a stone fist the size of a bathtub.');
      qb.print(' Press 1 to attack');
      qb.print(' Press 2 to use magic');
      qb.print(' Press 3 to run');
      return 'fistAsk';
    },
    async fistAsk() {
      const c = await ask();
      if (c === '1') return 'trial';
      if (c === '2') {
        qb.print(' Jimmy uses the trick from the temple and makes the guardian go blind.');
        qb.print(" The guardian was already blind.  It's a statue.  It doesn't care.");
        await qb.sleep(5);
        return 'fist';
      }
      if (c === '3') {
        qb.print(" Jimmy runs for the door.  The guardian's eyes stop glowing.  Statues have");
        qb.print(' short attention spans.');
        await qb.sleep(5);
        return 'intemple';
      }
      return 'fistAsk';
    },
    async trial() {
      qb.cls();
      qb.color(4, 0, 0);
      if (weapon === 2) {
        qb.print(" Jimmy holds out Lulu's Lance.  The lance is long.  The guardian's arms are");
        qb.print(' short.  The guardian swings at Jimmy for a while and then falls apart into');
        qb.print(' gravel.');
        qb.color(14, 0, 0);
        qb.print(' The altar opens.  Jimmy gets the Magic Sword!');
        qb.color(4, 0, 0);
        qb.print(" (He leaves Lulu's Lance sticking out of the gravel.  It still has the tassel.)");
        weapon = 5;
        time = 3;
        await qb.sleep();
        return 'intemple';
      }
      if (weapon === 0) {
        qb.print(' Jimmy punches the guardian.  The guardian is made of stone.  Jimmy is made');
        qb.print(' of Jimmy.');
      } else if (weapon === 1) {
        qb.print(' Jimmy stabs the guardian with the Ginsu Knife.  It cuts through a tin can, a');
        qb.print(' tomato, and nothing else.');
      } else {
        qb.print(" Jimmy hits the guardian as hard as he can.  It's a statue.  It doesn't notice.");
      }
      qb.print(' The guardian sits on Jimmy.');
      await qb.sleep();
      return 'fini';
    },

    // ---- New: right at the temple, as the old man in the hut said ----
    async rt() {
      qb.cls();
      qb.color(2, 0, 0);
      qb.print(' Jimmy heeds the words of the old man in the hut and goes right at the temple.');
      qb.print(' The path ends at a chasm.  There is a sign:');
      qb.color(14, 0, 0);
      qb.print('     BRIDGE OUT.  SOMEBODY TOOK 500 PIECES OF WOOD.');
      qb.color(5, 0, 0);
      qb.print(" Jimmy: ...That wasn't me.  That was a different planet.");
      qb.color(2, 0, 0);
      qb.print(' Press 1 to jump across');
      qb.print(rope ? ' Press 2 to swing across on your rope' : ' Press 2 to look for a way across');
      qb.print(' Press 3 to go back to the temple');
      return 'rtAsk';
    },
    async rtAsk() {
      const c = await ask();
      if (c === '1') {
        qb.print(' Jimmy takes a running jump.  He gets about halfway.');
        qb.print(' Jimmy falls for a very long time.');
        await qb.sleep();
        return 'fini';
      }
      if (c === '2' && !rope) {
        qb.print(' There is a big tree at the edge.  If only Jimmy had some rope.');
        await qb.sleep(4);
        return 'rt';
      }
      if (c === '2') {
        qb.print(' Jimmy ties the rope to the tree and swings across like a monkey.  The monkey');
        qb.print(' would be proud.');
        if (time < 4) time = 4;
        await qb.sleep(5);
        return time >= 5 ? 'creek' : 'chief';
      }
      if (c === '3') return 'le';
      return 'rtAsk';
    },

    // ---- New: the Mombizan chief, who has heard about his warrior ----
    async chief() {
      qb.cls();
      say([
        [4, ' On the other side, a huge Mombizan in a feather hat steps out of the trees.'],
        [12, ' Mombizan Chief: YOU!  You knocked my warrior flat on his butt!'],
        [12, ' Mombizan Chief: He has to sit on a pillow now.  A PILLOW.'],
        [4, ' Press 1 to attack'],
        [4, ' Press 2 to talk'],
        [4, ' Press 3 to swing back across the chasm'],
      ]);
      return 'chiefAsk';
    },
    async chiefAsk() {
      const c = await ask();
      qb.color(4, 0, 0);
      if (c === '1' && weapon === 5) {
        qb.print(' Jimmy draws the Magic Sword.  It glows.  It hums.  It plays a little tune.');
        await qb.play(HUM);
        qb.print(' The chief looks at the sword.  The chief looks at Jimmy.');
        qb.color(12, 0, 0);
        qb.print(' Mombizan Chief: ...I just remembered I left the oven on.');
        qb.color(4, 0, 0);
        qb.print(' The chief runs away.  Jimmy follows the path along a creek.');
        time = 5;
        await qb.sleep();
        return 'creek';
      }
      if (c === '1') {
        if (weapon === 2) {
          qb.print(" Jimmy pokes the chief with Lulu's Lance.  The chief snaps it over one knee,");
          qb.print(' then snaps Jimmy over the other.');
        } else {
          qb.print(' Before Jimmy can lift to strike he is pierced by 10 arrows.  Paul\'s Armor');
          qb.print(' stops them all.  Then the chief sits on him.');
        }
        await qb.sleep();
        return 'fini';
      }
      if (c === '2') {
        qb.color(5, 0, 0);
        qb.print(' Jimmy: Look, about your warrior...');
        qb.color(4, 0, 0);
        qb.print(' before Jimmy can say  a word he is killed.');
        await qb.sleep();
        return 'fini';
      }
      if (c === '3') {
        qb.print(' Jimmy swings back across the chasm.  The chief shouts something about pillows.');
        await qb.sleep(4);
        return 'le';
      }
      return 'chiefAsk';
    },

    // ---- New: Bestaw's hut, by the creek ----
    async creek() {
      qb.cls();
      qb.color(6, 0, 0);
      qb.print(' The path ends at a little hut by the creek.  The sign on the door says:');
      qb.color(14, 0, 0);
      qb.print("     GO AWAY.  I'M A HERMIT.");
      qb.color(8, 0, 0);
      qb.print(" Something in the bushes disapears.  Jimmy doesn't notice.");
      qb.color(6, 0, 0);
      qb.print(' Press 1 to knock on the door');
      qb.print(' Press 2 to BANG on the door');
      qb.print(' Press 3 to shout "I HAVE YOUR STATUE!"');
      return 'creekAsk';
    },
    async creekAsk() {
      const c = await ask();
      if (c === '1') {
        qb.print(' You knock on the door but know one answers');
        qb.print(' A voice inside: I SAID GO AWAY.');
        await qb.sleep(4);
        return 'creek';
      }
      if (c === '2') {
        qb.print(" A voice inside: Banging only works on my neighbour.  He's a pushover.");
        await qb.sleep(4);
        return 'creek';
      }
      if (c === '3') return 'bestaw';
      return 'creekAsk';
    },
    async bestaw() {
      qb.cls();
      // Jimmy X picks up from here: FORGON in the corner for two years, Bob alive, and
      // "You got that sword from a guy in a bar who VANISHED".
      say([
        [6, ' The door creaks open.  An old man with a beard down to his knees glares out.'],
        [6, ' Hermit: Statue?  What statue?'],
        [5, " Jimmy: This one!  FORGON or FARGAN or something!  You're BASTEW, right?"],
        [6, ' Hermit: BESTAW.  Not Bastew.  Who told you to bring me that?'],
        [5, ' Jimmy: A guy in a bar.'],
        [6, ' Hermit: ...Did he vanish right after?'],
        [5, ' Jimmy: Kind of, yeah.'],
        [6, ' Bestaw turns the statue over.  On the bottom it says PROPERTY OF BOB.'],
        [6, ' Hermit: Kid.  Where did you GET this?'],
        [5, " Jimmy: Bob's temple.  After I killed Bob.  With a magic sword!"],
        [6, ' Hermit: Sure you did.  Put it in the corner.  And make it stop looking at me.'],
        [7, ' Jimmy puts FORGON in the corner.  FORGON looks at Bestaw.'],
        [6, ' Hermit: Great.  Now get off my planet.'],
      ]);
      await qb.sleep();
      return 'ending';
    },
    async ending() {
      time = 15;
      qb.cls();
      say([
        [14, ' Jimmy did it.  FORGON is delivered.  The Final Voyage is over.'],
        [5, ' Jimmy: So...  how do I get home?'],
        [6, " Hermit: Not my problem.  I'm a hermit."],
      ]);
      await qb.sleep(8);
      await flash(qb);
      await qb.play(WIN);
      // In the style of Jimmy 1's ending.
      qb.color(7, 0, 0);
      qb.cls();
      qb.print(' by');
      await qb.sleep(2);
      qb.cls();
      qb.print(' NICK PULEO');
      qb.print('                 AND  DAVID PAUL');
      await qb.sleep(4);
      qb.cls();
      qb.print(' LOOK FOR JIMMY X!');
      await qb.sleep(25);
      qb.cls();
      qb.print(' CONGRATULATIONS');
      await qb.sleep();
      return 'fini';
    },

    async fini() {
      qb.cls();
      return 'END';
    },
  };

  let at = 'start';
  while (at !== 'END') {
    const block = B[at];
    if (!block) throw new Error(`Jimmy 2: no block called ${at}`);
    at = await block();
  }
}

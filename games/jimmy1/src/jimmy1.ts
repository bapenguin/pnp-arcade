// Jimmy (1994), Nick Puleo and David Paul, ported from legacy/JIM.BAK (QuickBASIC's
// automatic backup of JIM.BAS, the last source we have).
//
// The original is one long run of labels joined by GOTO, GOSUB that never RETURNs, and
// code that "falls through" from one label into the next. Several story beats only work
// because of that, so this port keeps the shape: one block per label, each returning the
// label to go to next. Names match the original's labels (line numbers get an `l`).
//
// Deliberate changes are marked "The original…" and listed in ../PLAN.md. In short:
//  - Answers are case-insensitive. The original needed Caps Lock on (JIMMY.DOC says so),
//    which then broke its own lowercase "y"/"n" questions.
//  - Typing something that isn't a choice asks again. The original often fell through
//    into the next block instead: buying a wooden shield, or dying in the wolves' den.
//  - Hangs, softlocks and mis-wired purchases are fixed.
//  - Messages the original cleared before they could be read get a short pause.

import type { QB } from '../../../shared/qb/qb';

const WIN = 'Mb o3  l16 ccc l1e l16 ccc l1 f';
const JUMP = 'o1 l64 cdefgab o2cdefgab o3cdefgab o4cdefgab o5cdefg o1 l1 d';
const DEATH = 'o3 Mn l4c l8 cl1 f p2 l4 c l8fl1a';
const STAR = 'mB t140 o4 l2 cf o5 l1c o4 l4 b-ag o5 l3 f l1 c o4 l4 b-ag o5 l3 f l1 c l4 b-ab- l1 g';
const M16 = 'ms o1 l32 ccccccccccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC';

// The title logo, from the CP437 block characters in JIM.BAK.
const LOGO = [
  '                    ▄▄▄▄▄▄▄▄▄  ▄  ▄▄     ▄▄  ▄▄     ▄▄  ▄▄   ▄▄',
  '                        ██     █  █ ▀▄ ▄▀ █  █ ▀▄ ▄▀ █    ▀▄▀ ',
  '                        ██     █  █   █   █  █   █   █     █ ',
  '                    ██  ██  INTERACTIVE',
  '                    ▀▀▀▀▀▀',
];

type Block = () => Promise<string>;

export async function jimmy1(qb: QB): Promise<void> {
  // BASIC variables. TIME is the story's progress flag, not a clock (the item list
  // calls it "Points").
  let shield = 0, armor = 0, WEAPON = 0, MONEY = 0, TIME = 0, NOMO = 0, charm = 0;
  let rope = false, chainsaw = false, woodpcs = false;
  let v = 0, av = 0, sv = 0;

  const ask = async () => (await qb.input()).toUpperCase();
  // The original printed some lines and cleared the screen straight away, so they
  // flashed past unread. A pause (a key skips it) lets them be read.
  const readable = () => qb.sleep(1.5);

  async function itemlist(): Promise<void> {
    qb.cls();
    const weapname = ['Unarmed', 'Knife', 'Crossbow', 'Spear', 'Revolver', 'Magic Sword'][WEAPON] ?? '';
    qb.print('Weapon:  ', weapname);
    qb.print('Armor:  ', ['None', 'Leather', 'Chain Mail', 'Magical'][armor] ?? '');
    qb.print('Shield:  ', ['None', 'Wooden', 'Iron', 'Magical'][shield] ?? '');
    qb.print('Money:  $', MONEY);
    qb.print('Points: $', TIME);
    qb.print('Items:');
    if (rope) qb.print('Rope');
    if (chainsaw) qb.print('Chainsaw');
    if (woodpcs) qb.print('500 pieces of wood');
    qb.print('Press ENTER...');
    await qb.sleep();
  }

  async function lookattree(): Promise<void> {
    qb.print("There is a carving on the tree that says, 'THERE IS ANOTHER TOWN, ON THE OTHER SIDE OF THE CASTLE.  TO GET TO THE SECOND TOWN, YOU MUST GO THROUGH THE CASTLE");
    await qb.sleep();
  }

  const B: Record<string, Block> = {
    // ---- Title, and the restart point every death jumps back to ----
    async start() {
      qb.cls();
      qb.tab(25);
      qb.print('Welcome to . . .   ');
      qb.color(2, 0, 2);
      for (const line of LOGO) qb.print(line);
      qb.color(7, 0, 2);
      await qb.play(STAR);
      await qb.sleep();
      return 'l10';
    },
    async l10() {
      shield = armor = WEAPON = MONEY = TIME = NOMO = charm = 0;
      rope = chainsaw = woodpcs = false;
      qb.cls();
      return 'BEGIN';
    },

    // ---- The castle ----
    async BEGIN() {
      qb.cls();
      qb.print('JIMMY ENTERS THE HALL PRESS');
      qb.print('x to go left');
      qb.print('y to go right');
      qb.print('Press Q to Quit');
      const move = await ask();
      if (move === 'X') return 'LEFT';
      if (move === 'Y') return 'y';
      if (move === 'Q') return 'FINI';
      // The original went to line 10 here, which also wiped Jimmy's items and progress.
      return 'BEGIN';
    },
    async l30() {
      qb.cls();
      qb.print('Jimmy enters a cave');
      qb.print('press X to go down');
      qb.print('press Y to go back');
      const move = await ask();
      if (move === 'X') return 'X';
      // The original went back via line 10, wiping Jimmy's items and progress.
      if (move === 'Y') return 'BEGIN';
      return 'l30';
    },
    async y() {
      qb.print('you moved to the right');
      await qb.sleep(3);
      return 'l30';
    },
    async X() {
      if (TIME === 9) return 'castle';
      qb.print('AAAAAAAAAAAAAAAAAAH!!!');
      qb.print('oops wrong move');
      await qb.play(DEATH);
      await qb.sleep(5);
      return 'l10';
    },
    async LEFT() {
      if (TIME === 9) return 'DOWN';
      qb.print('Jimmy moves to the left');
      await qb.sleep(3);
      qb.cls();
      qb.print('JIMMY confronts a lizard');
      qb.print('press 1. to attack');
      qb.print('press 2. to talk');
      qb.print('press 3. to run');
      return 'l19002';
    },
    async l19002() {
      const move = await ask();
      if (move === '1') return 'One';
      if (move === '2') return 'Two';
      if (move === '3') return 'Three';
      return 'l19002';
    },
    async One() {
      qb.cls();
      qb.print("Since Jimmy doesn't have a weapon, he picks up a stick off the ground");
      qb.print("But it's not a stick it's a snake.  The snake bites Jimmy in the head");
      qb.print('Jimmy has Died.');
      await qb.play(DEATH);
      await qb.sleep(10);
      return 'l10';
    },
    async Two() {
      qb.cls();
      qb.print("JIMMY says, 'hello little lizard, how are you?'");
      await qb.sleep(3);
      qb.print("The lizard says, 'I am fine, why are you here? '");
      await qb.sleep(3);
      qb.print("JIMMY says ,' I don't know but I want to get out of here.'");
      await qb.sleep(3);
      qb.print("The Lizard says,' Go to the town of Canen and see Bob.'");
      await qb.sleep(3);
      qb.print("'How do I get there?' Jimmy asked.");
      await qb.sleep(3);
      qb.print("'Turn Left at the River'Replied the Lizard, and with that, he vanished into a   cloud of smoke.");
      await qb.sleep(3);
      qb.print('Press ENTER to continue.');
      await qb.sleep();
      return 'l100';
    },
    async Three() {
      qb.cls();
      qb.print(' Jimmy starts to run but runs through the wall and falls 50 stories to his death');
      await qb.play(DEATH);
      await qb.sleep(10);
      return 'l10';
    },
    async l99() {
      qb.print('Jimmy runs back to the stairwell');
      await qb.sleep(5);
      return 'l100';
    },
    async l100() {
      qb.cls();
      if (TIME > 1) return 'BEGIN';
      qb.print('YOU ARE STANDING ALONE ON A STAIRWELL');
      qb.print('TO GO UP PRESS 1');
      qb.print('TO GO DOWN AND LEAVE THE CASTLE PRESS 2');
      return 'l1324';
    },
    async l1324() {
      const move = await ask();
      if (TIME > 1) return 'BEGIN';
      if (move === '1') return 'up';
      if (move === '2') return 'DOWN';
      return 'l1324';
    },
    async up() {
      qb.cls();
      qb.print('JIMMY goes up the stairs.');
      qb.print('He sees a knife on the ground and takes it.');
      WEAPON = 1;
      qb.print('HE goes down the stairs and leaves the castle');
      await qb.sleep(8);
      return 'DOWN';
    },

    // ---- The road: the hobbit, the river, the town gate ----
    async DOWN() {
      qb.cls();
      qb.print('JIMMY leaves the castle and goes down the road');
      qb.print('JIMMY sees a hobbit');
      qb.print('press 1 to attack');
      qb.print('press 2 to talk');
      qb.print('press 3 to run');
      qb.print('press 4 to see your weapons and Items');
      qb.print('Quit Game - press Q');
      const move = await ask();
      if (move === '1') return 'die';
      if (move === '2') return 'talk';
      if (move === '3') return 'l99';
      if (move === '4') await itemlist();
      if (move === 'Q') return 'FINI';
      return 'DOWN';
    },
    async die() {
      if (WEAPON === 1) return 'killem';
      return 'yerdead';
    },
    async killem() {
      qb.cls();
      qb.print('JIMMY pulls out his knife and lunges at his foe');
      qb.print('but he hobbit moves and JIMMY falls flat on his face!');
      await qb.sleep(3);
      await qb.play(JUMP);
      qb.print('The hobbit starts laughing so hard he has a heart attack and dies!!');
      qb.print('Jimmy says comedy is dangerous you know');
      await qb.play(WIN);
      await qb.sleep();
      return 'menu';
    },
    async yerdead() {
      qb.print('JIMMY has no weapon');
      qb.print("Jimmy pulls out a nothing because he has nothing so he can't do nothing");
      qb.print('the hobbit shoots a arrow through Jimmy');
      await qb.play(DEATH);
      await qb.sleep(5);
      return 'l10';
    },
    async talk() {
      qb.print('Hello, Hello, is any body home McFly');
      qb.print('the hobbit does not answer Jimmy gets mad');
      await qb.sleep(5);
      return 'die';
    },
    async menu() {
      qb.cls();
      qb.print("PRESS 1. TO SEARCH THE HOBBITS BODY");
      qb.print('PRESS 2. to leave for the town');
      return 'l5678';
    },
    async l5678() {
      const m = await ask();
      if (m === '1') return 'search';
      if (m === '2') return 'leave';
      return 'l5678';
    },
    async search() {
      // It says $311 but sets $455, as in the original.
      qb.print('JIMMY searches the hobbits body and finds a crossbow');
      qb.print('he takes it.  He also finds $311.');
      WEAPON = 2;
      MONEY = 455;
      await qb.sleep(5);
      return 'leave';
    },
    async leave() {
      qb.cls();
      qb.print('Jimmy heads off for town');
      qb.print('he comes to a fork in the road there is a river on his right');
      qb.print('press 1. to keep going forword');
      qb.print('press 2. to go left');
      qb.print('press 3. to go take a dip');
      qb.print('press 4. to see your items and money');
      const m = await ask();
      if (m === '1') return 'forword';
      if (m === '2') return 'GO';
      if (m === '3') return 'forword';
      if (m === '4') await itemlist();
      return 'leave';
    },
    async forword() {
      qb.print('Jimmy looks into the river. He sees a fish. As he reaches out to grab it, the    ground beneath his feet gives way. He falls into the river and is pulled under     by the undertow.');
      await qb.sleep();
      return 'l10';
    },
    async GO() {
      qb.cls();
      if (TIME >= 5) return 'intown';
      qb.print('Jimmy takes the road left, and is soon at the gates to the town. There is a      guard standing in the way.');
      qb.print('Press 1 to attack');
      qb.print('Prees 2 to talk');
      qb.print('Press 3 to run');
      qb.print('Press 4 to see a list of your items and weapon');
      const move = await ask();
      if (move === '1') return 'attack';
      if (move === '2') return 'Chat';
      if (move === '3') return 'ahhh';
      if (move === '4') await itemlist();
      return 'GO';
    },
    async ahhh() {
      qb.print('Jimmy tries to run, but');
      return 'attack';
    },
    async attack() {
      qb.print("The guard pulls out an M16 and points it at Jimmy's head.");
      await qb.sleep(2);
      await qb.play(M16);
      qb.print('Ouch! Boy that has to hurt!  You are DEAD!!');
      await qb.sleep();
      return 'l10';
    },
    async Chat() {
      if (NOMO === 1) return 'intown';
      qb.print('THE TOLL IS 11 DOLLARS');
      await qb.sleep(3);
      if (MONEY < 11) {
        qb.print("'You don't have enough money!!");
        return 'attack';
      }
      // The original's payment lines sat inside the "not enough money" IF block, so
      // the toll was never paid and NOMO ("paid already") never set.
      MONEY -= 11;
      NOMO = 1;
      return 'town';
    },
    async town() {
      qb.color(2, 0, 0);
      qb.print("Here's the eleven bucks");
      qb.color(7, 0, 0);
      qb.print('OK YOU MAY PASS INTO THE TOWN');
      await qb.sleep(5);
      return 'intown';
    },

    // ---- Canen ----
    async intown() {
      qb.cls();
      qb.print('YOU ARE STANDING IN CENTER SQUARE CANEN ');
      qb.print('PRESS 1. TO GO TO THE WEAPON SHOP');
      qb.print('PRESS 2. TO GO TO THE ARMOR SHOP');
      qb.print('PRESS 3. TO GO TO THE BAR.');
      qb.print('PRESS 4. TO TALK TO SOMEONE');
      qb.print('PRESS 5. TO LEAVE THE TOWN');
      qb.print('PRESS 6. TO SEE YOUR ITEMS');
      qb.print('PRESS Q TO QUIT');
      const choice = await ask();
      if (choice === '1') return 'weaponshop';
      if (choice === '2') return 'armorshop';
      if (choice === '3') return 'bar';
      if (choice === '4') return 'BOB';
      if (choice === '5') return 'ExiTown';
      if (choice === '6') await itemlist();
      if (choice === 'Q') return 'FINI';
      return 'intown';
    },
    async weaponshop() {
      qb.cls();
      qb.print('Welcome to the Weapons shop of Canen. How may I help you?');
      qb.print('1) Sell');
      qb.print('2) Buy ');
      qb.print('3) Leave');
      qb.print('4) Show Items   ');
      const choice = await ask();
      if (choice === '1') return 'sell';
      if (choice === '2') return 'buy';
      if (choice === '3') return 'intown';
      if (choice === '4') await itemlist();
      return 'weaponshop';
    },
    async l4554() {
      qb.cls();
      qb.print("You don't HAVE a weapon, genius");
      await qb.sleep(5);
      return 'weaponshop';
    },
    async sell() {
      if (WEAPON === 0) return 'l4554';
      if (WEAPON === 1) v = 50;
      if (WEAPON === 2) v = 100;
      if (WEAPON === 3) v = 150;
      if (WEAPON === 4) v = 350;
      return 'l12';
    },
    async l12() {
      qb.cls();
      qb.print("Hmmmmm. I'll give you ", v, "dollars for it.  How 'bout it?(Y/N)");
      const g = await ask();
      if (g === 'Y') return 'yO';
      if (g === 'N') return 'weaponshop';
      return 'l12';
    },
    async yO() {
      qb.print('Alrighty-then! Here you go.');
      WEAPON = 0;
      MONEY += v;
      v = 0;
      await readable();
      return 'weaponshop';
    },
    async buy() {
      qb.cls();
      qb.print("Well, Here's what we have. Anything Interest Ya?");
      qb.print('              You have $', MONEY);
      qb.print('         1) Knife...............$100');
      qb.print('         2) Crossbow............$200');
      qb.print('         3) Spear...............$300');
      qb.print('         4) Revolver............$700');
      qb.print('         5) No, nothing interests me');
      const b = await ask();
      if (b === '1') return 'Knife';
      if (b === '2') return 'Crossbow';
      if (b === '3') return 'Spear';
      if (b === '4') return 'Revolver';
      if (b === '5') return 'weaponshop';
      return 'buy';
    },
    async Knife() {
      if (MONEY < 100) return 'l321';
      // The original wrote `WEAPON = 1 AND MONEY = MONEY - 100`, which BASIC reads as one
      // comparison: WEAPON became 0 and the money stayed put.
      WEAPON = 1;
      MONEY -= 100;
      return 'l4321';
    },
    async Crossbow() {
      if (MONEY < 200) return 'l321';
      WEAPON = 2;
      MONEY -= 200;
      return 'l4321';
    },
    async Spear() {
      if (MONEY < 300) return 'l321';
      WEAPON = 3;
      MONEY -= 300;
      return 'l4321';
    },
    async Revolver() {
      if (MONEY < 700) return 'l321';
      WEAPON = 4;
      MONEY -= 700;
      return 'l4321';
    },
    async l321() {
      qb.print("you don't have enough money");
      await readable();
      return 'buy';
    },
    async l4321() {
      qb.print('There you go. Thank you very much.');
      await readable();
      return 'weaponshop';
    },

    async armorshop() {
      qb.cls();
      qb.print('welcome to the armor shop of Canen. How may I help you?');
      qb.print(' 1) Buy armor');
      qb.print(' 2) Buy a shield');
      qb.print(' 3) Sell');
      qb.print(' 4) Leave');
      qb.print(' 5) See items');
      const a = await ask();
      if (a === '1') return 'barm';
      if (a === '2') return 'buyshield';
      if (a === '3') return 'sarm';
      if (a === '4') return 'intown';
      if (a === '5') await itemlist();
      return 'armorshop';
    },
    async l90210() {
      qb.print("You're not wearing armor, Einstien");
      await qb.sleep(5);
      return 'armorshop';
    },
    async sarm() {
      if (armor === 0 && shield === 0) return 'l90210';
      if (armor === 1) av = 25;
      if (armor === 2) av = 150;
      if (shield === 1) sv = 25;
      if (shield === 2) sv = 125;
      if (shield === 3) sv = 475;
      if (armor === 0) return 'sellshield';
      return 'l22';
    },
    async l22() {
      qb.cls();
      qb.print("I'll give you ", av, 'dollars for your armor.(Y/N)');
      const a = await ask();
      if (a === 'N') return 'sellshield';
      if (a === 'Y') return 'l4444';
      return 'l22';
    },
    async l4444() {
      qb.print('Thank you very much.');
      // The original set `sheild = 0` (a typo), so the armor was never taken: it could be
      // sold again and again for unlimited money.
      armor = 0;
      MONEY += av;
      await readable();
      return 'sellshield';
    },
    async sellshield() {
      if (shield === 0) return 'armorshop';
      qb.print("How 'bout", sv, 'dollars for yer shield?(Y/N)');
      const b = await ask();
      if (b === 'N') return 'armorshop';
      if (b === 'Y') {
        qb.print('Thank you, kind sir.');
        shield = 0;
        MONEY += sv;
        await readable();
        return 'armorshop';
      }
      return 'sellshield';
    },
    async barm() {
      qb.print('Well, what can I help you with today?');
      qb.print('           Money:  $', MONEY);
      qb.print('   1) Leather Armor...........$50');
      qb.print('   2) Chain Mail.............$300');
      qb.print("   3) This place sucks. I'm gone.");
      const c = await ask();
      if (c === '1') return 'leather';
      if (c === '2') return 'mAil';
      if (c === '3') return 'armorshop';
      return 'barm';
    },
    async leather() {
      if (MONEY < 50) return 'l5566';
      armor = 1;
      MONEY -= 50;
      return 'l6655';
    },
    async mAil() {
      if (MONEY < 300) return 'l5566';
      armor = 2;
      MONEY -= 300;
      return 'l6655';
    },
    async l5566() {
      qb.print('Check your pockets, stupid.');
      await qb.sleep(5);
      return 'barm';
    },
    async l6655() {
      qb.print('Very good choice. Will that be cash or an American Express Card?');
      await qb.sleep(5);
      return 'armorshop';
    },
    async buyshield() {
      qb.print('            money = $', MONEY);
      qb.print('   1) Wooden Shield........50');
      qb.print('   2) Iron Shield..........250');
      qb.print('   3) Magic Shield.........950');
      qb.print('   4) Nothing this time');
      const t = await ask();
      if (t === '1') return 'wood';
      if (t === '2') return 'iron';
      if (t === '3') return 'Magi';
      if (t === '4') return 'armorshop';
      return 'buyshield';
    },
    async wood() {
      if (MONEY < 50) return 'l1232';
      shield = 1;
      MONEY -= 50;
      return 'l2131';
    },
    async iron() {
      if (MONEY < 250) return 'l1232';
      shield = 2;
      MONEY -= 250;
      return 'l2131';
    },
    async Magi() {
      if (MONEY < 950) return 'l1232';
      shield = 3;
      MONEY -= 950;
      // The original fell into the "Sorry chump" line after buying the Magic Shield.
      return 'l2131';
    },
    async l1232() {
      qb.print("Sorry chump either your braindead or your just uh, uh, stupid!!!!");
      await qb.sleep(5);
      return 'buyshield';
    },
    async l2131() {
      qb.print('Thenks a bellion beby heer go yu sheld');
      await qb.sleep(5);
      return 'armorshop';
    },

    async bar() {
      if (TIME === 7) return 'woodcutter';
      if (TIME < 6 || TIME === 8) {
        qb.print('Jimmy walks into the bar. . .');
        await qb.sleep(2);
        qb.print('OUCH!!!!!!!');
        await qb.sleep();
        return 'intown';
      }
      return 'woodcutter';
    },
    async woodcutter() {
      TIME = 6;
      qb.color(3, 0, 0);
      qb.print("Hello, are you the woodcutter? I'm Jimmy");
      await qb.sleep(3);
      qb.color(5, 0, 0);
      qb.write('Yeees I am.');
      await qb.sleep(1);
      qb.print('May I help you?');
      await qb.sleep(2);
      qb.color(3, 0, 0);
      qb.print('Yes, I need you to cut up some trees that are in my way.');
      await qb.sleep(4);
      qb.color(5, 0, 0);
      qb.print('Unfortunately, I cannot come along. But I CAN give you THIS.');
      await qb.sleep(4);
      qb.color(7, 0, 0);
      qb.print('The woodcutter gives Jimmy a chainsaw.');
      chainsaw = true;
      await qb.sleep(5);
      TIME = 7;
      return 'intown';
    },
    async BOB() {
      if (TIME === 0) return 'firstime';
      if (TIME === 1 || TIME === 2) return 'NONE';
      if (TIME === 3 || TIME === 4) return 'Turnleft';
      if (TIME === 6) return 'Saw';
      // The original only handled TIME 8 here and looped back to BOB forever for the
      // rest, freezing the game (e.g. talking to someone right after Bob's woodcutter tip).
      return 'NONE';
    },
    async NONE() {
      qb.print(' No one is around');
      await qb.sleep();
      return 'intown';
    },
    async firstime() {
      qb.print('Hello Jimmy, I am BOB');
      await qb.sleep(4);
      qb.color(3, 0, 2);
      qb.print("How are you BOB.  The lizard said I'd seed youd hered.");
      await qb.sleep(4);
      qb.color(7, 0, 0);
      qb.print('Ohd reallyd? I mean really?');
      await qb.sleep(4);
      qb.color(3, 0, 2);
      qb.print('Where can I get out of here.');
      await qb.sleep(4);
      qb.color(7, 0, 0);
      qb.print('Go north and you will find your answer. Come and talk to me when you return.');
      TIME = 1;
      await qb.sleep();
      return 'intown';
    },
    // Unreachable in the original too: nothing sets TIME to 3 or 4.
    async Turnleft() {
      qb.color(3, 0, 0);
      qb.print("Well, Bob. I didn't find what I needed.");
      await qb.sleep(3);
      qb.color(7, 0, 0);
      qb.print('You must turn left at the tree.');
      TIME = 6;
      await qb.sleep();
      return 'intown';
    },
    async Saw() {
      qb.color(3, 0, 0);
      qb.print('Well, Bob, I went to the tree, and turned left, but the path was blocked by a   bunch of fallen trees.');
      await qb.sleep(4);
      qb.color(7, 0, 0);
      qb.write('Well you have to go that way. Hmmm... ');
      await qb.sleep(3);
      qb.print('I know a woodcutter. Maybe you should talk to him. You can probably find him in the bar.');
      await qb.sleep(5);
      TIME = 7;
      return 'intown';
    },
    async ExiTown() {
      qb.print('Jimmy leaves town and heads to the North.');
      await qb.sleep();
      return 'north';
    },

    // ---- North: the tree guardian, the fallen trees, the flame monster ----
    async north() {
      qb.cls();
      qb.print('Jimmy is standing in the middle of the road');
      qb.print('Press 1 to follow the road North');
      qb.print('Press 2 to go south, back into the town');
      qb.print('Press 3 to see the Item list');
      const c = await ask();
      if (c === '1') return 'TREE';
      if (c === '2') return 'GO';
      if (c === '3') await itemlist();
      return 'north';
    },
    async TREE() {
      if (TIME === 5) return 'MENU2';
      if (TIME >= 5) return 'menu3';
      // The original showed the guardian only for TIME 1-3. Heading north before
      // meeting Bob (TIME 0) dropped Jimmy into the fight with no guardian in sight.
      qb.cls();
      qb.print('Jimmy walks out into a small clearing. There is a lone tree');
      qb.print('standing in the middle of the clearing. As Jimmy is looking at the tree,');
      qb.print('out jumps the tree gaurdian.');
      qb.print('Press 1 to fight');
      qb.print('Press 2 to Run Away');
      qb.print('Press 3 to see the Item List');
      const choice = await ask();
      if (choice === '1') return 'KILLEMGOOD';
      if (choice === '2') return 'north';
      if (choice === '3') await itemlist();
      return 'TREE';
    },
    async KILLEMGOOD() {
      qb.cls();
      if (WEAPON === 3) {
        qb.print("Jimmy keeps his distance from the tree guardian. When the time is right, Jimmy    throws his spear at his enemy. It cuts open the tree guardian's side, spilling blood on the ground.");
      }
      await qb.sleep();
      return 'l1024';
    },
    async l1024() {
      qb.cls();
      qb.print('Press 1 to attack again.');
      qb.print('Press 2 to run');
      qb.print('Press 3 to see your Itemlist');
      const choice = await ask();
      if (choice === '1') return 'attackagain';
      if (choice === '2') return 'ouch';
      if (choice === '3') await itemlist();
      return 'l1024';
    },
    async attackagain() {
      if (armor === 0) return 'ouch';
      qb.write("The tree guardian pulls the spear out of his side, and throws it back at Jimmy.  Fortunately, the leather armor keeps it from doing too much damage. Jimmy picks up the spear again and charges, full speed, at the tree guardian.");
      qb.print("This time the spear cuts cleanly through the guardian's tough skin and slices through his heart, and back out on the other side.  The tree guardian falls backwards, and lies motionless.");
      await qb.sleep();
      TIME = 6;
      return 'menu3';
    },
    async ouch() {
      qb.cls();
      qb.print("The Guardian pulls the spear out of his side, and hurls it back at Jimmy. Unfortunately, Jimmy is not wearing any armor, so the spear cuts throgh him like a hot knife through butter.");
      // The original played `die$`, a variable it never set, so this death was silent.
      await qb.play(DEATH);
      await qb.sleep();
      return 'l10';
    },
    // Unreachable in the original too: nothing sets TIME to 5.
    async MENU2() {
      qb.cls();
      qb.print("Jimmy stands alone in the clearing now, the guarian lying dead at the base of the tree.");
      qb.print("Press 1 to search the guardian's body");
      qb.print('Press 2 to look at the tree');
      qb.print('Press 3 to go down the road heading left');
      qb.print('Press 4 to head south on the road, back towards town');
      qb.print('Press 5 to see a list of your items');
      const choice = await ask();
      if (choice === '1') return 'serchguard';
      if (choice === '2') await lookattree();
      if (choice === '3') return 'LEFTATTREE';
      if (choice === '4') return 'north';
      if (choice === '5') await itemlist();
      return 'MENU2';
    },
    async menu3() {
      qb.cls();
      qb.print('Jimmy stands in a small clearing.');
      qb.print('Press 1 to look at the tree');
      qb.print('Press 2 to go down the road heading west');
      qb.print('Press 3 to head south towards the town');
      qb.print('Press 4 to see your items and money.');
      const choice = await ask();
      if (choice === '1') await lookattree();
      if (choice === '2') return 'LEFTATTREE';
      if (choice === '3') return 'north';
      if (choice === '4') await itemlist();
      return 'menu3';
    },
    async serchguard() {
      if (TIME === 3) {
        // It says $55 but adds $50, as in the original.
        qb.print('Jimmy searches the guard. He finds a long piece of rope. He also finds $55');
        MONEY += 50;
        await qb.sleep(5);
        rope = true;
        TIME = 6;
        return 'MENU2';
      }
      qb.print('Jimmy finds nothing of value.');
      await qb.sleep(3);
      return 'MENU2';
    },
    async LEFTATTREE() {
      // The original let Jimmy through once Bob had sent him for the woodcutter (TIME 7),
      // "pulling out his chainsaw" before he'd been given it.
      if (TIME <= 6 || !chainsaw) {
        qb.cls();
        qb.print('Jimmy walks down the road. Soon he comes to a place where the path is blocked by a fallen tree. gET A CHAINSAW ');
        qb.print('Press 1 to go back');
        qb.print('Press 2 to see your item list');
        const choice = await ask();
        if (choice === '1') return 'TREE';
        if (choice === '2') await itemlist();
        return 'LEFTATTREE';
      }
      qb.print('Jimmy pulls out his chainsaw, and neatly slices the tree into 500 pieces');
      qb.print('Jimmy picks up the wood and shoves it in his pocket');
      woodpcs = true;
      await qb.sleep();
      // The original looped back here once more first, slicing the same tree twice.
      TIME = 8;
      return 'FORESTDUDE';
    },
    async FORESTDUDE() {
      TIME = 9;
      qb.cls();
      qb.print('Jimmy walks deep into the forest.  It is getting darker and darker but then ');
      qb.print(" suddenly a bright light appears before him.  It's a flame monster");
      qb.print('press 1) to attack');
      qb.print('press 2) TO run');
      qb.print('press 3) try to talk');
      qb.print('press 4) see your items');
      const f = await ask();
      if (f === '1' || f === '2') return 'dies';
      if (f === '3') return 'hello';
      if (f === '4') await itemlist();
      return 'FORESTDUDE';
    },
    async dies() {
      qb.print(' The fire monster burns Jimmy to a pile of ashes');
      await qb.sleep();
      return 'FINI';
    },
    async hello() {
      qb.cls();
      qb.print(' Hello says Jimmy how are you mister monster');
      await qb.sleep(5);
      qb.color(5, 0, 0);
      qb.print('I am the fire monster of the forest of Endor.  You are Jimmy are you not?');
      await qb.sleep(5);
      qb.print(' That is what I thought.  Well then follow me...........');
      await qb.sleep(5);
      qb.print('Here you are Jimmy back at the castle now go through the Caverns and get to the town');
      qb.print('of Ressest.');
      await qb.sleep(5);
      qb.color(7, 0, 0);
      qb.print('Thank You');
      await qb.sleep();
      return 'BEGIN';
    },

    // ---- The caverns under the castle, and Resset ----
    async castle() {
      qb.print('Jimmy is now at the edge of a pit.  He uses the rope to climb down.');
      TIME = 10;
      await readable();
      return 'caverns';
    },
    async caverns() {
      qb.cls();
      qb.print('The caverns are dark but Jimmy can just faintly make out the door');
      qb.print('press 1 to go through the door');
      qb.print('press 2 to go back');
      qb.print(' If you can find the secret password, type it (hint: it rymes with door');
      const door = await ask();
      if (door === '1') return 'Door';
      // Going back is a fatal fall, as in the original (TIME is no longer 9).
      if (door === '2') return 'X';
      if (door === 'FLOOR') return 'Bingo';
      // The original sent a wrong password back to the castle hall, where TIME 10 left
      // no way back down: the only way on was to die and start over.
      return 'caverns';
    },
    async Door() {
      qb.cls();
      qb.print(' Jimmy walks through the door and comes out a sewer grate to a town');
      await qb.sleep();
      TIME = 11;
      return 'town2';
    },
    async Bingo() {
      qb.print(' You found the secret password you find a revolver and magic armor and shield');
      qb.print('plus some mucho dinero');
      await qb.sleep();
      WEAPON = 4;
      armor = 3;
      shield = 3;
      MONEY += 1000;
      TIME = 11;
      return 'town2';
    },
    async town2() {
      qb.cls();
      qb.print(' Jimmy is in the town of Resset ');
      qb.print(' press 1 to talk');
      qb.print(' press 2 to find a magician');
      qb.print(' press 3 to go to the bar');
      qb.print(' press 4 to take a ferry accros the river');
      const t = await ask();
      if (t === '1') return 'girl';
      if (t === '2') return 'magic';
      if (t === '3') return 'bar2';
      if (t === '4') return 'ferry';
      return 'town2';
    },
    async girl() {
      qb.cls();
      if (TIME === 12 || charm === 1) return 'nobody';
      qb.print(' Jimmy comes across a good looking girl');
      qb.print('press 1 to talk');
      qb.print('press 2 to leave her to be');
      const g = await ask();
      if (g === '1') return 'MENU65';
      if (g === '2') return 'town2';
      return 'girl';
    },
    async nobody() {
      qb.print(' THERE IS NOBODY AROUND!!');
      // The original fell from here into talking to the girl anyway.
      await readable();
      return 'town2';
    },
    async MENU65() {
      qb.cls();
      if (charm !== 1) qb.print('Hello');
      qb.print('The girl does not respond');
      qb.print('press 1 to say your pretty');
      qb.print("press 2 to say what's your name");
      qb.print('press 3 to say a poem');
      await qb.sleep();
      return 'MENU65ask';
    },
    async MENU65ask() {
      const g = await ask();
      qb.cls();
      if (g === '1') {
        qb.print('your pretty');
        charm = 1;
        await readable();
      }
      if (g === '2') return 'Talkin';
      if (g === '3') return 'POEM';
      return 'MENU65';
    },
    async POEM() {
      qb.cls();
      qb.print('Roses are uh yellow');
      qb.print('violets are purple');
      qb.print(' Sugar is sour');
      qb.print(' and so are you');
      // The original cleared the poem before it could be read, then repeated the slap
      // forever with no way out.
      await qb.sleep(15);
      qb.print('SMACKKKKKKKKKKKKKK!!!!');
      qb.print('ouch says Jimmy');
      await qb.sleep();
      return 'MENU65';
    },
    async Talkin() {
      qb.cls();
      qb.color(4, 0, 0);
      qb.print('my name is Leia');
      qb.color(7, 0, 0);
      qb.print('My name is Jimmy');
      qb.color(4, 0, 0);
      qb.print(" That's a nice name");
      qb.print("Why Don't you come to my place");
      qb.print('(y/N)');
      return 'TalkinAsk';
    },
    async TalkinAsk() {
      const yes = await ask();
      if (yes === 'Y') return 'alright';
      if (yes === 'N') {
        // Leia's red would otherwise carry over to the town. (The original never got
        // here: with Caps Lock on, its lowercase "n" could never match.)
        qb.color(7, 0, 0);
        return 'town2';
      }
      return 'TalkinAsk';
    },
    async alright() {
      qb.cls();
      qb.color(7, 0, 0);
      qb.print(' Jimmy goes back to Leia\'s place.  Neighbors said they heard some wierd');
      qb.print(' Noises but we know what happened!');
      await qb.sleep();
      TIME = 12;
      return 'town2';
    },
    async magic() {
      if (TIME !== 12) {
        qb.print(' no magic here');
        // The original went on to teach the trick (and hand over the sword) anyway.
        await readable();
        return 'town2';
      }
      qb.print(' Jimmy comes across a wandering wizard he say he will teach you a trick');
      qb.print('for $250');
      qb.print('(Y/N)');
      return 'magicAsk';
    },
    async magicAsk() {
      const trick = await ask();
      if (trick === 'Y') return 'trick';
      if (trick === 'N') return 'town2';
      return 'magicAsk';
    },
    async trick() {
      // The original said "YOu don't have enough" and taught the trick anyway, and never
      // took the $250 (its IF block for paying was empty).
      if (MONEY < 250) {
        qb.print("YOu don't have enough");
        await readable();
        return 'town2';
      }
      MONEY -= 250;
      qb.print(' here is the trick');
      await readable();
      qb.cls();
      qb.print(' Jimmy learned how to make his oppenent go blind');
      await qb.sleep();
      TIME = 13;
      return 'bar2';
    },
    async bar2() {
      qb.cls();
      qb.print(' Jimmy enters the bar and sits down.  Soon another man sits down next to');
      qb.print(" Jimmy and says You're Jimmy right.  Well I have something you'll need to defeat BOB");
      qb.print(" Jimmy says WHAT BOB is my friend.  The man say's no he is not just take the");
      qb.print('ferry cross the mountains and take this. With that the man vanishes');
      qb.print('Jimmy has a magic sword');
      await qb.sleep();
      WEAPON = 5;
      TIME = 14;
      return 'town2';
    },
    async ferry() {
      qb.cls();
      qb.print(" the ferry man say's the toll is 200 dollars");
      qb.print(' pay it (Y\\N)');
      return 'ferryAsk';
    },
    async ferryAsk() {
      const f = await ask();
      if (f === 'Y') return 'mountains';
      if (f === 'N') return 'town2';
      return 'ferryAsk';
    },
    async mountains() {
      if (TIME !== 14) {
        qb.print(" I don't know you");
        await readable();
        return 'town2';
      }
      // The toll is "200 dollars" but costs 250, and can leave Jimmy in debt, as in the original.
      MONEY -= 250;
      qb.print(' Here you are Jimmy at the mountains');
      await qb.sleep();
      return 'm2';
    },

    // ---- The temple, and Bob ----
    async m2() {
      qb.cls();
      qb.print(' Jimmy enters the mountains and sees a temple');
      qb.print('press 1 to go forword');
      qb.print(' press 2 to camp');
      await qb.sleep();
      return 'm2ask';
    },
    async m2ask() {
      const me = await ask();
      if (me === '1') return 'herewe';
      if (me === '2') return 'camp';
      return 'm2ask';
    },
    async camp() {
      qb.cls();
      qb.print(" Jimmy makes a big mistake and camps out in the wolves den");
      qb.print(' DOTEEEEEEEEEEEEEEEEEEEEE!!!!!!!!!!');
      await qb.sleep();
      return 'FINI';
    },
    async herewe() {
      qb.cls();
      qb.print('Jimmy goes to the temple and sees BOB standing outside');
      qb.color(6, 0, 0);
      qb.print('So Jimmy you want to go home eh! well try to get past me to do it');
      qb.color(7, 0, 0);
      qb.print('ALLLLRIGGHTY- then');
      qb.print(' press 1 to lunge at BOB with your sword');
      qb.print(' press 2 to run');
      return 'hereweAsk';
    },
    async hereweAsk() {
      const bob = await ask();
      if (bob === '1') return 'fall';
      if (bob === '2') return 'uhoh';
      return 'hereweAsk';
    },
    async fall() {
      qb.cls();
      qb.print(' Jimmy lunges at BOB but BOB disapears.  Jimmy fell down');
      qb.print(' press 1 to try again');
      qb.print(' press 2 to use magic');
      return 'fallAsk';
    },
    async fallAsk() {
      const more = await ask();
      if (more === '1') return 'yes';
      if (more === '2') return 'uhoh';
      return 'fallAsk';
    },
    async uhoh() {
      qb.cls();
      qb.print(' BOB kills Jimmy with lightning bolt magic');
      await qb.sleep();
      return 'FINI';
    },
    async yes() {
      qb.cls();
      qb.print(' Jimmy lunges at BOB but this time knowing wher BOB will disapear to');
      qb.print(' He strikes BOB in his stomach');
      qb.print(' press  1 to finish him');
      qb.print(' press  2 to use magic');
      return 'yesAsk';
    },
    async yesAsk() {
      const fin = await ask();
      if (fin === '1') return 'uhoh';
      if (fin === '2') return 'deathi';
      return 'yesAsk';
    },
    async deathi() {
      qb.cls();
      qb.print(' Jimmy use his magic and......');
      qb.print(' makes BOB go blind');
      qb.print(" Jimmy takes his magic sword and plunges it into BOB's heart");
      qb.print(' YOU DID IT');
      qb.print(" Hold on there's more left");
      await qb.sleep();
      await qb.play(STAR);
      return 'ending';
    },
    async ending() {
      TIME = 15;
      // The original cleared each credit the moment it was printed, so only "LOOK FOR
      // JIMMY 2!" was ever seen. They stay up for a few seconds each here.
      qb.cls();
      qb.print(' by');
      await qb.sleep(2);
      qb.cls();
      qb.print(' NICK PULEO');
      qb.print('                 AND  DAVID PAUL');
      await qb.sleep(4);
      qb.cls();
      qb.print(' LOOK FOR JIMMY 2!');
      await qb.sleep(25);
      return 'FINI';
    },
    async FINI() {
      qb.cls();
      if (TIME === 15) qb.print(' CONGRATULATIONS');
      await qb.input();
      return 'END';
    },
  };

  let at = 'start';
  while (at !== 'END') {
    const block = B[at];
    if (!block) throw new Error(`Jimmy: no block called ${at}`);
    at = await block();
  }
}

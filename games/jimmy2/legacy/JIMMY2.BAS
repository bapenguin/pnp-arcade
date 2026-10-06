start:
DECLARE SUB magic ()
DECLARE SUB flash ()
DECLARE SUB INTRO ()
PRINT "PLAY INTRO?"
INPUT C$
IF C$ = "Y" THEN
 CALL INTRO
END IF
guESS = 0
shield = 0
armor = 0
weapon = 0
MONEY = 0
time = 0
NOMO = 0
charm = 0
leave = 0
win = 0
flag = 0
rope$ = "False"
chainsaw$ = "False"
woodpcs$ = "false"
CLS
here:
CLS
COLOR 5, 0, 0
PRINT " Jimmy is on the edge of the jungle.  What should he do."
PRINT " Press 1 to search for a weapon.  "
PRINT " Press 2 to walk deeper into the jungle"
PRINT " Press 3 to try and find someone to talk to"
INPUT jun$
IF jun$ = "1" THEN GOSUB weap
IF jun$ = "2" THEN GOSUB deeper
IF jun$ = "3" THEN GOSUB monkey

weap:
CLS
IF time = 1 THEN
PRINT " You already have a weapon"
SLEEP 5
GOTO here:
END IF
IF time = 0 THEN
COLOR 8, 0, 0
PRINT " Jimmy searches around and finds a stick.  As he looks more he finds an"
PRINT " arrow head.  Then he makes a bow and arrow."
SLEEP 10
END IF
time = 1
weapon = 3
SLEEP
GOTO here:


deeper:
COLOR 9, 0, 0
CLS
IF time = 0 THEN
PRINT " Don't you think you should get a weapon first"
END IF
SLEEP
COLOR 5, 0, 0
IF time = 1 OR time = 2 THEN
PRINT " You walk deeper into the jungle"
END IF
GOSUB deep

monkey:
IF time = 2 THEN
PRINT " No one is around"
END IF
SLEEP 4
IF time = 1 OR time = 0 THEN
COLOR 3, 0, 0
CLS
PRINT " Jimmy searches around and sees a monkey on a tree"
PRINT " The monkey seems to be attracted to Jimmy and it follows him around"
SLEEP 7
time = 2
END IF
GOTO here:

deep:
CLS
COLOR 1, 0, 0
IF time = 2 THEN GOSUB nopit
IF time <> 2 THEN
PRINT " Jimmy walks right over a hunters trap pit."
GOSUB fini:
END IF

nopit:
CLS
PRINT " Jimmy is just about to take another step when the monkey points"
PRINT " out a hunters pit. BOY that was close! "
SLEEP 10
CLS
PRINT " Press 1 to walk further in"
PRINT " press 2 to see your items"
INPUT t$
IF t$ = "1" THEN GOSUB fut
IF t$ = "2" THEN GOSUB itemlist

fut:
CLS
COLOR 2, 0, 0
PRINT " You walk further into the jungle when you see a light "
PRINT " over towards the opposite of the opposite of your right."
PRINT " Press 1 to go right"
PRINT " Press 2 to go left"
INPUT r$
IF r$ = "1" THEN GOSUB righ
IF r$ = "2" THEN GOSUB left
GOTO fut:

left:
COLOR 4, 0, 0
CLS
PRINT " That's not the opposite of the opposite or your right."
PRINT " You get lost forever."
SLEEP
GOSUB fini

righ:
CLS
PRINT " You found the hut. "
PRINT "Press 1 to knock on the door"
PRINT "Press 2 to BANG on the door"
INPUT b$
IF b$ = "1" THEN GOSUB noone
IF b$ = "2" THEN GOSUB man
GOTO righ:

noone:
PRINT " You knock on the door but know one answers"
GOTO righ:

man:
PRINT " You knock on the door and a man answers"
PRINT " I will let you come in if you guess the number I am thinking of in six"
PRINT " tries(hint: 1-100)"
SLEEP
CLS
RANDOMIZE TIMER
num = INT(100 * RND(1)) + 1
FOR x = 1 TO 6
   INPUT numb
    IF numb < num THEN PRINT "Nup, It's higher than that!"
    IF numb > num THEN PRINT "Lower, like lower than dirt "
    IF numb = num THEN GOSUB win
NEXT x
PRINT "You lose the numdber was"; num
SLEEP
GOSUB more:

win:
PRINT "WOW!! You read my mind; come in and lets chat."
win = 1
SLEEP



RIGHT:
CLS
COLOR 2, 0, 0
PRINT " Good Job.  Now I will tell you how to find the man you are looking for"
PRINT " To find him you must first turn left at the Well Of Elders and then turn "
PRINT " right at the Temple of Asterixey. The old man says I see you found "
PRINT " monkey.  Thankyou.  Here is a bit of a reward.  Jimmy gets Puleo's Pulverizer."
weapon = 4
PRINT "You leave the hut "
SLEEP
CLS
COLOR 4, 0, 0
PRINT " Should you walk forward (1)"
PRINT " Or should you turn around (2) "
INPUT now$
IF now$ = "1" THEN GOSUB more
IF now$ = "2" THEN GOTO deep


more:
CLS
IF win = 0 THEN
PRINT " You strained your brain trying to think of that number you pass out and die."
GOSUB fini
END IF
IF win = 1 THEN
END IF
COLOR 4, 0, 0
PRINT " As you walk deeper into the jungle you come across a hollow log"
PRINT " Press 1 to search the log"
PRINT " Press 2 to keep going"
INPUT log$
IF log$ = "1" THEN GOSUB login
IF log$ = "2" THEN GOSUB keep

login:
IF armor = 1 THEN
PRINT " You find nothing of value"
END IF
IF armor = 0 THEN
COLOR 6, 0, 0
CLS
PRINT " You look in the log and find Paul's Armor"
SLEEP
armor = 1
END IF
GOSUB keep

keep:
PRINT " You keep going farther into the jungle when you come across a Mombizan warrior"
PRINT " Press 1 to attack "
PRINT " Press 2 to talk"
INPUT mam$
IF mam$ = "1" THEN GOSUB attack
IF mam$ = "2" THEN GOSUB Talk

Talk:
PRINT " before Jimmy can say  a word he is killed."
SLEEP
GOSUB fini

attack:
IF armor = 0 THEN
PRINT " Before Jimmy can lift to strike he is pierced by 10 arrows."
SLEEP
END IF
IF armor = 0 THEN GOSUB fini
IF armor = 1 THEN
COLOR 3, 0, 0
PRINT " Before Jimmy can attack 10 arrows are shot at him.  Thank God he"
PRINT "was wearing Paul's armor.  Jimmy lifts up the pulvorizer and knocks the"
PRINT " warrior flat on his butt.  Jimmy takes the warriors shield and weapons."
SLEEP
shield = 1
weapon = 1
END IF
GOSUB nex
 
nex:
CLS
PRINT " You walk further into the jungle when you come across an old man."
PRINT " You follow him to a well; he takes a sip of the water."
PRINT "Press 1 to go left "
PRINT " Press 2 to go right"
PRINT " Press 3 to take a sip of water"
INPUT well$
IF well$ = "1" THEN GOSUB le
IF well$ = "2" THEN GOSUB ri
IF well$ = "3" THEN GOSUB old
GOTO nex:

le:
CLS
COLOR 4, 0, 0
PRINT " You go left a see a huge temple"
PRINT "Jimmy heeds the words of the wise old man and goes left at the well."
PRINT "Press 1 to go in th temple"
PRINT "Press 2 to go to the right"
PRINT "Press 3 to go back to the well"
INPUT tem$
IF tem$ = "1" THEN GOSUB intemple
IF tem$ = "2" THEN GOSUB rt
IF tem$ = "3" THEN GOSUB lt
GOTO le:
intemple:
rt:
lt:
SLEEP

ri:
PRINT " DIE"
SLEEP

old:
PRINT " YOU die"
SLEEP





itemlist:
   CLS
   IF weapon = 0 THEN weapname$ = "Unarmed"
   IF weapon = 1 THEN weapname$ = "Ginsu Knife"
   IF weapon = 2 THEN weapname$ = "Lulu's Lance"
   IF weapon = 3 THEN weapname$ = "Bow and arrow"
   IF weapon = 4 THEN weapname$ = "Puleo's Pulverizer"
   IF weapon = 5 THEN weapname$ = "Magic Sword"
   PRINT "Weapon:  "; weapname$
   IF armor = 0 THEN Armname$ = "None"
   IF armor = 1 THEN Armname$ = "Paul's Armor"
   IF armor = 2 THEN Armname$ = "Chain Mail"
   IF armor = 3 THEN Armname$ = "Magical"
   PRINT "Armor:  "; Armname$
   IF shield = 0 THEN shldname$ = "None"
   IF shield = 1 THEN shldname$ = "Dragon's Skin Shield"
   IF shield = 2 THEN shldname$ = "Iron"
   IF shield = 3 THEN shldname$ = "Magical"
   PRINT "Shield:  "; shldname$
   PRINT "Money:  $"; MONEY
   PRINT "Points: $"; time
   PRINT "Items:"
   IF rope$ = "TRUE" THEN PRINT "Rope"
   IF chainsaw$ = "TRUE" THEN PRINT "Chainsaw"
   IF woodpcs$ = "TRUE" THEN PRINT "500 pieces of wood"
   PRINT "Press ENTER..."
   SLEEP
   RETURN

fini:
CLS
END
RETURN

SUB flash
SCREEN 1
FOR x = 1 TO 256
COLOR x, x
PRINT
x = x + 1
NEXT x
SCREEN 0
END SUB

SUB INTRO
j$ = "J"
To$ = "2"

spooky$ = " mB o1 l2 b o2 b l4 f+g e l3 e- l8 e l2 f+ l4 e l1 o1 b p2 "
spook$ = "mB o1 l2 b o2 l4 b o3 l3 c o2 l8 b l4 a g f+ e l1 f+"
PLAY spooky$
PLAY spooky$
SCREEN 1
 FOR x = 1 TO 10
  COLOR x, 1
  LOCATE 1, 1
  PRINT "                             лллл"
  PRINT "                           ллллл   "
  PRINT "                        ллл лл л     "
  PRINT "                       л   л    л"
  PRINT "                          л л   лл   "
  PRINT "   Prepare                  л   л   л    "
  PRINT "     Yourself              л л       л   "
  PRINT "       For...            л         л л   "
  PRINT "                        л          л          "
NEXT x
  SCREEN 0
  COLOR 0, 0, 0
  CLS
  SLEEP 5
  SCREEN 1
  FOR x = 1 TO 10
  COLOR x, 3
  LOCATE 1, 1
  PRINT "             A           "
  PRINT
  PRINT "     ллллллм     ммм          ллллллм"
  PRINT "     лл    лл   л   л         лл    лл"
  PRINT "     лл    лл   л  л          лл    лл"
  PRINT "     ллллллп     пл           ллллллп"
  PRINT "     лл         мп пм   м     лл"
  PRINT "     лл        л     пмп      лл"
  PRINT "     лл       л      лпм      лл"
  PRINT "     лл        пммммп    пм   лл"
  PRINT
  PRINT "                  Game"
  NEXT x
SCREEN 0
WIDTH 80, 25
hit$ = "mb o1 l8 c"
DIM j$(1, 18)
     j$(1, 10) = "ллллллллл"
     j$(1, 11) = "    лл"
     j$(1, 12) = "    лл"
     j$(1, 13) = "лл  лл"
     j$(1, 14) = "  лл"
DIM To$(1, 18)
    To$(1, 10) = "  ллллл     "
    To$(1, 11) = "лл     лл"
    To$(1, 12) = "   мллпп    "
    To$(1, 13) = " млп       "
    To$(1, 14) = " лллллллл"
CLS
FOR z = 10 TO 14
FOR x = 1 TO 35
COLOR 5, 0, 0
     LOCATE z, x
     PRINT j$(1, z)
     xx = x - 1
     IF xx < 1 THEN GOTO piss
     LOCATE z, xx
     PRINT " "
piss:
FOR sss = 1 TO 100
NEXT sss
NEXT x
NEXT z
FOR z = 10 TO 14
FOR x = 1 TO 35

     COLOR 14, 0, 0
     y = 81 - x
     LOCATE z, y
     PRINT To$(1, z)
     yy = y + 9
     IF yy > 80 THEN GOTO crap
     LOCATE z, yy
     PRINT " "
crap:
FOR g = 10 TO 20
FOR b = 1 TO 10
LOCATE g, b
PRINT " "
NEXT b
NEXT g
NEXT x
NEXT z
PLAY spook$
SCREEN 0
COLOR 2, 0, 0
PRINT " This game was created by two very smart people"
SLEEP 6
COLOR 9, 0, 0
CLS
PRINT " Created by"
PRINT "     Nick Puleo"
PRINT "         and"
PRINT "            David Paul"
SLEEP 5
CLS
spooky$ = " mB o1 l2 b o2 b l4 f+g e l3 e- l8 e l2 f+ l4 e l1 o1 b p2 "
PLAY spooky$
PLAY spooky$
COLOR 3, 0, 0
PRINT "   It was also programed by two very smart people"
SLEEP 5
CLS
COLOR 5, 0, 8
PRINT " Programed by"
PRINT "     Nick Puleo"
PRINT "         and"
PRINT "            David Paul"
SLEEP 5
CLS
COLOR 6, 0, 0
PRINT " The Idea was also by two very smart people"
SLEEP 4
CLS
PRINT " You guessed it "
PRINT " Idea by"
PRINT "     Nick Puleo"
PRINT "         and"
PRINT "            David Paul"
SLEEP 5
CLS
COLOR 5, 0, 0
PRINT "     Hello, I am Jimmy and you will be controlling me."
PRINT "If you played the first adventure and conquered it you"
PRINT "I was at a temple when I killed BOB.  Well I went in the "
PRINT " temple and found a statue.  It was a statue of some famous"
PRINT " GOD.  The name was like FORGON or FARGAN or something"
PRINT " like that.  Any way I was told to take the statue back to"
PRINT " an guy name BASTEW or BESTAW or something like that."
PRINT "  Now I am on his planet trying to find him. I am lost  "
PRINT " somewhere in this jungle.  HELPPPPPPPPPP!!!!!!"
SLEEP
END SUB

SUB magic
    SCREEN 1
    DIM Box%(1 TO 200)
    x1% = 0: x2% = 10: y1% = 0: y2% = 10
    LINE (x1%, y1%)-(x2%, y2%), 2, BF
    GET (x1%, y1%)-(x2%, y2%), Box%
    DO
        PUT (x1%, y1%), Box%, XOR
        x1% = RND * 300
        y1% = RND * 180
        PUT (x1%, y1%), Box%
    LOOP WHILE INKEY$ = ""
    SCREEN 0

END SUB


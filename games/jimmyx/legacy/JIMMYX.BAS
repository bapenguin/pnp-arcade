DECLARE SUB help (roomnum, points)
DECLARE SUB intro ()
DECLARE SUB instruct ()
DECLARE SUB delay (endurance)
DECLARE SUB pressenter ()
DIM SHARED roomnum
DIM SHARED points
DIM SHARED star$
DIM SHARED soundon
DIM t$(25)
DIM ittoms(21)
ON ERROR GOTO errorhandler
SHELL "todir"
OPEN "jinfo.jmm" FOR INPUT AS #1
INPUT #1, soundcard
CLOSE #1
GOSUB initenemy
soundon = 0
notsaved = 0
shop = 0
DIM enemy(20, 10)
win$ = "Mb o3  l16 ccc l1e l16 ccc l1 f"
jump$ = "o1 l64 cdefgab o2cdefgab o3cdefgab o4cdefgab o5cdefg o1 l1 d"
star$ = "mB t140 o4 l2 cf o5 l1c o4 l4 b-ag o5 l3 f l1 c o4 l4 b-ag o5 l3 f l1 c l4 b-ab- l1 g"

MMenu:
   CLS
   COLOR 15
   t$(9) = "Memories.. and other stuff I remember"
   t$(10) = "By Jimmy"
   t$(12) = "Main  Menu"
   t$(13) = "1 - Watch intro and then play game"
   t$(14) = "2 - Jump direcly into game"
   t$(15) = "3 - Read instructions"
   t$(16) = "4 - Restore a saved game"
   IF notsaved = 1 THEN t$(17) = "5 - Save your current game"
   IF notsaved = 1 OR notsaved = 2 THEN t$(18) = "6 - Resume your game"
   t$(19) = "7 - Quit Memories"
   t$(20) = "8 - Options"
   GOSUB puts
   GOSUB choice
   IF choice$ = "1" THEN
      IF notsaved = 1 THEN GOSUB warning
      CALL intro
      GOSUB start
   END IF
   IF choice$ = "2" THEN
      IF notsaved = 1 THEN GOSUB warning
      GOSUB start
   END IF
   IF choice$ = "3" THEN CALL instruct
   IF choice$ = "4" THEN GOSUB loadfile
   IF choice$ = "5" AND notsaved <> 0 THEN GOSUB savefile
   IF choice$ = "6" AND notsaved <> 0 THEN
      notsaved = 1
      GOSUB chkroom
   END IF
   IF choice$ = "7" THEN
      IF notsaved = 1 THEN
         GOSUB warning
         END
      END IF
      GOSUB endgame
   END IF
   IF choice$ = "8" THEN
bobBbop:
      PRINT "Sound is currently ";
      IF soundon = 1 THEN PRINT "on. Turn it off?"
      IF soundon = 0 THEN PRINT "off. Turn it on?"
      GOSUB choice
      IF choice$ = "Y" THEN
         IF soundon = 1 THEN
         soundon = 0
         ELSE IF soundon = 0 THEN soundon = 1
         END IF
         GOTO MMenu
      END IF
      IF choice$ <> "N" THEN GOTO bobBbop
   END IF
GOTO MMenu:
warning:
         PRINT "Your previous game is not saved. Do you still want to go on?"
         INPUT choice$
         IF choice$ = "Y" OR choice$ = "y" THEN RETURN
         GOTO MMenu:

start:
  FOR hhh = 1 TO 20
    ittoms(hhh) = 0
  NEXT hhh
  ll = 0
  battle = 0
  money = 0
  weapon = 0
  armor = 0
  sheild = 0
  notsaved = 1
  roomnum = 1
  points = 0
  maxhp = 45
  maxmp = 25
  name$ = "JIMMY.JIM"
  jex = 0
  lev = 1
  jmp = maxmp
  jhp = maxhp
  jt = 15
  jw = 0
  ja = 15
  jr = 10
  js = 0
  jd = 17
  magic = 1
  nexp = 75
chkroom:
  IF roomnum = 1 THEN GOSUB field1
  IF roomnum = 2 THEN GOSUB forest1
  IF roomnum = 3 THEN GOSUB town11
  IF roomnum = 4 THEN GOSUB weaponshop1
  IF roomnum = 6 THEN GOSUB heal
  IF roomnum = 7 THEN GOSUB forest2
  IF roomnum = 8 THEN GOSUB town12
  IF roomnum = 9 THEN GOSUB guild
  IF roomnum = 10 THEN GOSUB armorshop1
  IF roomnum = 11 THEN GOSUB valley
  IF roomnum = 12 THEN GOSUB cave
  IF roomnum = 13 THEN GOSUB creek
  IF roomnum = 14 THEN GOSUB elves
  IF roomnum = 15 THEN GOSUB weaponshop2
  IF roomnum = 16 THEN GOSUB talk
  IF roomnum = 17 THEN GOSUB road
  IF roomnum = 18 THEN GOSUB rich
  IF roomnum = 19 THEN GOSUB hermit
  GOTO chkroom
rich:
  WHILE roomnum = 18
  COLOR 14
  roomnum = 1
  WEND
  RETURN
road:
WHILE roomnum = 17
CLS
COLOR 4
t$(7) = "You find the road to the rich part of the land"
t$(8) = "there is a toll booth."
t$(10) = "Pay toll of $20?[Y/N]"
GOSUB puts
IF soundon = 1 THEN
IF firsttime = 0 THEN
COLOR 0
CLS
  IF soundcard = 1 THEN SHELL "play toll.voc"
  firsttime = 1
  GOTO road
END IF
END IF
GOSUB choice
IF choice$ = "Y" THEN
money = money - 20
roomnum = 18
END IF
IF choice$ = "N" THEN roomnum = 2
WEND
firsttime = 0
RETURN
creek:
CLS
COLOR 5
WHILE roomnum = 13
CLS
IF attack = 0 THEN GOSUB enemy
attack = 0
COLOR 5
t$(9) = "You walk south and are glad to be out of the dark forest."
t$(10) = "There is a small creek and it is bright and sunny out you see a small house"
t$(11) = "Press 1 to make camp"
t$(12) = "Press 2 to go north"
t$(13) = "Press 3 to knock on the houses door"
GOSUB puts
GOSUB choice
IF choice$ = "1" THEN
jhp = maxhp
END IF
IF choice$ = "2" THEN roomnum = 7
IF choice$ = "3" THEN roomnum = 19
WEND

hermit:

elves:
WHILE roomnum = 14
COLOR 4
t$(8) = " You enter the elves town of Askburest."
t$(9) = " Press 1 to go to the weapon shop"
t$(10) = "Press 2 to talk to someone"
t$(11) = "Press 3 to go back"
GOSUB puts
GOSUB choice
IF choice$ = "1" THEN roomnum = 15
IF choice$ = "3" THEN roomnum = 7
IF choice$ = "2" THEN roomnum = 16
WEND


talk:
WHILE roomnum = 16
IF soundon = 1 AND soundcard = 1 THEN
GOSUB sodnd
ELSE GOSUB sondn
END IF
sodnd:
COLOR 0
SHELL "todir"
CLS
COLOR 0
SHELL "play hello.wav"
SHELL "play army.voc"
COLOR 4
GOSUB sondn
sondn:
CLS
PRINT "Hello, Hello"
COLOR 3
PRINT " Well I've heard rumors of a small army assembling near here"
PRINT "I have a belief it is BOB"
SLEEP 5
roomnum = 14
WEND

weaponshop2:
WHILE roomnum = 15
  t$(9) = "You walk into the weapon shop. The clerk comes up to you at once."
  t$(11) = "'How may I help you?' he asks."
  t$(12) = "1 - Buy weapon "
  t$(13) = "2 - Sell Weapon"
  t$(14) = "3 - Leave"
  GOSUB puts
  GOSUB choice
  IF choice$ = "1" THEN GOSUB buyweapon2
  IF choice$ = "2" THEN GOSUB sellweapon2
  IF choice$ = "3" THEN roomnum = 14
WEND
RETURN

buyweapon2:
shop = 1
WHILE choice$ <> "0"
  t$(4) = "Well, what'll it be?"
    GOSUB puts
    LOCATE 5, 10
    PRINT "Press 0 to exit"
    PRINT "(M for more)"
    hhh = weapon
    FOR weapon = 6 TO 11
      GOSUB getweapname
      z = weapon
      LOCATE , 10
      PRINT weapon - 5; " - "; weapname$; " ("; wp; ")"
   NEXT weapon
  weapon = hhh
  GOSUB choice
  weapon = 15
IF choice$ = "1" THEN weapon = 6
IF choice$ = "2" THEN weapon = 7
IF choice$ = "3" THEN weapon = 8
IF choice$ = "4" THEN weapon = 9
IF choice$ = "5" THEN weapon = 10
IF choice$ = "6" THEN weapon = 11
IF choice$ = "M" THEN
GOSUB buyweapon
GOTO buyweapon2
END IF
IF weapon <> 15 THEN
  GOSUB getweapname
  IF hhh <> 0 THEN
     PRINT "You have to sell your weapon first"
     CALL delay(3)
     weapon = hhh
     GOTO weaponshop2
  END IF
  IF money < wp THEN
     PRINT "You need "; wp - money; " more dollars."
     weapon = hhh
     CALL delay(3)
     GOTO buyweapon2
  END IF
  PRINT "You buy the "; weapname$; "."
  CALL delay(5)
  money = money - wp
  GOTO weaponshop2
END IF
weapon = hhh
WEND
RETURN
sellweapon2:
  GOSUB getweapname
  gets = INT(wp / 2)
  LOCATE 15, 1
  PRINT "I'll buy that "; weapname$; " from you for"; gets; "dollars."
  PRINT "Deal?[Y/N]"
  INPUT choice$
  choice$ = UCASE$(choice$)
  IF choice$ = "Y" THEN
     COLOR 0
     CLS
     SHELL "todir"
     IF soundcard = 1 THEN SHELL "play thankyou.voc"
     COLOR 3
     CLS
     PRINT "Thank you very much."
     money = money + gets
     weapon = 0
     CALL delay(3)
     GOTO weaponshop2
  END IF
  IF choice$ = "N" THEN
     PRINT "Very well."
     CALL delay(3)
     GOTO weaponshop2
  END IF
  GOTO sellweapon

cave:
   PRINT "Jimmy enters the cave..."
   CALL delay(5)
   IF attack = 0 THEN GOSUB enemy
   IF weapon < 8 THEN
       PRINT "Jimmy gets the raptor claw!!"
       weapon = 8
   END IF
   roomnum = 1
   RETURN
valley:
   WHILE roomnum = 11
   IF attack = 0 THEN GOSUB enemy
   attack = 0
   COLOR 5
   t$(8) = "Jimmy enters the Valley of death"
   t$(9) = "he sees many weird things around"
   t$(10) = "Press 1 to go south"
   t$(11) = "Press 2 to go into the cave"
   GOSUB puts
   GOSUB choice
   IF choice$ = "1" THEN roomnum = 1
   IF choice$ = "2" THEN roomnum = 12
   WEND
field1:
  WHILE roomnum = 1
  IF attack = 0 THEN GOSUB enemy
  attack = 0
  COLOR 4
  t$(9) = "Jimmy is standing in a wide, open field. He can see a forest to the east, "
  t$(10) = "and to then north he can see some smoke coming from a small village"
  t$(11) = "1 - search the fields"
  t$(12) = "2 - go East"
  t$(13) = "3 - go North"
  t$(14) = "4 - go West"
  GOSUB puts
  GOSUB choice
     IF choice$ = "1" THEN GOSUB search
     IF choice$ = "4" THEN roomnum = 2
     IF choice$ = "2" THEN roomnum = 3
     IF choice$ = "3" THEN roomnum = 11
  WEND
RETURN
search:
  RANDOMIZE TIMER
  opp = INT(RND(1) * 20) + 1
  SELECT CASE opp
    CASE IS = 7
       PRINT "You find an axe."
       IF weapon < 3 THEN weapon = 3
       CALL delay(7)
       RETURN
    CASE IS = 9 OR opp = 5
       PRINT "You find a small pond. You drink then water and feel refreshed "
       jhp = maxhp
       CALL delay(8)
       RETURN
    CASE IS = 13
       PRINT "You bump into a wizard. He waves his wand at you then dissapears."
       jmp = maxmp
       CALL delay(10)
       RETURN
    CASE IS = 4
       PRINT "You find a bag of money!!"
       money = money + 100
       CALL delay(10)
       RETURN
   END SELECT
   PRINT " You find nothing."
   CALL delay(5)
   RETURN
forest1:
  WHILE roomnum = 2
  IF attack = 0 THEN GOSUB enemy
  attack = 0
  COLOR 3
  t$(9) = "Jimmy is standing at the edge of a dark forest. He can hear the"
  t$(10) = "wind blowing through the trees in the forest. There is also a "
  t$(11) = "road heading north."
  t$(12) = "1 -  go west"
  t$(13) = "2 -  go east"
  t$(14) = "3 -  go north"
  GOSUB puts
  GOSUB choice
  IF choice$ = "2" THEN roomnum = 1
  IF choice$ = "1" THEN roomnum = 7
  IF choice$ = "3" THEN roomnum = 17
  WEND
RETURN
forest2:
  WHILE roomnum = 7
  IF attack = 0 THEN GOSUB enemy
  attack = 0
  COLOR 1
  t$(9) = "Jimmy is in a Dark part of the forrest. The trees tower over his head."
  t$(10) = "Very faintly, to the south, Jimmy hears the sound of running water."
  t$(11) = "1 - go east"
  t$(12) = "2 - go south"
  t$(13) = "3 - climb a tree"
  GOSUB puts
  GOSUB choice
  IF choice$ = "1" THEN roomnum = 2
  IF choice$ = "2" THEN roomnum = 13
  IF choice$ = "3" THEN roomnum = 14
  WEND
town11:
  WHILE roomnum = 3
  IF attack = 0 THEN GOSUB enemy
  attack = 0
  COLOR 6
  t$(9) = "Jimmy is standing in the Southwest corner of the town Regelt. There is"
  t$(10) = "a small weapons shop here, along with many small houses.  To the"
  t$(11) = "West and South Jimmy sees a large, open feild."
  t$(12) = "1 - go in the weapon shop"
  t$(13) = "2 - look for someone to talk to"
  t$(14) = "3 - go North"
  t$(15) = "4 - go South"
  t$(16) = "5 - go East "
  t$(17) = "6 - go West "
  GOSUB puts
  GOSUB choice
  IF choice$ = "1" THEN roomnum = 4
  IF choice$ = "2" THEN roomnum = 6
  IF choice$ = "3" THEN roomnum = 8
  IF choice$ = "6" THEN roomnum = 1
  WEND
  RETURN
heal:
   CLS
   IF attack = 0 THEN GOSUB enemy
   attack = 0
   COLOR 5
   LOCATE 15, 1
   PRINT "As you wander around, you bump into an old man."
   COLOR 3
   hh = lev * 15
   PRINT "I can heal you for $"; hh
   COLOR 5
   PRINT "[Y/N]"
   GOSUB choice
   IF choice$ = "Y" THEN
      COLOR 7
      IF money - hh < 0 THEN
         PRINT "Not enough cash"
         SLEEP
         roomnum = 3
         RETURN
      END IF
      PRINT "You are healed."
      jhp = maxhp
      money = money - hh
      roomnum = 3
      RETURN
   END IF
   roomnum = 3
   RETURN
town12:
WHILE roomnum = 8
  IF attack = 0 THEN GOSUB enemy
  attack = 0
   COLOR 6
   t$(9) = "Jimmy is in the Northwest corner of the town Regelt."
   t$(10) = "There are many small shops, and people are walking around"
   t$(12) = "1 - go to the armor shop "
   t$(13) = "2 - go to the magic guild"
   t$(14) = "3 - go south"
   t$(15) = "4 - go north"
   t$(16) = "5 - go east "
   t$(17) = "6 - go west "
   GOSUB puts
   GOSUB choice
   IF choice$ = "3" THEN roomnum = 3
   IF choice$ = "2" THEN roomnum = 9
   IF choice$ = "1" THEN roomnum = 10
  
   WEND
   RETURN

weaponshop1:
WHILE roomnum = 4
  t$(9) = "You walk into the weapon shop. The clerk comes up to you at once."
  t$(11) = "'How may I help you?' he asks."
  t$(12) = "1 - Buy weapon "
  t$(13) = "2 - Sell Weapon"
  t$(14) = "3 - Leave"
  GOSUB puts
  GOSUB choice
  IF choice$ = "1" THEN GOSUB buyweapon
  IF choice$ = "2" THEN GOSUB sellweapon
  IF choice$ = "3" THEN roomnum = 3
WEND
RETURN

buyweapon:
WHILE choice$ <> "0"
  t$(4) = "Well, what'll it be?"
    GOSUB puts
    LOCATE 5, 10
    PRINT "Press 0 to exit"
    hhh = weapon
    FOR weapon = 1 TO 7
      GOSUB getweapname
      z = weapon + 5
      LOCATE z, 10
      PRINT weapon; " - "; weapname$; " ("; wp; ")"
   NEXT weapon
  weapon = hhh
  GOSUB choice
  weapon = 15
IF choice$ = "1" THEN weapon = 1
IF choice$ = "2" THEN weapon = 2
IF choice$ = "3" THEN weapon = 3
IF choice$ = "4" THEN weapon = 4
IF choice$ = "5" THEN weapon = 5
IF choice$ = "6" THEN weapon = 6
IF choice$ = "7" THEN weapon = 7
IF choice$ = "0" THEN RETURN
IF weapon <> 15 THEN
  GOSUB getweapname
  IF hhh <> 0 THEN
     PRINT "You have to sell your weapon first"
     CALL delay(3)
     weapon = hhh
     RETURN
  END IF
  IF money < wp THEN
     PRINT "You need "; wp - money; " more dollars."
     weapon = hhh
     CALL delay(3)
     GOTO buyweapon
  END IF
  PRINT "You buy the "; weapname$; "."
  CALL delay(5)
  money = money - wp
  IF shop = 1 THEN GOTO buyweapon2
  RETURN
END IF
weapon = hhh
WEND
RETURN
sellweapon:
  GOSUB getweapname
  gets = INT(wp / 2)
  LOCATE 15, 1
  PRINT "I'll buy that "; weapname$; " from you for"; gets; "dollars."
  PRINT "Deal?[Y/N]"
  INPUT choice$
  choice$ = UCASE$(choice$)
  IF choice$ = "Y" THEN
     COLOR 0
     CLS
     SHELL "todir"
     IF soundcard = 1 THEN SHELL "play thankyou.voc"
     COLOR 21
     CLS
     PRINT "Thank you very much."
     money = money + gets
     weapon = 0
     CALL delay(3)
     RETURN
  END IF
  IF choice$ = "N" THEN
     PRINT "Very well."
     CALL delay(3)
     RETURN
  END IF
  RETURN

guild:
WHILE roomnum = 9
  t$(9) = "You enter the Guild."
  t$(10) = "'What may I do for you?' a wizard asks"
  t$(12) = "1 - Restore Mp"
  t$(13) = "2 - Purchase a magic item "
  t$(14) = "3 - Recieve a magic lesson"
  t$(15) = "4 - Leave     "
  GOSUB puts
  GOSUB choice
  IF choice$ = "1" THEN GOSUB restmp
  IF choice$ = "2" THEN GOSUB magicitem
  IF choice$ = "4" THEN roomnum = 8
WEND
  RETURN
restmp:
LOCATE 15, 1
  hhh = lev * 10
  PRINT "It will cost"; hhh; "dollars for my services"
  PRINT "     [Y/N]"
  INPUT choice$
  choice$ = UCASE$(choice$)
  IF choice$ = "Y" THEN
     IF money - hhh < 0 THEN
        PRINT "You don't have enough money"
        CALL delay(5)
        GOTO guild
     END IF
     PRINT "Magic points are restored."
    jmp = maxmp
     money = money - hhh
     CALL delay(5)
     RETURN
  END IF
  IF choice$ = "N" THEN
     PRINT "Then you shouldn't of said so."
     CALL delay(5)
     RETURN
  END IF
GOTO restmp
magicitem:
   PRINT "What would you like to buy?"
   PRINT
   PRINT "0 to exit"
   PRINT "1 - Poffite(restores some Hp- $10)"
   PRINT "2 - Hoffite(restores some Mp- $10)"
   PRINT "3 - Mega- Poffite(restores more Hp- $20)"
   PRINT "4 - Mega- Hoffite(restores more Mp- $20)"
   PRINT "5 - Sleep potion(your enemies can't block or attack!!- $50)"
   INPUT hhh
   IF hhh = 1 OR hhh = 2 THEN
      IF money < 10 THEN
         PRINT "not enough money!!"
         CALL delay(3)
         RETURN
       END IF
      money = money - 10
      passed$ = "yes"
   END IF
   IF hhh = 3 OR hhh = 4 THEN
      IF money < 20 THEN
         PRINT "Not enough money!!"
         CALL delay(3)
         RETURN
      END IF
      money = money - 20
     passed$ = "yes"
  END IF
  IF hhh = 5 THEN
     IF money < 50 THEN
        PRINT "Not enough Money!!"
        CALL delay(3)
        RETURN
     END IF
     money = money - 50
     passed$ = "yes"
   END IF
IF passed$ = "yes" THEN
   passed$ = "not"
er = 0
y = 1
WHILE y < 21 AND er = 0
  PRINT ittoms(y)
  IF ittoms(y) < 1 THEN
    ittoms(y) = hhh
    er = 1
  END IF
  y = y + 1
WEND
IF y >= 21 THEN
   PRINT "Not enough room"
   RETURN
   END IF

     
      
sssss:
      PRINT "You buy it!"
      CALL delay(3)
      GOTO magicitem
   END IF
IF hhh = 0 THEN RETURN
 GOTO magicitem
armorshop1:
WHILE roomnum = 10
  t$(9) = "You walk into the armor shop. The clerk comes up to you at once."
  t$(11) = "'How may I help you?' he asks."
  t$(12) = "1 - Buy armor "
  t$(13) = "2 - Sell armor"
  t$(14) = "3 - Leave"
  GOSUB puts
  GOSUB choice
  IF choice$ = "1" THEN GOSUB buyarmor
  IF choice$ = "2" THEN GOSUB sellarmor
  IF choice$ = "3" THEN roomnum = 8
WEND
RETURN
buyarmor:
WHILE choice$ <> "0"
  t$(4) = "Well, what'll it be?"
    GOSUB puts
    LOCATE 5, 10
    PRINT "Press 0 to exit"
    hhh = armor
    FOR armor = 1 TO 7
      GOSUB getweapname
      z = armor + 5
      LOCATE z, 10
      PRINT armor; " - "; armname$; " ("; ap; ")"
   NEXT armor
  armor = hhh
  GOSUB choice
  armor = 15
IF choice$ = "1" THEN armor = 1
IF choice$ = "2" THEN armor = 2
IF choice$ = "3" THEN armor = 3
IF choice$ = "4" THEN armor = 4
IF choice$ = "5" THEN armor = 5
IF choice$ = "6" THEN armor = 6
IF choice$ = "7" THEN armor = 7
IF armor <> 15 THEN
  GOSUB getweapname
  IF hhh <> 0 THEN
     PRINT "You have to sell your armor first"
     CALL delay(3)
     armor = hhh
     GOTO armorshop1
  END IF
  IF money < ap THEN
     PRINT "You need "; ap - money; " more dollars."
     armor = hhh
     CALL delay(3)
     GOTO buyarmor
  END IF
  PRINT "You buy the "; armname$; "."
  CALL delay(5)
  money = money - ap
  GOTO armorshop1
END IF
armor = hhh
WEND
RETURN
sellarmor:
  GOSUB getweapname
  gets = INT(ap / 2)
  LOCATE 15, 1
  PRINT "I'll buy that "; armname$; " from you for"; gets; "dollars."
  PRINT "Deal?[Y/N]"
  INPUT choice$
  choice$ = UCASE$(choice$)
  IF choice$ = "Y" THEN
     COLOR 0
     CLS
     SHELL "todir"
     IF soundcard = 1 THEN SHELL "play thankyou.voc"
     COLOR 2
     CLS
     PRINT "Thank you very much."
     money = money + gets
     armor = 0
     CALL delay(3)
     GOTO weaponshop1
  END IF
  IF choice$ = "N" THEN
     PRINT "Very well."
     CALL delay(3)
     GOTO weaponshop1
  END IF
  GOTO sellweapon


choice:
   LOCATE 25, 1
   PRINT "                                           "
   LOCATE 25, 1
   INPUT choice$
   LOCATE 25, 1
   PRINT "                                              "
   choice$ = UCASE$(choice$)
   IF choice$ = "HELP" THEN CALL help(roomnum, points)
   IF choice$ = "INFO" THEN GOSUB itemlist
   IF choice$ = "Q" THEN GOTO MMenu:
   IF choice$ = "USE" THEN GOSUB useitem
   RETURN
enemy:
   y = 0
getenemy:
   WHILE x <> 1
   y = y + 1
   x = enemy(roomnum, y)
   IF y = 10 THEN RETURN
   WEND
   x = 0
   IF y = 1 THEN GOSUB Rat
   IF y = 2 THEN GOSUB Dog
   IF y = 3 THEN GOSUB Theif
   IF y = 4 THEN GOSUB monkey
   IF y = 5 THEN GOSUB ninja
   IF y = 6 THEN GOSUB bird
   IF y = 7 THEN GOSUB raptor
   IF y = 8 THEN GOSUB beardlady
   IF y = 9 THEN GOSUB stone
   IF y = 10 THEN GOSUB bear
   GOTO getenemy:
bear:
  en$ = "Big black bear"
  ew$ = "powerful claw smash"
  ea = 13
  et = 6
  ew = 5
  er = 6
  es = 6
  ed = 5
  ec = 5
  ehp = 145
  ex = 200
  eg = 400
  GOSUB attack

stone:
  en$ = "Stone Giant"
  ew$ = "powerful stone smash"
  ea = 10
  et = 5
  ew = 3
  er = 4
  es = 5
  ed = 1
  ec = 5
  ehp = 250
  ex = 175
  eg = 400
  GOSUB attack
beardlady:
  en$ = "Bearded Lady"
  ew$ = "stink bombs"
  ea = 15
  et = 15
  ew = 4
  er = 1
  es = 11
  ed = 13
  ec = 7
  ehp = 40
  ex = 45
  eg = 1000
  GOSUB attack
raptor:
  en$ = "Raptor"
  ew$ = "Razor sharp talons"
  ea = 25
  et = 10
  ew = 24
  er = 6
  es = 18
  ed = 20
  ec = 8
  ehp = 55
  ex = 65
  eg = 250
  GOSUB attack
RETURN
Rat:
   en$ = "Giant Rat"
   ew$ = "Claws"
   ea = 13
   et = 7
   ew = 3
   er = 4
   es = 7
   ed = 5
   ec = 3
   ehp = 35
   ex = 15
   eg = 35
   GOSUB attack
RETURN
Dog:
   en$ = "Rabid dog"
   ew$ = "Knife-like teeth"
   ea = 20
   et = 6
   ew = 10
   er = 0
   es = 0
   ed = 8
   ec = 5
   ehp = 40
   ex = 20
   eg = 45
   GOSUB attack
RETURN
Theif:
   en$ = "Theif"
   ew$ = "Dagger"
   ea = 7
   et = 14
   ew = 2
   er = 5
   es = 3
   ed = 4
   ec = 8
   ehp = 37
   ex = 15
   eg = 75
   GOSUB attack
RETURN
monkey:
   en$ = "Crazed Orangutan"
   ew$ = "furry fists"
   ea = 4
   et = 24
   ew = 5
   er = 14
   es = 0
   ed = 6
   ec = 5
   ehp = 60
   ex = 25
   eg = 50
   GOSUB attack
ninja:
   en$ = "Evil Ninja"
   ew$ = "Samori Sword"
   ea = 15
   et = 9
   ew = 30
   er = 21
   es = 3
   ed = 13
   ec = 7
   ehp = 75
   ex = 30
   eg = 60
   GOSUB attack
RETURN
bird:
   en$ = "Giant Vulture"
   ew$ = "Huge wings"
   ea = 45
   et = 33
   ew = 4
   er = 32
   es = 33
   ed = 1
   ec = 4
   ehp = 150
   ex = 45
   eg = 100
   GOSUB attack
RETURN

attack:
   RANDOMIZE TIMER
   num = INT(RND(1) * ec) + 1
   IF num <> 1 THEN RETURN
   IF soundon = 1 THEN
   COLOR 3
   PRINT "Here comes a bad guy"
   COLOR 0
   planets = INT(RND(1) * 3) + 1
   IF planets = 1 THEN
      CLS
      COLOR 0
      SHELL "todir"
      IF soundcard = 1 THEN SHELL "play myday.voc"
      COLOR 3
   END IF
   IF planets = 2 THEN
      CLS
      COLOR 0
      SHELL "todir"
      IF soundcard = 1 THEN SHELL "play backoff.wav"
      COLOR 4
   END IF
   IF planets = 3 THEN
      CLS
      COLOR 0
      SHELL "todir"
      IF soundcard = 1 THEN SHELL "play meanswar.wav"
      COLOR 8
   END IF
END IF
   CLS
ppt:
CLS
t1 = TIMER
x = 0
KEY 15, CHR$(0) + CHR$(2)
KEY 16, CHR$(0) + CHR$(3)
KEY 17, CHR$(0) + CHR$(4)
KEY 18, CHR$(0) + CHR$(5)
KEY 19, CHR$(0) + CHR$(79)
KEY 20, CHR$(0) + CHR$(80)
KEY 21, CHR$(0) + CHR$(81)
KEY 22, CHR$(0) + CHR$(75)
ON KEY(19) GOSUB jtack
ON KEY(20) GOSUB mgic
ON KEY(21) GOSUB fle
ON KEY(22) GOSUB utem
ON KEY(15) GOSUB jtack
ON KEY(16) GOSUB mgic
ON KEY(17) GOSUB fle
ON KEY(18) GOSUB utem
KEY(0) ON
CLS
IF x = 1 GOTO ppt
x = 1
part0:
   bc = 0
   battle = 1
   COLOR 5
   t2 = TIMER
   IF t2 - t1 > 10 THEN GOSUB enemyattack
   LOCATE 1, 39
   PRINT 10 - INT(t2 - t1)
   LOCATE 2, 1
   PRINT "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
   LOCATE 4, 5
   PRINT "Jimmy's Hp - "; jhp
   LOCATE 4, 40
   PRINT en$; "'s Hp - "; ehp
   LOCATE 5, 5
   PRINT "Jimmy's Mp - "; jmp
   PRINT TAB(15); "You encounter a";
   kkk$ = LEFT$(en$, 1)
   kkk$ = UCASE$(kkk$)
   IF kkk$ = "A" OR kkk$ = "E" OR kkk$ = "I" OR kkk$ = "O" OR kkk$ = "U" THEN
      PRINT "n ";
   ELSE PRINT " ";
      END IF
   COLOR 15
   PRINT en$;
   COLOR 5
   PRINT "!!!"
    PRINT TAB(15); "1 - attack"
    PRINT TAB(15); "2 - Magic"
    PRINT TAB(15); "3 - Run"
    PRINT TAB(15); "4 - Use item"
   SELECT CASE bc
     CASE IS = 1
        GOTO jimmyattack
     CASE IS = 2
        GOTO magic
     CASE IS = 3
        GOTO flee
     CASE IS = 4
        GOSUB useitem
     END SELECT
GOTO part0:
RETURN
jtack:
 bc = 1
RETURN
mgic:
 bc = 2
RETURN
fle:
  bc = 3
RETURN
utem:
   bc = 4
RETURN
jimmyattack:
   GOSUB getweapname
   jmaxstr = (jt + jw + ja)
   jmaxdef = (jd + jr + js)
   emaxstr = (et + ew + ea)
   emaxdef = (ed + er + es)
getattstr1:
   RANDOMIZE TIMER
   attstr = INT(RND(1) * jmaxstr) + 1
     IF attstr < INT(.75 * jmaxstr) THEN GOTO getattstr1:
getblkstr1:
   RANDOMIZE TIMER
   blkstr = INT(RND(1) * emaxdef) + 1
     IF blkstr < INT(.75 * emaxdef) THEN GOTO getblkstr1:
   LOCATE 11, 1
   totdamage = attstr - blkstr
   IF totdamage < 1 THEN totdamage = 0
   PRINT "     You attack with your ";
   COLOR 15
   PRINT weapname$;
   COLOR 5
   PRINT "...";
     FOR zz = 1 TO 1000
     NEXT zz
   IF totdamage = 0 THEN
      PRINT "And miss!!!"
   ELSE PRINT "causing ";
   COLOR 15
   PRINT totdamage;
   COLOR 5
   PRINT "damage!!"
   END IF
 '  PRINT "attack strength "; attstr; ", block strength "; blkstr
   ehp = ehp - totdamage
     CALL delay(5)
   IF ehp < 1 THEN GOSUB win
enemyattack:
  IF soundon = 1 THEN PLAY "MFO0L32EFGEFDC"
  LOCATE 12, 1
   PRINT "The ";
   COLOR 4
   PRINT en$;
   COLOR 5
   PRINT " attacks you with its ";
   COLOR 4
   PRINT ew$;
   COLOR 5
   PRINT " causing";
getattstr2:
   RANDOMIZE TIMER
   attstr = INT(RND(1) * emaxstr) + 1
     IF attstr < INT(.75 * emaxstr) THEN GOTO getattstr2:
getblkstr2:
   RANDOMIZE TIMER
   blkstr = INT(RND(1) * jmaxdef) + 1
     IF blkstr < INT(.75 * jmaxdef) THEN GOTO getblkstr2:

   totdamage = attstr - blkstr
   IF totdamage < 1 THEN totdamage = 0
   COLOR 4
   PRINT totdamage;
   COLOR 5
   PRINT "damage!!"
 '  PRINT "attack strength "; attstr; ", block strength "; blkstr
   jhp = jhp - totdamage
      IF jhp < 1 THEN
         IF soundon = 1 THEN
           SHELL "todir"
           IF soundcard = 1 THEN SHELL "play ouch.voc"
         END IF
         COLOR 4
         PRINT "The ";
         COLOR 15
         PRINT en$;
         COLOR 4
         PRINT " laughes as you fall down, bleeding. What a fool you were."
         PRINT "The last thing you remember is the "; en$; " raising his "; ew$; " to deliver one final blow..."
         CALL pressenter
         battle = 0
         notsaved = 0
         KEY(0) OFF
         GOTO MMenu
      END IF
   CALL delay(10)
   GOTO ppt
magic:
   CLS
   KEY(0) OFF
   GOSUB getmagic
   INPUT v$
   IF v$ = "0" THEN GOTO part0
   IF v$ = "1" AND magic > 0 THEN
      md = 45
      mc = 5
      mn$ = "Fire"
      IF jmp - mc < 0 THEN GOSUB notenuf
      GOSUB magicattack
   END IF
   IF v$ = "2" AND magic > 2 THEN
      md = 69
      mc = 10
      mn$ = "Fireball"
      IF jmp - mc < 0 THEN GOSUB notenuf
      GOSUB magicattack
   END IF
   IF v$ = "3" AND magic > 3 THEN
      md = 80
      mc = 15
      mn$ = "Firestorm"
      IF jmp - mc < 0 THEN GOSUB notenuf
      GOSUB magicattack
   END IF
   IF v$ = "4" AND magic > 4 THEN
      md = 100
      mc = 25
      mn$ = "Windbolt"
   GOSUB magicattack
   END IF
   IF v$ = "5" AND magic > 5 THEN
      md = 175
      mc = 40
      mn$ = "Earthquake"
      GOSUB magicattack
   END IF
   GOTO magic
notenuf:
  PRINT "Sorry, you need "; mc; " Mp."
  SLEEP
  GOTO part0
magicattack:
   PRINT "Jimmy casts ";
   COLOR 15
   PRINT mn$;
   COLOR 5
   PRINT " and hits the ";
   COLOR 15
   PRINT en$;
   COLOR 5
   PRINT " for ";
getmagstr:
   magstr = INT(RND(1) * md) + 1
   IF magstr < (.85 * md) THEN GOTO getmagstr:
   jmp = jmp - mc
   emaxdef = (er + es + ed)
   blkstr = INT(RND(1) * emaxdef) + 1
   totdamage = magstr - blkstr
   IF totdamage < 0 THEN totdamage = 0
   COLOR 15
   PRINT totdamage;
   COLOR 5
   PRINT "damage!!"
'   PRINT "magic strength "; magstr; ", block strength "; blkstr
   ehp = ehp - totdamage
   IF ehp < 1 THEN GOSUB win:
   GOTO enemyattack

win:
    IF soundon = 1 THEN PLAY win$
    COLOR 4
    battle = 0
    PRINT "Jimmy defeated the "; en$; "!!"
    PRINT "       Jimmy gains "; ex; " Exp Points!!"
    PRINT "       Jimmy gains $ "; eg; "!!!"
    jex = jex + ex
    money = money + eg
    attack = 1
    IF jex >= nexp THEN
       COLOR 15
       nexp = INT(nexp * 2.3476)
       ja = INT(ja * 1.53)
       jt = INT(jt * 1.55)
       jd = INT(jd * 1.47)
       lev = lev + 1
       tmaxhp = INT(maxhp * 1.25)
       maxmp = maxmp + 20
       magic = magic + 1
       PRINT "Jimmy gains a level!!!  Currently on level "; lev
       PRINT "Max Hp goes up by"; tmaxhp - maxhp; "!!  "; "Now at";
       maxhp = tmaxhp
       PRINT tmaxhp; "!"

       PRINT "Max Mp  now at"; maxmp
       PRINT "Attack - "; ja
       PRINT "Strength - "; jt
       PRINT "Defense - "; jd
       PRINT nexp - jex; " Exp points to next level."
    END IF
    CALL pressenter
 GOTO chkroom
flee:
 battle = 0
 attack = 1
 KEY(0) OFF
 GOTO chkroom









puts:
   CLS
   FOR row = 1 TO 25
     n = (80 - LEN(t$(row))) / 2
     LOCATE row, 1
     PRINT SPACE$(n); t$(row)
   NEXT row
   FOR row = 1 TO 25
     t$(row) = "                                                                             "
   NEXT row
RETURN
loadfile:
IF nofile = 1 THEN
PRINT "No jimmy files in current directory"
GOTO cd
END IF
IF nofile = 0 THEN
       FILES "*.jim"
       INPUT "Enter the name of the file to input(no extension, C to change dir): ", name$
END IF


IF name$ = "C" THEN
cd:
   ccdd = 1
   FILES "*.   "
   INPUT "change Dir to..."; name$
   nofile = 0
   IF name$ = "" THEN GOTO MMenu
   CHDIR name$
   GOTO loadfile
END IF
IF nofiles = 1 THEN GOTO loadfile
IF LEN(name$) < 8 THEN
    mm = LEN(name$)
    FOR x = 1 TO (8 - mm) - 1
      choice$ = choice$ + " "
    PRINT name$; "|"
    NEXT x
END IF
name$ = name$ + ".JIM"
       ccdd = 0
       OPEN name$ FOR INPUT AS #1
          INPUT #1, roomnum, points, jt, ja, jd, jhp, maxhp, jmp, maxmp, money, lev, nexp, magic, weapon, jex, armor, sheild
          FOR hhh = 1 TO 20
          INPUT #1, ittoms(hhh)
          NEXT hhh
          PRINT "File "; name$; " has been loaded"
          PRINT "Press ENTER..."
          CALL pressenter
          CLOSE #1
       notsaved = 1
       GOTO chkroom

savefile:
      PRINT "Save as "; name$;
      INPUT x$
      IF x$ = "Y" OR x$ = "y" THEN GOSUB saveit
      IF x$ = "" THEN GOTO MMenu
      IF x$ = "N" OR x$ = "n" THEN
         INPUT "Enter the new name of file to save as(don't include extension): ", name$
         GOSUB saveit
      END IF
      GOTO savefile:
saveit:
IF RIGHT$(name$, 4) <> ".JIM" THEN
IF LEN(choice$) < 8 THEN
    mm = LEN(name$)
    FOR x = 1 TO (8 - mm) - 1
      name$ = name$ + " "
    PRINT name$; "|"
    NEXT x
END IF
name$ = name$ + ".JIM"
END IF

      OPEN name$ FOR OUTPUT AS #1
      WRITE #1, roomnum, points, jt, ja, jd, jhp, maxhp, jmp, maxmp, money, lev, nexp, magic, weapon, jex, armor, sheild
      FOR hhh = 1 TO 20
        WRITE #1, ittoms(hhh)
      NEXT hhh
          CLOSE #1
     notsaved = 2
     GOTO MMenu:

itemlist:
   CLS
   GOSUB getweapname
   PRINT "Weapon:  "; weapname$; " (strength: "; jw; ")"
   PRINT "Armor:  "; armname$
   PRINT "Shield:  "; shldname$
   PRINT "Money:  $"; money
   PRINT "Hit Points: "; jhp; "/"; maxhp
   PRINT "Magic points: "; jmp; "/"; maxmp
   PRINT "level: "; lev
   PRINT "Exp points: "; jex
   PRINT "     to next level: "; nexp - jex; "(to "; nexp; ")"
   PRINT
   PRINT "Attack: "; ja
   PRINT "Strength: "; jt
   PRINT "Defense: "; jd
   PRINT
   PRINT
   LOCATE 1, 40
    PRINT "Items:"
   FOR inum = 1 TO 20
     GOSUB getitom
     j = inum + 1
     LOCATE j, 40
     PRINT iname$
   NEXT inum
   PRINT "Press ENTER..."
   CALL pressenter
   RETURN

endgame:
   COLOR 20, 0, 0
   LOCATE 25, 1
   PRINT "                    "
   LOCATE 20, 10
   PRINT "REALLY Quit your game?"
   INPUT really$
   IF LEFT$(really$, 1) = "Y" OR really$ = "y" THEN
      COLOR 7, 0
      END
   END IF
   RETURN
errorhandler:
IF ERR = 53 THEN
   PRINT "File not found"
   nofile = 1
   RESUME loadfile
END IF
IF ERR = 61 THEN
   PRINT " Disk full"
   RESUME MMenu
END IF
IF ERR = 62 THEN
   PRINT "Cannot open - "; name$; "has been edited"
   CALL pressenter
RESUME MMenu
END IF
IF ERR = 52 OR ERR = 64 THEN
   IF name$ = "" THEN
      CLOSE #1
      RESUME MMenu
   END IF
   PRINT "Bad File Name or Number"
   RESUME savefile
END IF
IF ERR = 76 THEN
   IF name$ = "" THEN
     RESUME loadfile
   END IF
   PRINT "Path not found"
   RESUME cd
END IF
CLS
   SCREEN 13
   COLOR 40
   PRINT "ERROR!!! looks like you pulled a Jimmy!!"
   PRINT "error"; ERR; "on line"; ERL; "(Press Enter)"
LINE (110, 70)-(190, 120), 0, BF
 LINE (0, 0)-(320, 200), 3, , &HFF00
 LINE (320, 0)-(0, 200), 3, , &HFF00
 WHILE INKEY$ = ""
FOR a = 16 TO 30
 COLOR a
 FOR zz = 1 TO 100
 NEXT zz
LINE (110, 70)-(190, 120), , BF
CIRCLE (150, 95), 10, 40
 PAINT (150, 95), 40, 40
 NEXT a
COLOR 15
    LINE (110, 70)-(190, 120), , BF
    CIRCLE (150, 95), 10, 40
    PAINT (150, 95), 40, 40
BEEP
FOR d = 1 TO 100
NEXT d
FOR b = 0 TO 13
c = 30 - b
COLOR c
FOR zz = 1 TO 100
NEXT zz
    LINE (110, 70)-(190, 120), , BF
CIRCLE (150, 95), 10, 40
 PAINT (150, 95), 40, 40
NEXT b
WEND
COLOR 15
WIDTH 80, 25
SCREEN 0
overwrite:
   IF ERR = 58 THEN
      PRINT "File already exists. Overwrite?"
      INPUT x$
      IF x$ = "Y" OR x$ = "y" THEN
         KILL name$
         GOTO saveit:
      ELSE IF x$ = "N" OR x$ = "n" THEN GOTO savefile:
      ELSE GOTO overwrite:
      END IF
   END IF
   CLOSE #1
   RESUME MMenu
initenemy:
   enemy(1, 8) = 1
   enemy(1, 1) = 1
   enemy(1, 2) = 1
   enemy(1, 4) = 1
   enemy(2, 1) = 1
   enemy(2, 2) = 1
   enemy(2, 4) = 1
   enemy(3, 3) = 1
   enemy(3, 5) = 1
   enemy(7, 6) = 1
   enemy(7, 1) = 1
   enemy(7, 2) = 1
   enemy(7, 3) = 1
   enemy(7, 7) = 1
   enemy(7, 6) = 1
   enemy(8, 1) = 1
   enemy(8, 2) = 1
   enemy(8, 1) = 1
   enemy(8, 2) = 1
   enemy(8, 3) = 1
   enemy(8, 5) = 1
   enemy(11, 8) = 1
   enemy(11, 9) = 1
   enemy(11, 7) = 1
   enemy(12, 8) = 1
   enemy(12, 8) = 1
   enemy(12, 9) = 1
   enemy(13, 10) = 1
   enemy(13, 10) = 1
   enemy(14, 1) = 1
   RETURN
getitom:
     IF ittoms(inum) = 0 THEN iname$ = " "
     IF ittoms(inum) = 1 THEN iname$ = "poffite"
     IF ittoms(inum) = 2 THEN iname$ = "hoffite"
     IF ittoms(inum) = 3 THEN iname$ = "mega poffite"
     IF ittoms(inum) = 4 THEN iname$ = "mega hoffite"
     IF ittoms(inum) = 5 THEN iname$ = "sleep potion"
   RETURN
getweapname:
   IF weapon = 0 THEN
      weapname$ = "fists"
      jw = 5
      wp = 0
   END IF
   IF weapon = 1 THEN
      weapname$ = "Stick"
      jw = 7
      wp = 75
   END IF
   IF weapon = 2 THEN
      weapname$ = "Dagger"
      jw = 15
      wp = 150
   END IF
   IF weapon = 3 THEN
      weapname$ = "Axe"
      jw = 20
      wp = 200
   END IF
   IF weapon = 4 THEN
      weapname$ = "Short sword"
      jw = 27
      wp = 400
   END IF
   IF weapon = 5 THEN
      weapname$ = "Crossbow"
      jw = 30
      wp = 750
   END IF
   IF weapon = 6 THEN
      weapname$ = "Long sword"
      jw = 50
      wp = 10000
   END IF
   IF weapon = 7 THEN
      weapname$ = "Halberd"
      jw = 70
      wp = 15000
   END IF
   IF weapon = 8 THEN
      weapname$ = "Raptor claw"
      jw = 100
      wp = 25000
   END IF

   IF weapon = 9 THEN
      weapname$ = "Dragons Sword"
      jw = 135
      wp = 27500
   END IF
   IF weapon = 10 THEN
      weapname$ = "Cannon"
      jw = 157
      wp = 30000
   END IF
   IF weapon = 11 THEN
       weapname$ = "Trusted army"
       jw = 250
       wp = 50000
   END IF
  
 IF armor = 0 THEN
      armname$ = "None"
      jr = 1
      ap = 0
   END IF
   IF armor = 1 THEN
      armname$ = "Leather Clothes"
      jr = 5
      ap = 60
   END IF
   IF armor = 2 THEN
      armname$ = "Leather Armor"
      jr = 10
      ap = 125
   END IF
   IF armor = 3 THEN
      armname$ = "Chain Mail"
      jr = 24
      sp = 350
   END IF
   IF armor = 4 THEN
      armname$ = "Iron Armor"
      jr = 30
      ap = 500
   END IF
   IF shield = 0 THEN shldname$ = "None"
   IF shield = 1 THEN shldname$ = "Dragon's Skin Shield"
   IF shield = 2 THEN shldname$ = "Cast Iron Sheild"
   IF shield = 3 THEN shldname$ = "Magical"

RETURN
getmagic:
   SELECT CASE magic
      CASE IS = 0
         PRINT "You don't know any magic!!"
         RETURN
      CASE IS = 1 OR 2
         GOSUB fire
         RETURN
      CASE IS = 3
         GOSUB fire
         GOSUB fireball
         RETURN
      CASE IS = 4
         GOSUB fire
         GOSUB fireball
         GOSUB firestorm
      CASE IS = 5
         GOSUB fire
         GOSUB fireball
         GOSUB firestorm
         GOSUB windbolt
         CASE IS = 6
      GOSUB fire
      GOSUB fireball
      GOSUB firestorm
      GOSUB windbolt
      GOSUB earthquake
      END SELECT
fire:
   PRINT
   PRINT "1 - Fire"
   RETURN
fireball:
   PRINT "2 - FireBall"
   RETURN
firestorm:
   PRINT "3 - Firestorm"
   RETURN
windbolt:
   PRINT "4 - Wind Bolt"
   RETURN
earthquake:
   PRINT " 5- Earthquake"
   RETURN
useitem:
   PRINT "Use what number?"
   PRINT "0 to exit"
   FOR inum = 1 TO 20
     GOSUB getitom
     PRINT inum; "-"; iname$
   NEXT inum
   INPUT inum
   IF inum > 0 AND inum < 21 THEN
       GOSUB getitom
        IF iname$ = " " THEN
           PRINT "You don't have that!"
           CALL delay(3)
           GOTO useitem
        END IF
        IF iname$ = "poffite" THEN GOSUB poffite
        IF iname$ = "hoffite" THEN GOSUB hoffite
        IF iname$ = "sleep potion" THEN GOSUB slpotion
    RETURN
    END IF
    IF inum = 0 THEN RETURN
GOTO useitem
RETURN
poffite:
 ittoms(inum) = 0
 PRINT "Jimmy uses poffite"
 CALL delay(1.5)
 PRINT "Jimmy feels better!"
 IF maxhp - jhp <= 10 THEN
 jhp = maxhp
 ELSE jhp = jhp + 10
 END IF
 CALL pressenter

 RETURN
hoffite:
  ittoms(inum) = 0
  PRINT "Jimmy uses hoffite"
  CALL delay(1.5)
  PRINT "Jimmy feels restored"
  IF maxmp - jmp <= 10 THEN
  jmp = maxmp
  ELSE jmp = jmp + 10
  END IF
  CALL pressenter
  RETURN

slpotion:
  IF battle = 0 THEN
     PRINT "Can only be used in battle"
     CALL pressenter
     RETURN
  END IF
  PRINT "Jimmy uses the sleep potion..."
  CALL delay(2)
  PRINT "The "; en$; " falls asleep!!"
  CALL delay(4)
  PRINT "Jimmy attacks for ";
  COLOR 15
  GOSUB getweapname
  jattack = jw + jt + ja
WHILE hitfor < .75 * jattack
  hitfor = INT(RND(1) * jattack) + 1
WEND
  PRINT hitfor;
  COLOR 5
  PRINT "damage!!"
  ehp = ehp - hitfor
  IF ehp < 1 THEN GOTO win
RETURN

SUB delay (x)
   y = INT(x * 1000)
   FOR zz = 1 TO y
   NEXT zz
END SUB

SUB help (roomnum, points)
IF points < 1 THEN
   PRINT "Sorry, You're on your own."
   GOTO EndHelp
END IF
points = points - 1
x = roomnum
EndHelp:
END SUB

SUB instruct
SHELL "todir.bat"
OPEN "jimmy.ins" FOR INPUT AS #1
WHILE NOT EOF(1)
 LINE INPUT #1, instr$
 WHILE RIGHT$(instr$, 1) = " "
 instr$ = LEFT$(instr$, LEN(instr$) - 1)
 WEND
 IF LEFT$(instr$, 1) = ";" THEN GOSUB getmore
 first$ = LEFT$(instr$, 2)
 SELECT CASE first$
     CASE IS = "1 "
       COLOR 1
       GOSUB fist
     CASE IS = "2 "
       COLOR 2
       GOSUB fist
     CASE IS = "3 "
       COLOR 3
       GOSUB fist
    CASE IS = "4 "
       COLOR 4
       GOSUB fist
    CASE IS = "5 "
       COLOR 5
       GOSUB fist
    CASE IS = "6 "
       COLOR 6
       GOSUB fist
    CASE IS = "7 "
       COLOR 7
       GOSUB fist
    CASE IS = "8 "
       COLOR 8
       GOSUB fist
    CASE IS = "9 "
       COLOR 9
       GOSUB fist
    CASE IS = "10"
       COLOR 10
       GOSUB fist
    CASE IS = "11"
       COLOR 11
       GOSUB fist
    CASE IS = "12"
       COLOR 12
       GOSUB fist
    CASE IS = "13"
       COLOR 13
       GOSUB fist
    CASE IS = "14"
       COLOR 14
       GOSUB fist
    CASE IS = "15"
       COLOR 15
       GOSUB fist
    CASE IS = "CL"
       CLS
       GOSUB fist
    CASE IS = "WT"
       CALL pressenter
    CASE IS = "CR"
        PRINT
    CASE IS = "  "
       GOSUB fist

 END SELECT
 WEND
CLOSE #1
SLEEP
GOTO endinst
getmore:
   more$ = LEFT$(instr$, 3)
   more$ = RIGHT$(more$, 2)
   SELECT CASE more$
     CASE IS = "1 "
       COLOR 1
       GOSUB fist2
     CASE IS = "2 "
       COLOR 2
       GOSUB fist2
     CASE IS = "3 "
       COLOR 3
       GOSUB fist2
    CASE IS = "4 "
       COLOR 4
       GOSUB fist2
    CASE IS = "5 "
       COLOR 5
       GOSUB fist2
    CASE IS = "6 "
       COLOR 6
       GOSUB fist2
    CASE IS = "7 "
       COLOR 7
       GOSUB fist2
    CASE IS = "8 "
       COLOR 8
       GOSUB fist2
    CASE IS = "9 "
       COLOR 9
       GOSUB fist2
    CASE IS = "10"
       COLOR 10
       GOSUB fist2
    CASE IS = "11"
       COLOR 11
       GOSUB fist2
    CASE IS = "12"
       COLOR 12
       GOSUB fist2
    CASE IS = "13"
       COLOR 13
       GOSUB fist2
    CASE IS = "14"
       COLOR 14
       GOSUB fist2
    CASE IS = "15"
       COLOR 15
       GOSUB fist2
   
    END SELECT
   RETURN
fist:
   PRINT RIGHT$(instr$, LEN(instr$) - 2)
RETURN
fist2:
   PRINT RIGHT$(instr$, LEN(instr$) - 3);
   RETURN
endinst:
END SUB

SUB intro
DIM t$(5)
DIM a$(5)
IF soundon = 1 THEN
SCREEN 13
x$ = "P&P Presents.."
xx = 13
yy = 13
GOSUB fadein
GOSUB fadeout
END IF
x$ = "A Game by David Paul and Nick Puleo"
xx = 13
yy = 2
GOSUB fadein
GOSUB fadeout
x$ = "Yet another Jimmy Game"
xx = 13
yy = 9
GOSUB fadein
GOSUB fadeout
x$ = "The first one's second sequal"
xx = 13
yy = 5
GOSUB fadein
GOSUB fadeout
x$ = "(The third one)"
xx = 13
yy = 14
GOSUB fadein
GOSUB fadeout
t$(1) = "лллллллл л л      л л      л лл      лл"
t$(2) = "   лл    л ллл  ллл ллл  ллл   лл  лл  "
t$(3) = "   лл    л л  лл  л л  лл  л     лл    "
t$(4) = "лл лл    л л      л л      л     лл    "
t$(5) = " ллл     л л      л л      л     лл    "
a$(1) = "             ллм    млл             "
a$(2) = "              пллммллп               "
a$(3) = "                оллн               "
a$(4) = "              мллппллм           "
a$(5) = "             ллп    плл              "
FOR b = 1 TO 5
x$ = t$(b)
xx = 9 + b
yy = 1
GOSUB fadein
NEXT b
COLOR 40
FOR b = 1 TO 7
  LOCATE 24 - b, 1
    IF b = 1 THEN PRINT a$(1)
    IF b = 2 THEN PRINT a$(1), a$(2)
    IF b = 3 THEN PRINT a$(1), a$(2), a$(3)
    IF b = 4 THEN PRINT a$(1), a$(2), a$(3), a$(4)
    IF b > 4 THEN
       FOR c = 1 TO 5
       PRINT a$(c)
       NEXT c
    FOR x = 1 TO b - 5
    PRINT "                                                     "
    NEXT x
    END IF
   CALL delay(.25)
NEXT b
COLOR 33
FOR b = 1 TO 25
FOR c = 1 TO 40
IF c = 1 AND b <> 1 THEN
    LOCATE b - 1, 40
    PRINT " "
    LOCATE b, 1
    PRINT ""
END IF
IF c <> 1 THEN
LOCATE b, c - 1
PRINT " "; CHR$(2)
END IF
CALL delay(.05)
NEXT c
NEXT b
COLOR 40

FOR z = 1 TO 4
FOR x = 1 TO 50
FOR c = 16 TO 30
COLOR c
IF z = 4 THEN
LINE (0, 0)-(100, x + c)
COLOR 46 - c
LINE (0, 0)-(100, x + 2 * c)
END IF
IF z = 3 THEN
LINE (200, 0)-(100, x + c)
COLOR 46 - c
LINE (200, 0)-(100, x + 2 * c)
END IF
IF z = 2 THEN
LINE (0, 200)-(100, 175 - (x + c))
COLOR 46 - c
LINE (0, 200)-(100, 175 - (x + 2 * c))
END IF
IF z = 1 THEN
LINE (200, 200)-(100, 175 - (x + c))
COLOR 46 - c
LINE (200, 200)-(100, 175 - (x + 2 * c))
END IF
NEXT c

NEXT x
NEXT z
COLOR 7
LOCATE 10, 11
PRINT "     "
LOCATE 10, 11
PRINT "JIMMY"
WHILE INKEY$ = ""
COLOR 30
LOCATE 10, 11
PRINT "     "
LOCATE 10, 11
PRINT "JIMMY"
WEND
j$ = "J"
PAINT (1, 1), 0, 30

CALL delay(5)

GOTO endintro:






fadein:
FOR a = 16 TO 30
 COLOR a
 FOR zz = 1 TO 500
 NEXT zz
 LOCATE xx, yy
 PRINT x$
 NEXT a
COLOR 15
LOCATE xx, yy
PRINT x$
FOR d = 1 TO 10000
NEXT d
RETURN
fadeout:
FOR b = 0 TO 13
c = 30 - b
COLOR c
FOR zz = 1 TO 500
NEXT zz
LOCATE xx, yy
PRINT x$
NEXT b
CLS
RETURN

endintro:
SCREEN 0
WIDTH 80, 25
END SUB

SUB pressenter
WHILE INKEY$ = ""
WEND
END SUB


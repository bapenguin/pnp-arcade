sblaster:
CLS
PRINT "Do you have a soundblaster or compatible card?"
INPUT choice$
IF choice$ = "Y" THEN
   soundcard = 1
   GOTO ext
END IF
IF choice$ = "N" THEN
   soundcard = 0
   GOTO ext
END IF
GOTO sblaster
ext:
PRINT "What drive is JIMMY on?"
 choice$ = INPUT$(1)
 drivelet$ = choice$ + ":"
PRINT drivelet$
PRINT "in what dir? (like this: games\jimmy ; not like C:\games\jimmy"
INPUT choice$
 dirname$ = "cd\ " + choice$
 PRINT dirname$
 PRINT "THANK YOU"
SHELL drivelet$
SHELL dirname$
OPEN "jinfo.jim" FOR OUTPUT AS #1
 WRITE #1, soundcard
CLOSE #1
OPEN "todir.bat" FOR OUTPUT AS #1
 PRINT #1, "Echo off"
 PRINT #1, drivelet$
 PRINT #1, dirname$
CLOSE #1
SHELL "type jinfo.jim"
SHELL "type todir.bat"
END


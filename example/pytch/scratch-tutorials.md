# Overview

The examples in this directory (will) mirror those provided by the
Scratch team in the 'getting started' group of tutorials at

https://scratch.mit.edu/projects/editor/?tutorial=getStarted


# Tutorials

The following are the tutorials in the 'getting started' group:


## Getting started

    when green flag clicked:
        move 10 steps
        say "Hello!" for 2 seconds

Suggests:

 * Add a backdrop
 * Add a sprite

next.


## Animate a name

On first letter sprite:

    when this sprite clicked:
        play sound "meow" until done

On another letter:

    when this sprite clicked:
        change "color" effect by 25

On another letter:

    when this sprite clicked:
        repeat 10:
            turn clockwise 15 degrees
            wait 1 second

On another letter:

    when this sprite clicked:
        repeat 15:
            change size by 10
        repeat 15:
            change size by -10

Suggests:

 * Add a backdrop
 * Glide around

next.


## Imagine if

On cat:

    when green flag clicked:
        say "Hello!" for 2 seconds
        say "Imagine if..." for 2 seconds

With chosen backdrop and new sprite:

    when "space" key is pressed:
        start sound "pop"
        glide 1 secs to "random position"

On another chosen sprite:

    when "right arrow" key pressed:
        change x by 10

    when "left arrow" key pressed:
        change x by -10

    when "up arrow" key pressed:
        change y by 10

    when "down arrow" key pressed:
        change y by -10

    when this sprite clicked:
        switch costume to "rooster-b"
        wait 0.3 seconds
        switch costume to "rooster-a"
        wait 0.3 seconds

    when green flag clicked:
        go to x 0 y 0
        glide 1 secs to x 120 y -40

    when this sprite clicked:
        repeat 2:
            set size to 125%
            play sound "Hi Na Tabla" until done
            set size to 100%

After choosing another backdrop:

    when green flag clicked:
        switch backdrop to "Savanna"
        wait 2 seconds
        switch backdrop to "Metro"
        say "Let's explore!" for 2 seconds

Record a sound and choose it in floating

    play sound "pop" until done

block.

Suggests

 * Hide and show
 * Make a chase game

next.


## Make music

With an 'instrument' sprite [guess these come with music-note sounds?]:

    when this sprite clicked:
        start sound "C sax"

Create a song:

    when this sprite clicked:
        start sound "C2 sax"
        wait 0.25 seconds
        start sound "G sax"
        wait 0.25 seconds
        start sound "C sax"

Choose a drum:

    when "space" key pressed:
        repeat 3:
            start sound "drum bass2"
            wait 0.2 seconds
            start sound "high tom"
            wait 0.1 seconds

With microphone sprite:

    when "up arrow" key pressed:
        start sound (pick random 1 to 8)
        next costume

Suggests

 * Add a backdrop
 * Add a sprite

next.


## Create a story

Add backdrop and character; on character:

    when green flag clicked:
        say "Welcome to Magic School!" for 2 seconds

Add another character and flip its costume's horizontal direction.
Then on this second character:

    when green flag clicked:
        wait 2 seconds
        say "I'm going on a quest!" for 2 seconds

Choose another backdrop

    when green flag clicked:
        switch backdrop to "Witch House"
        wait 4 seconds
        switch backdrop to "Mountain"

On wizard character:

    when backdrop switches to "Mountain":
        hide

Update wizard to show:

    when green flag clicked:
        show
        say "Welcome to Magic School!" for 2 seconds

Suggests

 * Create animations that talk
 * Record a sound

next.


## Make a chase game

Add backdrop, sprite; give that sprite:

    when "right arrow" key pressed:
        change x by 10

    when "left arrow" key pressed:
        change x by -10

and

    when "up arrow" key pressed:
        change y by 10

    when "down arrow" key pressed:
        change y by -10

Add another sprite; give it

    when green flag clicked:
        forever:
            glide 1 secs to "random position"

In first sprite:

    when green flag clicked:
        forever:
            if touching "Star" then:
                play sound "Wand" until done

Create a "score" variable, and update previous script:

    when green flag clicked:
        forever:
            if touching "Star" then:
                change "score" by 1
                play sound "Wand" until done

Suggests

 * Add effects
 * Use arrow keys

next.


## Animate a character

Add a backdrop and sprite; give sprite

    when green flag clicked:
        say "Hello!" for 2 seconds

Add sound:

    when green flag clicked:
        start sound "Chirp"

Animate talking:

    when green flag clicked:
        start sound "Chirp"
        switch costume to "penguin2-b"
        wait 0.5 seconds
        switch costume to "penguin2-a"

With separate sprite and backdrop, move using arrow keys:

    when "right arrow" key pressed:
        change x by 10

    when "left arrow" key pressed:
        change x by -10

On yet another sprite, jump:

    when "space" key pressed:
        repeat 6:
            change y by 10
        repeat 6:
            change y by -10

On a fish:

    when this sprite clicked:
        change "color" effect by 25

    when green flag clicked:
        clear graphic effects

Suggests

 * Make a chase game
 * Create a story

next.


## Make a clicker game

Pick a sprite; play sound:

    when this sprite clicked:
        start sound "pop"

Create score variable; when clicked increase score (update previous
script):

    when this sprite clicked:
        start sound "pop"
        change score by 1

Random position (new script):

    when green flag clicked:
        forever:
            go to "random position"
            wait 1 seconds

Change color (update previous script):

    when green flag clicked:
        forever:
            change "color" effect by 25
            go to "random position"
            wait 1 seconds

Reset score:

    when green flag clicked:
        set "score" to 0

Suggests:

 * Add a backdrop
 * Use arrow keys

next.


## Make it fly

Choose sky backdrop and a character:

    when green flag clicked:
        say "Time to fly!" for 2 seconds

Move with arrow keys:

    when "up arrow" key pressed:
        change y by 10

    when "down arrow" key pressed:
        change y by -10

Choose object to collect; make it move:

    when green flag clicked:
        forever:
            go to "random position"
            change x by 250
            repeat 32:
                change x by -15

Add 'score' variable; keep score:

    when green flag clicked:
        set "score" to 0
        forever:
            if touching "Heart" then:
                change "score" by 1
                wait 1 seconds

Add 'clouds' scenery; give it:

    when green flag clicked:
        forever:
            set x to 250
            next costume  # Added in next step
            repeat 100:
                change x by -5

Suggests:

 * Change size
 * Make it spin

next.


## Pong game

Add backdrop and ball; give ball

    when green flag clicked:
        point in direction 45
        forever:
            move 15 steps  # '15' is indistinct
            if on edge, bounce

Add paddle sprite; give it

    when green flag clicked:
        forever:
            set x to (mouse x)

In ball:

    when green flag clicked:
        forever:
            if touching "Paddle" then:
                change "score" by 1  # Added in next step, after adding var 'score'
                turn clockwise 180 degrees  # Pytch just 'turn' and use -ve args for anti-c/w?
                move 15 steps
                wait 0.5 seconds

Add 'score' variable; see prev script.  Add

    when green flag clicked:
        set "score" to 0

Add a 'line' sprite at bottom of screen.  Give it

    when green flag clicked:
        forever:
            if touching "Ball" then:
                stop "all"

Suggests:

 * Add effects
 * Video sensing

next.


## Create animations that talk

Enable extension "Text to speech".

    when this sprite clicked:
        set voice to "squeak"
        speak "Let's go!"
        glide 1 secs to "random position"

Add a backdrop and a robot sprite:

    when this sprite clicked:
        start sound "Hip Hop"
        speak "I am a robot"
        speak "I like to dance"
        speak "Beep boop bop"

On another character:

    when this sprite clicked:
        set voice to "squeak"
        change "color" effect by 25
        speak "Whoah! Look at me!"

On another one:

    when green flag clicked:
        forever:
            turn clockwise 15 degrees

    when this sprite clicked:
        speak "I'm so dizzy"

On another character:

    when this sprite clicked:
        set voice to "squeak"
        change size by 100
        speak "Flying is fun!"
        change size by -100

Suggests:

 * Animate a name
 * Make music

next.


## Video sensing

Add extension "video sensing".  Give cat:

    when video motion > 20:
        play sound "Meow" until done

On dragon:

    when video motion > 20:
        switch costume to "dragon-c"
        wait 0.5 seconds
        switch costume to "dragon-a"

On a balloon:

    when video motion > 20:
        play sound "pop" until done
        go to "random position"
        change "color" effect by 25

Suggests:

 * Make music
 * Add effects

next.


## Animate an adventure game

Takes you to specific project, pre-populated with some cartoon
characters.  Choose and show on; give it:

    when green flag clicked:
        say "Let's collect gems!" for 1 seconds
        forever:
            glide 0.3 seconds to "mouse pointer"

Choose a target object to collect; give it:

    when green flag clicked:
        set "score" to 0  # Added next
        forever:
            wait until touching "Garnet"  # Chosen character
            start sound "collect"
            go to "random position"
            change "score" by 1  # Added next

Make 'score' variable; keep score (marked additions above).

Next level:

    when green flag clicked:
        wait until (score == 10)
        next backdrop

Suggests:

 * Animate a sprite
 * Add effects

next.


## Add a sprite

Shows you how to click through to choosing a new sprite.

Suggests:

 * Add a backdrop
 * Animate a sprite

next.


## Add a backdrop

Shows you how to click through to choosing a new backdrop.

Suggests:

 * Change size
 * Animate a sprite

next.


## Change size

With a chosen sprite:

    when this sprite clicked:
        set size to 100%
        repeat 10:
            change size by 10

Suggests:

 * Glide around
 * Make it spin

next.


## Glide around

On a bat:

    when green flag clicked:
        glide 1 secs to x -50 y 100
        glide 1 secs to x 0 y 0

On a different character:

    when green flag clicked:
        go to x -30 y 20
        glide 1 secs to x 90 y 50

Suggests:

 * Add a backdrop
 * Animate a sprite

next.


## Record a sound

Shows you how to click to the record mechanism and choose your sound
from drop-down.

    when green flag clicked:
        play sound "recording1" until done

Suggests:

 * Make music
 * Animate a sprite

next.


## Make it spin

On a robot:

    when this sprite clicked:
        repeat 10:
            turn clockwise 15 degrees

And

    when green flag clicked:
        point in direction 90

Suggests:

 * Add a backdrop
 * Animate a sprite

next.


## Hide and show

On a unicorn:

    when green flag clicked:
        hide
        wait 1 seconds
        show

Suggests:

 * Add a backdrop
 * Animate a sprite

next.


## Animate a sprite

On a bird:

    when green flag clicked:
        repeat 10:
            next costume
            wait 0.3 seconds

Suggests:

 * Add a backdrop
 * Add effects

next.


## Use arrow keys

On cat:

    when "right arrow" key pressed:
        change x by 10

    when "left arrow" key pressed:
        change x by -10

and then:

    when "up arrow" key pressed:
        change y by 10

    when "down arrow" key pressed:
        change y by -10

Suggests:

 * Add a backdrop
 * Animate a sprite

next.


## Add effects

On dragon:

    when this sprite clicked:
        repeat 10:
            change "color" effect by 25

Suggests:

 * Add a backdrop
 * Animate a sprite

next.

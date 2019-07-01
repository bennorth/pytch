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


# Required new features

To implement the above, we would need:


## Sprite methods

### Costume

 - `next costume`

Needs to be an order to the costumes, not just a map from name.
Specify costumes as a list of tuples (whose first element is the name)
rather than a map from name to the rest of the info?

### Speech bubble

 - `say () for () seconds`

Proper solution would involve trying not to overlap speech bubbles,
word wrapping, etc., but something simple might not be too tricky.
Equivalent to

    say('hello')
    wait(2)
    say(None)

Do we want a distinction between `say(None)` and `say('')`?

### Direction and directional movement

 - `move () steps`
 - `turn clockwise () degrees`
 - `point in direction ()`

Probably easy enough, although care needed over moving off stage.
Scratch limits how far off-stage a sprite can go with the `move ()
steps` block.  Coupled with hit-test difficulty for ‘when this sprite
clicked’.

### Size

 - `change size by ()`
 - `set size to ()`

Easy enough; details: limits? interaction with hit-test?

### Graphics effects

 - `change () effect by ()` (e.g., `color`)
 - `clear graphics effects`

Could probably look at Scratch implementation for inspiration.  Might
be quite fiddly for relatively small gain.

### Movement

 - `if on edge, bounce`
 - `glide () secs to ()` (e.g., `random posn`)
 - `glide () secs to x () y ()`

Bounce behaviour would need exploring and defining but then probably
not too tricky.

Scratch behaviour while a ‘glide’ is going on is that the path is set
and any disturbances are undone at the next frame.  E.g., having a
‘when up arrow pressed, change y by 10’ and pressing up arrow while a
glide is happening hops the sprite up by 10 for a frame or so only.
Could be implemented in Python as a loop, so fairly easy.

If there are two concurrent ‘glide’s going on, one ‘wins’.

For ‘random posn’, cleanest to do this via named constants?

    self.glide_to(pytch.Random_Position, 2.0)

Although you can ‘glide to’ another sprite, so this might have to be a
string, with a convention for non-sprite-class values like

    self.glide_to('Gem', 2.0)
    self.glide_to('.random', 1.0)

### Text-to-speech extension

 - `set voice to ()` (e.g., `squeak`)
 - `speak ()`

Not going to do this in v1.


## Primitives

### Events

 - `when this sprite clicked`
 - `when () key pressed`

Complexity of ‘sprite clicked’ depends on whether we’ve done
rotation/scaling of sprites.  Key-press event should be easy enough.

Does raise questions about event handling model, though.  If we have

    @when_key_pressed(‘k’)
    def move_up(self):
        pytch.wait(5.0)
        self.change_y_pos(20)

and then hit ‘k’ a few times in rapid succession, what should happen?
How many times should the sprite move up?  Scratch prevents a second
handler thread from starting while the first one is running.  This is
in contrast to the behaviour for message receipt events, which cancel
and launch new.

### Sound

 - `start sound ()`
 - `play sound () until done`

Both launch threads to play sound; the second then blocks the calling
thread until the sound has finished playing.  Sound can be specified
by name or index.  Would need to think about indexing: strongly
leaning towards zero-based (the Python way) even though that’s a
change from Scratch.

### Looping

 - `repeat ()`

Use Python equivalent

    for _ in range(6):
        self.change_size_by(10)

### Mouse sensing

 - `mouse x`

### Control

 - `stop ()` (e.g., `all`)

### Video sensing extension

 - `when video motion > ()`

Not going to do this for v1.

### Variable watchers

Used for a few ‘score’ variables.  Could, for v1, cheat and put these
next to the green flag.  Only ever one in these tutorials (‘score’),
so would be OK-ish.  Used in:

 - Make a chase game
 - Make a clicker game
 - Make it fly
 - Pong game
 - Animate an adventure game

So a primitive like

    pytch.add_watcher(self, 'score')

would probably suffice?  Has to be indirected to allow display loop to
pull out current value of that variable.  Distinction between global
and instance variables?  Maybe first arg means ‘scope’ or ‘namespace’?
E.g.,

    pytch.add_watcher(GlobalVariables, 'score')

Would be a relatively small step from ‘paragraph next to green flag’ to
allow placement in a div on top of the canvas, but that can be v2.

### Random number generation

 - `pick random`

Scratch behaviour is to guess whether you want a random integer or a
random floating-point number from the arguments.  We might decide not
to copy this approach.  Python provides a `random` module, which is
implemented in Skulpt, so defer to that.


## Proposed initial priorities

 - `when key pressed` event
 - `glide` with target of ‘random position’
 - sounds
 - simple variable watchers (i.e., only works well for one watcher)

Would enable:

 - *Make a chase game*
 - Most of *Animate a character* (not the graphics effects)

By adding

 - Color effect

would enable rest of *Animate a character*.  By adding

 - Speech bubbles

would enable *Create a story*, *Animate an adventure game*, *Getting
started*.  By adding

 - Next costume

would enable *Make it fly*.

By adding

 - If on edge, bounce
 - Stop all

would enable *Pong game*.  Would be nice to have

 - `when this sprite clicked`

as that would allow *Make a clicker game* (apart from color-change
effect).


# Possible presentation approach

Worth making literate git repos for these tutorials?  Might be a good
use-case for the literate-git thing and a way of pushing one of the
advantages of text-based languages.

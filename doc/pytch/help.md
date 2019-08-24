# Pytch: Help


## Editing and compiling

You write and edit your Python program in the left panel.  Unlike
Scratch, where changes take effect straight away, in Python you must
_compile_ your program first.  In Pytch, this is done with the
_COMPILE_ button in the menu-bar at the top.  Compiling can take
several seconds for a complicated program.  If there are errors in
your program, a description of the problem will appear in the ‘Errors’
tab underneath the editor.


## Running and stopping

Once your program compiles successfully, you can click on the stage
and then use your program.  Many projects will need the user to click
the _green flag_ (currently a rectangle), but not always.  To stop all
running scripts, hit the _red stop button_.  The green flag and stop
button are both below the stage.



## Sprites

Each sprite in your project has its own Python `class`, which must be
derived from the `pytch.Sprite` class.  For example,

```python
class Star(pytch.Sprite):
    # Code for Star goes here
```


## Stage

Your project must have a `class` for the stage, which must be derived
from the `pytch.Stage` class.  For example,

```python
class Stage(pytch.Stage):
    # Code for your stage goes here
```


## Scripts

The Pytch equivalent of a script for a sprite is a _method_ on that
sprite.  For example,

```python
    @pytch.when_key_pressed('ArrowUp')
    def move_up(self):
        self.change_y_pos(10)

```

Here we see that a _method decorator_ does the job of a Scratch _hat
block_, and the method call `self.change_y_pos(10)` does the job of
the _change&nbsp;y&nbsp;by_ Scratch block.


## Costumes

Your sprite must have at least one costume.  These are given in a
_class attribute_ called `Costumes`, for example

```python
class Player(pytch.Sprite):
    Costumes = {'python': ('pytch-images/python-logo.png', 25, 25)}
    # ... other code for Player ...
```

The `Costumes` attribute is a Python dictionary.  Each key is the name
of that costume, to be used in `switch_costume()` calls.  The value is
a tuple of three things:

 * URL for graphics; currently PNG;
 * x-coordinate of the 'centre' of the sprite;
 * y-coordinate of the 'centre' of the sprite.

See examples for how your program provides these pieces of information
to Pytch.  We have supplied a few sample costumes with this initial
version; we intend to expand the collection in the future.

### Sample costumes

For this initial release, these costumes are available:

 * `pytch-images/balloon.png` &mdash; a balloon with string
 * `pytch-images/ball.png` &mdash; a small ball
 * `pytch-images/player-1.png` &mdash; the _Pong_ paddle used for
   player 1 in the demo
 * `pytch-images/player-2.png` &mdash; the _Pong_ paddle used for
   player 2 in the demo
 * `pytch-images/python-logo.png` &mdash; the Python logo
 * `pytch-images/star.png` &mdash; a small yellow star


## Stage backdrops

Your `Stage`-derived class must have an attribute `Backdrops` of the
same form as a Sprite’s `Costumes` attribute, for example

```python
class Stage(pytch.Stage):
    Backdrops = {'pong': 'pytch-images/backdrop.png'}
    # ... other code for Stage ...
```

The image should 480 pixels wide and 360 high.

The current implementation only supports one backdrop, so its name
(‘`pong`’ in the above example) is not used.

### Sample backdrops

For this initial release, these backdrops are available:

 * `pytch-images/backdrop.png`
 * `pytch-images/midnightblue.png`


## Sounds

If you want to use sounds, your sprite must have a class attribute
called `Sounds`, for example

```python
class Player(pytch.Sprite):
    Sounds = {'pop': 'pytch-audio/pop.mp3'}
    # ... other code for Player ...
```

The `Sounds` attribute is a Python dictionary.  Each key is the name
of that sound, to be used in a `start_sound()` block.  The value is a
URL for the sound file.  We have provided a handful of example sounds
for this initial version.

See the examples for how this works.

### Sample sounds

For this initial release, these sounds are available:

 * `pytch-sounds/Ping Pong Hit.mp3`
 * `pytch-sounds/pop.mp3`


## Equivalents to Scratch blocks

Apart from 'hat' blocks, Pytch provides equivalents to (some) Scratch
blocks in three ways:

### Methods on a `Sprite`

 * `self.x_pos()` gives the Sprite's current x coordinate
 * `self.y_pos()` gives the Sprite's current y coordinate
 * `self.change_x_pos(dx)` adds `dx` to the Sprite's current x
   coordinate
 * `self.change_y_pos(dy)` adds `dy` to the Sprite's current y
   coordinate
 * `self.set_x_pos(x)` sets the Sprite's x coordinate to `x`
 * `self.set_y_pos(y)` sets the Sprite's x coordinate to `y`
 * `self.go_to_xy(x, y)` sets the Sprite's current x and y coordinates
   to `x` and `y` respectively
 * `self.glide_to(target, n_seconds)` sets off a glide of the Sprite
   which will take `n_seconds` seconds and end up at the `target`;
   currently the only supported target is `'random'`
 * `self.glide_to_xy(target_x, target_y, n_seconds)` sets off a glide
   of the Sprite which will take `n_seconds` seconds and end up at the
   location (`x`, `y`)
 * `self.show()` makes the Sprite be visible
 * `self.hide()` makes the Sprite be not visible
 * `self.switch_costume(costume_name)` sets the Sprite's costume to
   the one given by `costume_name`
 * `self.touching(other_name)` gives a true/false answer as to
   whether the Sprite is touching the Sprite whose name is
   `other_name`; currently this is done by rectangular bounding-box so
   is an approximation only
 * `self.start_sound(sound_name)` launches the playback of the sound
   with name `sound_name`; the script continues with the sound playing
   in the background

### Methods on the stage

In future we hope to implement the various Stage-only blocks from
Scratch, for example `next_backdrop()`.

### Functions within the `pytch` module

 * `pytch.wait_seconds(n_seconds)` makes the script calling
   `wait_seconds()` do nothing for `n_seconds` seconds before
   resuming; currently this is done by counting frames, so complicated
   scripts which render at less than 60fps will wait for the wrong
   amount of time; fixing this is on the roadmap
 * `pytch.broadcast(message_string)` broadcasts the message
   `message_string`, launching any scripts with a matching
   `@when_I_receive()` decorator (hat-block); the script calling
   `broadcast()` continues, with the responses happening concurrently
 * `pytch.broadcast_and_wait(message_string)` broadcasts the message
   `message_string`, launching any scripts with a matching
   `@when_I_receive()` decorator (hat-block); the script calling
   `broadcast()` waits until all those scripts have finished before
   continuing
 * `pytch.key_is_pressed(key_name)` gives a true/false answer as to
   whether the key with name `key_name` is currently pressed
 * `pytch.show_variable(owner, name)` makes the variable within `owner`
   (e.g., a Sprite) called `name` be visible


## Scratch 'hat' blocks

Done via Python _decorators_.  E.g.,

```python
    @when_I_receive('Play_One_Point')
    def prepare_to_play(self):
        # ... do stuff ...
```

The available decorators are:

 * `@when_I_receive(message_string)` causes the decorated method to be
   called whenever somebody broadcasts the given `message_string`
 * `@when_green_flag_clicked()` causes the decorated method to be
   called whenever the green flag is clicked by the user
 * `@when_key_pressed(key_name_as_string)` causes the decorated method
   to be called whenever the user presses the given key
 * `@when_this_sprite_clicked()` causes the decorated method to be
   called whenever the user clicks / taps on the sprite


## Final last pieces of a Pytch program

We are working on reducing the amount of boilerplate required, but
currently there is still a small amount.

You must _import_ the Pytch module at the top of your program, by
writing

```python
import pytch
```

After defining all your Sprite-derived classes, and your Stage-derived
class, you must register them all with code along the lines of

```python
pytch.register_stage_class(Stage)
pytch.register_sprite_class(Player)
pytch.register_sprite_class(Star)
```

and then the last line of your Python program should be

```python
pytch.run()
```

to launch the project!


## Errors

If there is an error in your Python program, this will be shown in the
red-backed ‘Errors’ tab.  Currently the error messages are given in
their raw form; providing more useful messages is on the roadmap.


## Multitasking

All scripts under hat blocks generally run to completion when that
script is triggered, before the screen is updated.  The exceptions
are:

 * when an ‘and wait’ call is made, e.g., `broadcast_and_wait()`;
 * during a `while` or `for` loop: one iteration of the loop runs per
   display frame.

One consequence of this is that if you have a very complex piece of
processing inside an event handler, your project might appear to have
crashed.  Try to keep things simple!


## Privacy

No project code ever leaves your browser.  Everything you create is
stored locally.

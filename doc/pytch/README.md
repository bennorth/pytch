# Pytch

## Sprites

### Costumes

Need three things:

 * URL for graphics; currently PNG;
 * x-coordinate of the 'centre' of the sprite;
 * y-coordinate of the 'centre' of the sprite.

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

On the roadmap is:

 * `@when_this_sprite_clicked()`


# Skeleton Pytch script

We are working on reducing the amount of boilerplate required, but
currently there is still a small amount.

After defining all your Sprite-derived classes, and your Stage-derived
class, you must register them all with code along the lines of

```python
pytch.register_stage_class(Stage)
pytch.register_sprite_class(Player)
pytch.register_sprite_class(Star)
```

and then the last line of your Python script should be

```python
pytch.run()
```

to launch the project!

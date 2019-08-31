from pytch.sprite import Sprite
import pytch.hat_blocks as hats


class Spaceship(Sprite):
    @hats.when_green_flag_clicked
    def launch(self):
        pass

    @hats.when_key_pressed('a')
    def move_left(self):
        pass

    @hats.when_key_pressed('d')
    def move_right(self):
        pass

    @hats.when_this_sprite_clicked
    def engage_shields(self):
        pass

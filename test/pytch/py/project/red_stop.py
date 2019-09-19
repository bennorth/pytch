import pytch

from pytch.sprite import Sprite
from pytch.project import Project
from pytch.hat_blocks import when_I_receive


class Broom(Sprite):
    Costumes = {}

    @when_I_receive('make-new-brooms')
    def duplicate(self):
        pytch.create_clone_of(self)

    @when_I_receive('move')
    def move(self):
        while True:
            self.change_x_pos(10)


project = Project()
project.register_sprite_class(Broom)

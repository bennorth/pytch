import pytch
from pytch.sprite import Sprite
from pytch.project import Project
from pytch.hat_blocks import (
    when_green_flag_clicked,
    when_I_start_as_a_clone,
    when_I_receive,
)


G_next_global_id = 99
def next_global_id():
    global G_next_global_id
    G_next_global_id += 1
    return G_next_global_id


class Alien(Sprite):
    Costumes = {}

    def __init__(self):
        Sprite.__init__(self)
        self.copied_id = 42
        self.generated_id = next_global_id()

    @when_I_start_as_a_clone
    def update_id(self):
        self.copied_id += 1
        self.generated_id = next_global_id()

    @when_I_receive('clone-self')
    def clone_self(self):
        pytch.create_clone_of(self)

    @when_I_receive('clone-by-class')
    def clone_by_class(self):
        pytch.create_clone_of(Alien)


class Broom(Sprite):
    Costumes = {}

    def __init__(self):
        Sprite.__init__(self)
        self.copied_id = 1

    @when_I_start_as_a_clone
    def update_id(self):
        self.copied_id += 1
        if self.copied_id < 5:
            pytch.create_clone_of(self)

    @when_I_receive('clone-self')
    def clone_self(self):
        pytch.create_clone_of(self)


project = Project()
project.register_sprite_class(Alien)
project.register_sprite_class(Broom)

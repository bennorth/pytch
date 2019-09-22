import pytch

from pytch import Sprite, Project, when_I_receive


class Alien(Sprite):
    Costumes = {}

    @when_I_receive('launch-invasion')
    def do_something_bad(self):
        self.engage_shields()

    def engage_shields(self):
        # No such method:
        self.boost_shield_power()


project = Project()
project.register_sprite_class(Alien)

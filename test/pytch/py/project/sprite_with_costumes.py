from pytch.sprite import Sprite
from pytch.project import Project


class Balloon(Sprite):
    Costumes = {
        'red-balloon': (('red-balloon.png', 20, 60), 10, 20),
        'blue-balloon': (('blue-balloon.png', 25, 65), 15, 25),
    }


project = Project()
project.register_sprite_class(Balloon)

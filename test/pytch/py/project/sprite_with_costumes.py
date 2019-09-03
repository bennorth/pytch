from pytch.sprite import Sprite
from pytch.project import Project


class Balloon(Sprite):
    Costumes = {
        'red-balloon': ('https://example.com/red-balloon.png', 10, 20),
        'blue-balloon': ('https://example.com/blue-balloon.png', 15, 25),
    }


project = Project()
project.register_sprite_class(Balloon)

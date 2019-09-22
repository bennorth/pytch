import pytch
from pytch import Stage, Sprite, Project


class Banana(Sprite):
    Costumes = {'yellow': ('yellow.png', 50, 30)}


class Table(Stage):
    Backdrops = {'wooden': 'wooden.png'}


project = Project()
project.register_sprite_class(Banana)
project.register_stage_class(Table)

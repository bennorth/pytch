from pytch.sprite import Sprite
from pytch.project import Project
from pytch.hat_blocks import when_green_flag_clicked


class FlagClickCounter(Sprite):
    def __init__(self):
        self.n_clicks = 0

    @when_green_flag_clicked
    def count_the_click(self):
        self.n_clicks += 1


project = Project()
project.register_sprite_class(FlagClickCounter)
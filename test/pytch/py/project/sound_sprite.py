from pytch.sprite import Sprite
from pytch.project import Project
from pytch.hat_blocks import when_green_flag_clicked


class SoundSprite(Sprite):
    Costumes = {}
    Sounds = { 'click' : 'click.mp3' }
    
    def __init__(self):
        Sprite.__init__(self)

    @when_green_flag_clicked
    def make_noise(self):
        self.start_sound('click')


project = Project()
project.register_sprite_class(SoundSprite)

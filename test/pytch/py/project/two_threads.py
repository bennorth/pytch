import pytch
from pytch.hat_blocks import when_green_flag_clicked
from pytch.sprite import Sprite
from pytch.project import Project
#from pytch.syscalls import _yield_until_next_frame

class T1(Sprite):
    Costumes = {}

    def __init__(self):
        Sprite.__init__(self)
        self.counter = 0

    @when_green_flag_clicked
    def start_counting(self):
        while True:
            self.counter = self.counter+1

class T2(Sprite):
    Costumes = {}

    def __init__(self):
        Sprite.__init__(self)
        self.counter = 0

    @when_green_flag_clicked
    def start_counting(self):
        while True:
            self.counter = self.counter+1



project = Project()
project.register_sprite_class(T1)
project.register_sprite_class(T2)


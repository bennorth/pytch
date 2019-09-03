import pytch
from pytch.hat_blocks import when_I_receive, when_green_flag_clicked
from pytch.sprite import Sprite
from pytch.syscalls import _sleep
from pytch.project import Project


class Ball(Sprite):
    Costumes = {'yellow-ball': ('pytch-images/ball.png', 8, 8)}

    def __init__(self):
        Sprite.__init__(self)
        self.go_to_xy(100, 50)
        self.switch_costume('yellow-ball')
        self.show()

    @when_green_flag_clicked
    def move(self):
        self.change_x_pos(50)
        _sleep(0.5)
        self.change_x_pos(60)


project = Project()
project.register_sprite_class(Ball)

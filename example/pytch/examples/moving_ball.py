import pytch
from pytch import (
    when_I_receive,
    when_green_flag_clicked,
    when_key_pressed,
    Sprite,
    Project,
    wait_seconds,
)


class Ball(Sprite):
    Costumes = {'ball': ('library/images/ball.png', 8, 8)}

    def __init__(self):
        Sprite.__init__(self)
        self.go_to_xy(100, 50)
        self.switch_costume('ball')
        self.show()
        print('hello, world')

    @when_green_flag_clicked
    def move(self):
        self.change_x_pos(50)
        print('moved once')
        wait_seconds(0.5)
        self.change_x_pos(50)
        print('moved twice')

    @when_key_pressed('w')
    def move_up(self):
        self.change_y_pos(25)
        print('moved up')


project = Project()
project.register_sprite_class(Ball)
project.go_live()

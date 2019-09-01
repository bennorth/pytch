from pytch.sprite import Sprite
from pytch.project import Project
from pytch.hat_blocks import when_green_flag_clicked, when_I_receive
from pytch.syscalls import _broadcast


class Sender(Sprite):
    @when_green_flag_clicked
    def send_message(self):
        _broadcast('something-happened')


class Receiver(Sprite):
    def __init__(self):
        self.n_events = 0

    @when_I_receive('something-happened')
    def note_event(self):
        self.n_events += 1


project = Project()
project.register_sprite_class(Sender)
project.register_sprite_class(Receiver)

import pytch
import random

class Stage(pytch.Stage):
    Backdrops = {'default': 'pytch-images/midnightblue.png'}

class Balloon(pytch.Sprite):
    Costumes = {'balloon': ('pytch-images/balloon.png', 25, 25)}
    Sounds = {'pop': 'pytch-sounds/pop.mp3'}

    def __init__(self):
        pytch.Sprite.__init__(self)
        self.score = 0

    @pytch.when_green_flag_clicked
    def play_game(self):
        self.go_to_xy(random.randint(-300,300), random.randint(-200,200))
        self.switch_costume('balloon')
        self.show()
        pytch.show_variable(self, 'score')
        while True:
            self.glide_to('.random', 3.0)
            self.show()
            

    @pytch.when_this_sprite_clicked
    def pop(self):
        self.start_sound("pop")
        self.hide()


pytch.register_stage_class(Stage)
pytch.register_sprite_class(Balloon)
pytch.run()

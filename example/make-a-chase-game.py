import pytch

class Player(pytch.Sprite):
    Costumes = {'python': ('pytch-images/python-logo.png', 25, 25)}
    Sounds = {'pop': 'pytch-audio/pop.mp3'}

    def __init__(self):
        pytch.Sprite.__init__(self)
        self.score = 0

    @when_key_pressed('ArrowRight')
    def move_right(self):
        self.change_x_pos(10)

    @when_key_pressed('ArrowLeft')
    def move_left(self):
        self.change_x_pos(-10)

    @when_key_pressed('ArrowUp')
    def move_up(self):
        self.change_y_pos(10)

    @when_key_pressed('ArrowDown')
    def move_down(self):
        self.change_y_pos(-10)

    @when_green_flag_clicked
    def play_game(self):
        pytch.show_variable(self, 'score')
        while True:
            if self.touching('Star'):
                self.score += 1
                pytch.play_sound_until_done('pop')

class Star(pytch.Sprite):
    @when_green_flag_clicked
    def play_game(self):
        self.set_size(0.15)
        while True:
            self.glide_to('.random', 1.0)

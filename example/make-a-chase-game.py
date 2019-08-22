import pytch

class Stage(pytch.Stage):
    Backdrops = {'default': 'pytch-images/midnightblue.png'}

class Player(pytch.Sprite):
    Costumes = {'python': ('pytch-images/python-logo.png', 25, 25)}
    Sounds = {'pop': 'pytch-sounds/pop.mp3'}

    def __init__(self):
        pytch.Sprite.__init__(self)
        self.score = 0

    @pytch.when_key_pressed('ArrowRight')
    def move_right(self):
        self.change_x_pos(10)

    @pytch.when_key_pressed('ArrowLeft')
    def move_left(self):
        self.change_x_pos(-10)

    @pytch.when_key_pressed('ArrowUp')
    def move_up(self):
        self.change_y_pos(10)

    @pytch.when_key_pressed('ArrowDown')
    def move_down(self):
        self.change_y_pos(-10)

    @pytch.when_green_flag_clicked
    def play_game(self):
        self.go_to_xy(100, 0)
        self.switch_costume('python')
        self.show()
        pytch.show_variable(self, 'score')
        while True:
            if self.touching('Star'):
                self.score += 1
                # TODO: Replace with 'play_sound_until_done'
                # when available.
                self.start_sound('pop')
                pytch.wait_seconds(1.0)

class Star(pytch.Sprite):
    Costumes = {'star': ('pytch-images/star.png', 100, 95)}

    @pytch.when_green_flag_clicked
    def play_game(self):
        self.go_to_xy(-100, 0)
        self.switch_costume('star')
        self.show()
        self.set_size(0.15)
        while True:
            self.glide_to('.random', 1.0)


pytch.register_stage_class(Stage)
pytch.register_sprite_class(Player)
pytch.register_sprite_class(Star)
pytch.run()

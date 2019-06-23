import pytch

class Waffler(pytch.Sprite):
    Costumes = {'ball': ('pytch-images/digit-4.png', 8, 8)}

    def __init__(self):
        pytch.Sprite.__init__(self)
        self.tag = "BN"
        self.switch_costume('ball')
        self.show()

    @pytch.when_green_flag_clicked
    def say_hello(self):
        print "[%s] in say_hello(): hello, world" % self.tag
        br = pytch.broadcast_and_wait("greet")
        print "[%s] say_hello(): back from bcast/wait; it gave %s" % (self.tag, br)

    @pytch.when_I_receive("greet")
    def greet(self):
        for i in range(1, 6):
            print "[%s] in message-handler for 'greet': greeting number %d!" % (self.tag, i)
            yr = pytch._yield_until_next_frame()
            print "[%s] greet(): back from yield-until-next-frame; it gave %s" % (self.tag, yr)

    @pytch.when_I_receive("greet")
    def greet_just_once(self):
        print "[%d] greet_just_once(): a single greeting" % self.tag

    @pytch.when_green_flag_clicked
    def keep_saying_hi(self):
        i = 0
        while i < 60:
            i += 1
            if (i % 10) == 0:
                print "[%s] hi %d" % (self.tag, i / 10)
            self.change_x_pos(3)
            self.change_y_pos(2)
            yr = pytch._yield_until_next_frame()
            print "[%s] back from yield-until-next-frame; it gave %s" % (self.tag, yr)

pytch.register_sprite_class(Waffler)
print "run returned: %s" % (pytch.run())

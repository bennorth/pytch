import _pytch
import random


################################################################################
#
# Sprite and Stage base classes

class Stage:

    Sounds = {}

    def __init__(self):
        self._x = 0
        self._y = 0
        self._size = 1.0
        self._shown = True
        self._costume = self.Backdrops.keys()[0]

    # TODO: Other Stage methods.
    # TODO: Extract behaviour in common with Sprite.


class Sprite:
    """
    Keep track of a sprite's (x, y) coordinates, whether or not it is shown,
    and the name of the costume it is currently wearing.
    """

    Sounds = {}

    def __init__(self):
        self._x = 0
        self._y = 0
        self._size = 1.0
        self._shown = False
        self._costume = '--does-not-matter--'

    def go_to_xy(self, x, y):
        self._x = x
        self._y = y

    def x_pos(self):
        return self._x

    def y_pos(self):
        return self._y

    def change_x_pos(self, dx):
        self._x += dx

    def change_y_pos(self, dy):
        self._y += dy

    def set_x_pos(self, x):
        self._x = x

    def set_y_pos(self, y):
        self._y = y

    def glide_to(self, target, n_seconds):
        if target == '.random':
            # TODO: Update to use canvas size, if/when that is non-fixed.
            target_x = random.randrange(-240, 241)
            target_y = random.randrange(-180, 181)
        else:
            raise ValueError('unknown glide target')
        self.glide_to_xy(target_x, target_y, n_seconds)

    def glide_to_xy(self, target_x, target_y, n_seconds):
        x0 = self.x_pos()
        y0 = self.y_pos()
        n_frames = int(60.0 * n_seconds)  # TODO: Do not hard-code frame rate?
        for i in range(n_frames):
            a = (i + 1.0) / n_frames
            x = a * target_x + (1 - a) * x0
            y = a * target_y + (1 - a) * y0
            self.go_to_xy(x, y)
            _pytch._yield_until_next_frame()

    def set_size(self, size):
        self._size = size

    def show(self):
        self._shown = True

    def hide(self):
        self._shown = False

    def switch_costume(self, costume_name):
        self._costume = costume_name

    def touching(self, other_name):
        return _pytch.bounding_boxes_overlap(self.__class__.__name__,
                                             other_name)

    def play_sound(self, sound_name):
        return _pytch.play_sound( self.__class__.__name__,
                                  sound_name )


show_variable = _pytch.show_variable


# Event handlers are registered in a two-phase process.  Each sort of decorator
# adds a function attribute, which is then picked up in run() below.


def when_green_flag_clicked(fun):
    fun._pytch_handler_for = ('green-flag', None)
    return fun


class when_I_receive:
    def __init__(self, message):
        self.message = message

    def __call__(self, fun):
        fun._pytch_handler_for = ('message', self.message)
        return fun


class when_key_pressed:
    def __init__(self, key):
        self.key = key

    def __call__(self, fun):
        fun._pytch_handler_for = ('key', self.key)
        return fun


broadcast = _pytch._broadcast
broadcast_and_wait = _pytch._broadcast_and_wait
key_is_pressed = _pytch.key_is_pressed
wait_seconds = _pytch._sleep

stage_classes = []

def register_stage_class(cls):
    # There can only be one Stage.
    assert len(stage_classes) == 0
    stage_classes.append(cls)


sprite_classes = []

def register_sprite_class(cls):
    sprite_classes.append(cls)


def register_instance_handlers(obj):
    for attr_name in dir(obj):
        obj_attr = getattr(obj, attr_name)
        if hasattr(obj_attr, 'im_func'):
            bound_method = obj_attr
            raw_fun = bound_method.im_func
            if hasattr(raw_fun, '_pytch_handler_for'):
                evt_tp, evt_data = raw_fun._pytch_handler_for
                if evt_tp == 'green-flag':
                    _pytch.when_green_flag_clicked(bound_method)
                elif evt_tp == 'message':
                    _pytch.when_I_receive(evt_data, bound_method)
                elif evt_tp == 'key':
                    _pytch.when_key_pressed(evt_data, bound_method)

def run():
    # Fudge: register stage first so it gets drawn first and hence 'under'
    # all sprites.

    for cls in stage_classes:
        sprite = cls()
        sprite_cls_name = cls.__name__
        _pytch._register_sprite_instance(sprite_cls_name, sprite)
        for costume_name, costume_url in cls.Backdrops.items():
            print _pytch._register_sprite_costume(sprite_cls_name,
                                                  costume_name,
                                                  costume_url,
                                                  240, 180)
        for sound_name, sound_url in cls.Sounds.items():
            print _pytch._register_sprite_sound(sprite_cls_name,
                                                    sound_name,
                                                    sound_url);


        register_instance_handlers(sprite)

    for cls in sprite_classes:
        sprite = cls()
        sprite_cls_name = cls.__name__
        _pytch._register_sprite_instance(sprite_cls_name, sprite)
        for costume_name, costume_info in cls.Costumes.items():
            costume_url, costume_centre_x, costume_centre_y = costume_info
            print _pytch._register_sprite_costume(sprite_cls_name,
                                                  costume_name,
                                                  costume_url,
                                                  costume_centre_x,
                                                  costume_centre_y)
        for sound_name, sound_url in cls.Sounds.items():
            print _pytch._register_sprite_sound(sprite_cls_name,
                                                    sound_name,
                                                    sound_url);


        register_instance_handlers(sprite)

    return _pytch.run()


################################################################################
#
# Wait until next frame

# TODO: Inject these calls automatically

_yield_until_next_frame = _pytch._yield_until_next_frame

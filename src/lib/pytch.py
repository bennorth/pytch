import _pytch


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


broadcast_and_wait = _pytch._broadcast_and_wait


sprite_classes = []

def register_sprite_class(cls):
    sprite_classes.append(cls)


def run():
    # TODO: Inspect Sprite-derived classes, create one instance of
    # each, pass in a list to JS layer.

    for cls in sprite_classes:
        sprite = cls()

        for attr_name in dir(sprite):
            sprite_attr = getattr(sprite, attr_name)
            if hasattr(sprite_attr, 'im_func'):
                bound_method = sprite_attr
                raw_fun = bound_method.im_func
                if hasattr(raw_fun, '_pytch_handler_for'):
                    evt_tp, evt_data = raw_fun._pytch_handler_for
                    if evt_tp == 'green-flag':
                        _pytch.when_green_flag_clicked(bound_method)
                    elif evt_tp == 'message':
                        _pytch.when_I_receive(evt_data, bound_method)

    # TODO: Extract collection of costumes and (asynchronously?) load
    # them.

    return _pytch.run()


################################################################################
#
# Wait until next frame

# TODO: Inject these calls automatically

_yield_until_next_frame = _pytch._yield_until_next_frame

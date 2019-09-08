"""
Scratch 'hat blocks' are implemented as decorators on the methods
within a Sprite-derived class or the Stage-derived class.

We do (or will) provide:

    when green flag clicked
    when (some-key) key pressed
    when this sprite clicked
    when backdrop switches to (some-backdrop)
    when timer > (threshold)

but not

    when loudness > (threshold)

hat blocks.

Mechanism:

The functions within the class definition are decorated with one of
the below decorators, which gives them a '_pytch_handler_for'
attribute.  This is inspected when the class is registered as a
Pytch Sprite.
"""


def when_green_flag_clicked(fun):
    fun._pytch_handler_for = ('green-flag', None)
    return fun


def when_this_sprite_clicked(fun):
    fun._pytch_handler_for = ('click', None)
    return fun


def when_I_start_as_a_clone(fun):
    fun._pytch_handler_for = ('clone', None)
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
        fun._pytch_handler_for = ('keypress', self.key)
        return fun

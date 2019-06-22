import _pytch


# List of event-handlers, each represented as a 2-tuple
# (event-descriptor, handler-function).
#
# The 'event-descriptor' is a string, whose first character specifies
# what type of event this handler is for:
#
#   G --- green flag clicked
handlers = []


def when_green_flag_clicked(fun):
    handlers.append(('G', fun))
    return fun


class when_I_receive:
    def __init__(self, message):
        self.message = message

    def __call__(self, fun):
        handlers.append(('M%s' % self.message, fun))
        return fun



def run():
    for evt, fun in handlers:
        if evt == 'G':
            _pytch.when_green_flag_clicked(fun)
        else:
            raise RuntimeError('unknown event type')
    return _pytch.run()


################################################################################
#
# Wait until next frame

# TODO: Inject these calls automatically

_yield_until_next_frame = _pytch._yield_until_next_frame

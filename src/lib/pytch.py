import _pytch

from _pytch import hello_world, run


# List of event-handlers, each represented as a 2-tuple
# (event-descriptor, handler-function).
#
# The 'event-descriptor' is a string, whose first character specifies
# what type of event this handler is for:
#
#   G --- green flag clicked
handlers = []

import copy
from pytch.syscalls import _register_sprite_instance


def create_clone_of(original):
    """
    Two variants, depending on whether the original is a class or an
    instance.  If a class, we clone its instance-0.
    """
    obj = ((self
            ._pytch_containing_project
            .instance_0_of_class(original.__class__))
           if isinstance(original, type)
           else original)

    return create_clone_of_instance(obj)


def create_clone_of_instance(obj):
    new_obj = copy.deepcopy(obj)
    return _register_sprite_instance(new_obj)

# Bring user-visible things in to top level with Scratch-friendly names.

from pytch.sprite import Sprite

from pytch.project import Project

from pytch.hat_blocks import (
    when_I_receive,
    when_green_flag_clicked,
    when_I_start_as_a_clone,
)

from pytch.clone import create_clone_of

from pytch.syscalls import (
    _broadcast as broadcast,
    _broadcast_and_wait as broadcast_and_wait,
    _sleep as wait_seconds,
    _is_key_pressed as key_is_pressed,
    
    _yield_until_next_frame as _yield_until_next_frame # Expected to be automatically called by compiler
)

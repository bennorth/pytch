from pytch.syscalls import _play_sound_until_finished
"""
PytchObject is the common ancestor of both Stage and Sprite.

"""

class PytchObject:
    def __init__(self):
        pass
    # Map of sound-name to Sound objects.
    # Load a sound in an instance by declaring an entry here, e.g.
    # Sounds = { ('bounce' : 'pytch-sounds/Ping Pong Hit.mp3') }
    Sounds = {} 

        
    def start_sound(self, sound_name):
            """Begin playing a previously loaded sound. Returns immediately and leaves the sound playing in the background."""
            project = self._pytch_containing_project
            project.start_sound( self.__class__, sound_name )

    def play_sound_until_finished(self, sound_name):
            """Begin playing a previously loaded sound, and block the thread until the sound is finished."""
            project = self._pytch_containing_project
            snd = project.retrieve_JSsound_by_name(self.__class__, sound_name)
            _play_sound_until_finished(snd)


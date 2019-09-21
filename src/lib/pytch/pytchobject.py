"""
PytchObject is the common ancestor of both Stage and Sprite.

"""

class PytchObject:
    def __init__(self):

        # Map of sound-name to Sound objects.
        # Load a sound in an instance by declaring an entry here, e.g.
        # Sounds = { ('bounce' : 'pytch-sounds/Pint Pong Hit.mp3') }
        Sounds = {} 

        
        def start_sound(self, sound_name):
            """Begin playing a previously loaded sound. Returns immediately and leaves the sound playing in the background."""
            pass

        def play_sound_until_finished(self, sound_name):
            """Begin playing a previously loaded sound, and block the thread until the sound is finished."""
            pass

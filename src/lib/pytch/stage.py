class Stage:
    Backdrops = {'solid-white': 'library/images/stage/solid-white.png'}
    _x = 0
    _y = 0
    _size = 1.0
    _shown = True
    _costume = 'solid-white'

    def __init__(self):
        pass

    def switch_backdrop(self, costume_name):
        self._costume = costume_name

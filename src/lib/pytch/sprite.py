class Sprite:
    def __init__(self):
        self._x = 0
        self._y = 0
        self._size = 1.0
        self._shown = False
        self._costume = 'no-such-costume';

    def x_pos(self):
        return self._x

    def set_x_pos(self, x):
        self._x = x

    def y_pos(self):
        return self._y

    def set_y_pos(self, y):
        self._y = y

    def go_to_xy(self, x, y):
        self._x = x
        self._y = y

    def change_x_pos(self, dx):
        self._x += dx

    def change_y_pos(self, dy):
        self._y += dy

    def switch_costume(self, costume_name):
        self._costume = costume_name

    def show(self):
        self._shown = True

    def hide(self):
        self._shown = False

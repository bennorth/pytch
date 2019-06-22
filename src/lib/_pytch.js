var $builtinmodule = function (name) {
"use strict";

    var mod = {};

    mod.hello_world = Sk.builtin.str("hello, world");

    mod.frame_idx = 0;
    return mod;
};

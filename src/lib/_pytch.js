var $builtinmodule = function (name) {
"use strict";

    var mod = {};

    mod.hello_world = Sk.builtin.str("hello, world");

    mod.frame_idx = 0;
    mod.frame_idx_elt = document.getElementById("frame-idx");

    var process_frame = function() {
        mod.frame_idx_elt.innerHTML = mod.frame_idx;
        mod.frame_idx += 1;
    };

    mod.run = function() {
        window.requestAnimationFrame(process_frame);
        return Sk.builtin.str("all done");
    };

    return mod;
};

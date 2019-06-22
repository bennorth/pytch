var $builtinmodule = function (name) {
"use strict";

    var mod = {};

    mod.hello_world = Sk.builtin.str("hello, world");

    // The green flag will go through three states.  It starts off in
    // 'not-clicked-yet'.  When processing the first frame after it has been
    // clicked it's in 'just-clicked', and for all subsequent frames it is in
    // 'has-been-clicked'.  Only one pass through this set of transitions is
    // possible.
    mod.green_flag_elt = document.getElementById("green-flag");
    mod.green_flag_state = "not-clicked-yet";

    mod.frame_idx = 0;
    mod.frame_idx_elt = document.getElementById("frame-idx");

    var process_frame = function() {
        mod.frame_idx_elt.innerHTML = mod.frame_idx;
        mod.frame_idx += 1;

        if (mod.green_flag_state == "just-clicked") {
            // TODO: Launch when-green-flag-clicked handlers.
            mod.green_flag_state = "has-been-clicked";
        }

        var all_done = (mod.frame_idx == 60);  // TODO: Proper decision about when all done.
        if (all_done)
        {
            // TODO: What to do when everything finished?
        }
        else
            window.requestAnimationFrame(process_frame);
    };

    mod.run = function() {
        mod.green_flag_elt.onclick = function(e) { mod.green_flag_state = "just-clicked"; }
        window.requestAnimationFrame(process_frame);
        return Sk.builtin.str("all done");
    };

    return mod;
};

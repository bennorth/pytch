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

    // The 'resolve' callback which will give control back to Python once
    // all green-flag handlers have completed.
    mod.run_finished_resolve_fun = null;


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Event handlers.

    // 'When green flag clicked' handlers
    mod.green_flag_handlers = [];
    mod.when_green_flag_clicked = function(handler_py_fun)
                                  { mod.green_flag_handlers.push(handler_py_fun); };


    ////////////////////////////////////////////////////////////////////////////////

    var process_frame = function() {
        mod.frame_idx_elt.innerHTML = mod.frame_idx;
        mod.frame_idx += 1;

        if (mod.green_flag_state == "just-clicked") {
            // Launch all green-flag handlers.
            mod.green_flag_handlers
                .map(h => Sk.misceval.callsimOrSuspend(h))
                // TODO: Check which ones suspend on next-frame or
                // broadcast-and-wait and collect the suspensions.
                ;

            mod.green_flag_state = "has-been-clicked";
        }

        var all_done = (mod.frame_idx == 60);  // TODO: Proper decision about when all done.
        if (all_done)
        {
            mod.run_finished_resolve_fun(Sk.builtin.str("all done"));
        }
        else
            window.requestAnimationFrame(process_frame);
    };


    ////////////////////////////////////////////////////////////////////////////////

    mod.run = function() {
        mod.green_flag_elt.onclick = function(e) { mod.green_flag_state = "just-clicked"; }
        window.requestAnimationFrame(process_frame);

        var run_finished_promise
            = new Promise(function(resolve, reject)
                          { mod.run_finished_resolve_fun = resolve; });

        return Sk.misceval.promiseToSuspension(run_finished_promise);
    };

    return mod;
};

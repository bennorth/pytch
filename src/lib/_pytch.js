var $builtinmodule = function (name) {
"use strict";

    var mod = {};

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Green flag

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
    // Event handlers

    // 'When green flag clicked' handlers
    mod.green_flag_handlers = [];
    mod.when_green_flag_clicked = function(handler_py_fun)
                                  { mod.green_flag_handlers.push(handler_py_fun); };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Event responses
    //
    // Each time an 'event' happens (green flag click, message broadcast,
    // keypress, maybe others?), a 'response' occurs.  This response is captured
    // in an EventResponse object.  Such an object has a list of the threads
    // which are running in response to the event, and a continuation which is
    // to be invoked once all those threads have run to completion.  The threads
    // are captured via the suspension each one returns each time it gets a
    // chance to run.  If an actual object is returned, it is discarded, and
    // that thread is treated as finished.
    //
    // TODO: Is 'continuation' the right name for this concept?

    function EventResponse(handler_py_funs, continuation) {
        // TODO: Run each Python handler function; each one will either complete
        // or return a Suspension.  Gather those suspensions into
        // this.handler_suspensions.

        this.continuation = continuation;
    }

    EventResponse.prototype.run_one_frame = function() {
        var new_suspensions = [];
        this.handler_suspensions.forEach(susp => {
            var susp_or_retval = susp.resume();
            if (susp_or_retval.$isSuspension) {
                var susp = susp_or_retval;
                switch (susp.data.type) {
                case "Pytch":
                    switch (susp.data.subtype) {
                    case "next-frame":
                        new_suspensions.push(susp);
                        break;
                    default:
                        throw "unknown Pytch suspension subtype " + susp.data.subtype;
                    }
                    break;
                default:
                    throw "cannot handle non-Pytch suspension " + susp.data.type;
                }
            }
        });

        this.handler_suspensions = new_suspensions;
        // TODO: Is it my job or the scheduler's job to call the continuation if
        // the response is all done?

        // TODO: Return new event responses from broadcasts.
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Suspended handlers
    //
    // Event handlers can be suspended for the following reasons:
    //
    //  - They have called _yield_until_next_frame()
    //
    // TODO: Other reasons (broadcast-and-wait).

    // Handlers suspended waiting for the next frame
    mod.next_frame_suspensions = [];

    mod.accumulate_suspensions = function(susps) {
        susps.forEach(s => {
            switch (s.data.type) {
            case "Pytch":
                switch (s.data.subtype) {
                case "next-frame":
                    mod.next_frame_suspensions.push(s);
                    break;
                default:
                    throw "unknown Pytch suspension subtype";
                }
                break;
            default:
                throw "cannot handle non-Pytch suspension " + s.data.type;
            }
        });
    };

    mod.is_everything_finished = function() {
        return mod.next_frame_suspensions.length == 0;
        // TODO: Check whether there are other types of suspensions still going.
    }


    ////////////////////////////////////////////////////////////////////////////////

    var process_frame = function() {
        mod.frame_idx_elt.innerHTML = mod.frame_idx;
        mod.frame_idx += 1;

        var next_frame_suspensions = (mod.next_frame_suspensions
                                      .map(s => s.resume())
                                      .filter(r => r.$isSuspension));
        mod.next_frame_suspensions = [];
        mod.accumulate_suspensions(next_frame_suspensions);

        if (mod.green_flag_state == "just-clicked") {
            // Launch all green-flag handlers.
            var suspensions = mod.green_flag_handlers
                .map(h => Sk.misceval.callsimOrSuspend(h))
                .filter(retval => retval.$isSuspension);

            mod.accumulate_suspensions(suspensions);

            mod.green_flag_state = "has-been-clicked";
        }

        var all_done = (mod.green_flag_state == "has-been-clicked"
                        && mod.is_everything_finished());
        if (all_done)
            mod.run_finished_resolve_fun(Sk.builtin.str("all done"));
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


    ////////////////////////////////////////////////////////////////////////////////

    mod._yield_until_next_frame = function() {
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.int_(mod.frame_idx); };
        susp.data = { type: "Pytch", subtype: "next-frame" };
        return susp;
    }

    return mod;
};

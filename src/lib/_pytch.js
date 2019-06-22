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

    mod.stdout_elt = document.getElementById("skulpt-stdout");


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Event handlers

    // 'When green flag clicked' handlers
    mod.green_flag_handlers = [];
    mod.when_green_flag_clicked = function(handler_py_fun)
                                  { mod.green_flag_handlers.push(handler_py_fun); };

    mod.message_handlers = {};
    mod.when_I_receive = function(py_message, handler_py_fun) {
        var message = Sk.ffi.remapToJs(py_message);
        if ( ! mod.message_handlers.hasOwnProperty(message))
            mod.message_handlers[message] = [];
        mod.message_handlers[message].push(handler_py_fun);
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Event responses
    //
    // Each time an 'event' happens (green flag click, message broadcast,
    // keypress, maybe others?), a 'response' occurs.  This response is captured
    // in an EventResponse object.  Such an object has a list of the threads
    // which are running in response to the event, and a 'completion function'
    // which is to be invoked once all those threads have run to completion.
    // The threads are captured via the suspension each one returns each time it
    // gets a chance to run.  If an actual object is returned, it is discarded,
    // and that thread is treated as finished.

    function EventResponse(handler_py_funs, completion_fun) {
        // Mild fudge so that we don't have to repeat the logic of switching on
        // the different type of suspensions which we might get back from the
        // Sk.misceval.callsimOrSuspend() call.

        this.handler_suspensions = handler_py_funs.map(pyfun => {
            return {resume:
                    function() { return Sk.misceval.callsimOrSuspend(pyfun); }}
        });

        this.completion_fun = completion_fun;
    }

    EventResponse.prototype.run_one_frame = function() {
        var new_event_responses = [];
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
                    case "broadcast":
                        // TODO
                        break;
                    case "broadcast-and-wait":
                        // TODO
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

        return new_event_responses;
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Live event responses
    //
    // This is effectively the 'run queue', organised in such a way that we can
    // unblock threads which are waiting on other groups of threads.  E.g., when
    // broadcast-and-wait is called.

    mod.live_event_responses = [];

    mod.is_everything_finished = function() {
        return mod.live_event_responses.length == 0;
    }


    ////////////////////////////////////////////////////////////////////////////////

    mod.launch_green_flag_response = function() {
        mod.live_event_responses.push(
            new EventResponse(mod.green_flag_handlers,
                              // TODO: What to do when all handlers finished?
                              function(){}
                             ));
    };

    mod.message_response = function(message) {
        // We can't set the completion-function until we've gone into the
        // Skulpt-generated code and back out again, because we need the parent
        // suspension.  Use 'null' as a placeholder; it will be overwritten with
        // the correct completion-function when the parent suspension is
        // processed.
        //
        // TODO: Check message is a known message; some kind of warning if not.
        return new EventResponse(mod.message_handlers[message], null);
    };


    ////////////////////////////////////////////////////////////////////////////////

    var process_frame = function() {
        mod.frame_idx_elt.innerHTML = mod.frame_idx;
        if (mod.green_flag_state != "not-clicked-yet")
            mod.stdout_elt.innerHTML = (mod.stdout_elt.innerHTML
                                        + "\n-------- " + mod.frame_idx + " --------------\n");
        mod.frame_idx += 1;

        var new_event_responses = []
        mod.live_event_responses.forEach(er => {
            er.run_one_frame().forEach(response => new_event_responses.push(response));
        });

        // TODO: Reap completed event responses.

        if (mod.green_flag_state == "just-clicked") {
            mod.launch_green_flag_response();
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

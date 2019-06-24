var $builtinmodule = function (name) {
"use strict";

    var FRAMES_PER_SECOND = 60;

    var mod = {};

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Sprites

    // List of sprite instances making up the draw-list
    mod.sprite_instances = [];

    // Two-level map taking sprite class-name and costume-name to actual costume
    mod.sprite_costumes = {};

    //------------------------------------------------------------------------------
    // Costume
    //
    // Store information needed to render a sprite's costume onto the canvas, once
    // we know where that sprite is.  A Costume consists of an Image object together
    // with the coordinates in that image of the 'centre' of the costume --- this is
    // the point in the image which is placed at the sprite's (x, y) position when
    // rendered.

    function Costume(image, centre_x, centre_y) {
        this.image = image;
        this.centre_x = centre_x;
        this.centre_y = centre_y;
    }

    //------------------------------------------------------------------------------
    // PytchSprite
    //
    // Interface layer between Python sprite instance and JS object.

    function PytchSprite(sprite_class_name, py_sprite) {
        this.sprite_class_name = sprite_class_name;
        this.py_sprite = py_sprite;
    }

    PytchSprite.$_x = Sk.builtin.str("_x");
    PytchSprite.$_y = Sk.builtin.str("_y");
    PytchSprite.$_costume = Sk.builtin.str("_costume");
    PytchSprite.$_shown = Sk.builtin.str("_shown");

    PytchSprite.prototype.sprite_attr = function(attr_name) {
        return Sk.ffi.remapToJs(Sk.abstr.gattr(this.py_sprite,
                                               attr_name,
                                               false));
    };

    PytchSprite.prototype.sync_render_state = function() {
        // TODO: Size.
        this.x = this.sprite_attr(PytchSprite.$_x);
        this.y = this.sprite_attr(PytchSprite.$_y);
        this.shown = this.sprite_attr(PytchSprite.$_shown);
        var costume_name = this.sprite_attr(PytchSprite.$_costume);
        this.costume = mod.sprite_costumes[this.sprite_class_name][costume_name];
    };

    // Requires that the render state is freshly sync'd into the JS side.
    PytchSprite.prototype.bounding_box = function() {
        // Annoying combination of addition and subtraction to account for the
        // different coordinate systems of costume-centre vs stage.
        var min_x = this.x - this.costume.centre_x;
        var max_y = this.y + this.costume.centre_y;
        var max_x = min_x + this.costume.image.width;
        var min_y = max_y - this.costume.image.height;
        return [min_x, max_x, min_y, max_y];
    };

    var syncd_sprite_by_name = function(name) {
        var candidates = mod.sprite_instances.filter(s => s.sprite_class_name == name);
        if (candidates.length != 1)
            throw "found " + candidates.length + " candidates for " + name;
        var sprite = candidates[0];
        sprite.sync_render_state();
        return sprite;
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Canvas set-up
    //
    // Match the Scratch stage's layout, in terms of
    //  - its size: 480x360
    //  - its origin: (0, 0) is the centre of the stage
    //  - its orientation: increasing x is rightwards; increasing y is upwards

    mod.stage_wd = 480;
    mod.stage_hwd = (mod.stage_wd / 2) | 0;
    mod.stage_ht = 360;
    mod.stage_hht = (mod.stage_ht / 2) | 0;
    mod.canvas_elt = document.getElementById("pytch-canvas");
    mod.canvas_ctx = mod.canvas_elt.getContext("2d");
    mod.canvas_ctx.translate(mod.stage_hwd, mod.stage_hht);
    mod.canvas_ctx.scale(1, -1);

    if ( ! mod.canvas_elt.hasAttribute("tabindex"))
        mod.canvas_elt.setAttribute("tabindex", 0);


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Key handling

    mod.is_key_down = {}

    mod.canvas_elt.onkeydown = function(e) {
        mod.is_key_down[e.key] = true;
        e.preventDefault();
    };

    mod.canvas_elt.onkeyup = function(e) {
        mod.is_key_down[e.key] = false;
        e.preventDefault();
    };

    mod.key_is_pressed = function(py_keyname) {
        var keyname = Sk.ffi.remapToJs(py_keyname);
        var is_pressed = (mod.is_key_down.hasOwnProperty(keyname)
                          && mod.is_key_down[keyname]);
        return is_pressed ? Sk.builtin.bool.true$ : Sk.builtin.bool.false$
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // (Very) approximate collision detection

    mod.bounding_boxes_overlap = function(py_name_1, py_name_2) {
        var bbx_from_name = function(py_name) {
            return syncd_sprite_by_name(Sk.ffi.remapToJs(py_name)).bounding_box();
        }

        var bbx1 = bbx_from_name(py_name_1);
        var bbx2 = bbx_from_name(py_name_2);
        var overlap =  (bbx1[0] < bbx2[1] && bbx2[0] < bbx1[1]
                        && bbx1[2] < bbx2[3] && bbx2[2] < bbx1[3]);
        return overlap ? Sk.builtin.bool.true$ : Sk.builtin.bool.false$
    };


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
        this.n_waiting_threads = 0;
        this.n_sleeping_threads = 0;
    }

    EventResponse.prototype.is_finished = function() {
        return (this.handler_suspensions.length == 0
                && this.n_waiting_threads == 0
                && this.n_sleeping_threads == 0);
    };

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
                        var event_response = susp.data.response;
                        event_response.completion_fun = function() {};
                        new_event_responses.push(event_response);
                        new_suspensions.push(susp);
                        break;
                    case "broadcast-and-wait":
                        var event_response = susp.data.response;

                        var self = this;
                        event_response.completion_fun = function() {
                            self.handler_suspensions.push(susp);
                            self.n_waiting_threads -= 1;
                        };

                        this.n_waiting_threads += 1;
                        new_event_responses.push(event_response);
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

        return new_event_responses;
    };


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
    //
    // Sleep mechanism

    function SleepingThread(n_frames, suspension, event_response) {
        this.n_frames = n_frames;
        this.suspension = suspension;
        this.event_response = event_response;
    }

    function SleepingThreadManager() {
        this.sleeping_threads = [];
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

    var render_project = function() {
        var ctx = mod.canvas_ctx;

        ctx.clearRect(-mod.stage_hwd, -mod.stage_hht,
                      mod.stage_wd, mod.stage_ht);
        mod.sprite_instances.forEach(s => render_one_sprite(ctx, s));
    };

    var render_one_sprite = function(ctx, sprite) {
        sprite.sync_render_state();

        if (sprite.shown) {
            // Slight dance to undo the y coordinate flip.
            ctx.save();
            ctx.translate(sprite.x - sprite.costume.centre_x,
                          sprite.y + sprite.costume.centre_y);
            ctx.scale(1, -1);
            ctx.drawImage(sprite.costume.image, 0, 0);
            ctx.restore();
        }
    };


    ////////////////////////////////////////////////////////////////////////////////

    var process_frame = function() {
        mod.frame_idx_elt.innerHTML = mod.frame_idx;

        render_project();

        var new_event_responses = []
        mod.live_event_responses.forEach(er => {
            er.run_one_frame().forEach(response => new_event_responses.push(response));
        });

        var completed_responses = mod.live_event_responses.filter(er => er.is_finished());
        completed_responses.forEach(er => er.completion_fun());

        mod.live_event_responses = (mod.live_event_responses
                                    .filter(er => ( ! er.is_finished()))
                                    .concat(new_event_responses));

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

        mod.frame_idx += 1;
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

    //------------------------------------------------------------------------------
    // async_register_costume()
    //
    // Asynchronously load the image referred to by 'costume_url'.  When loaded,
    // insert a Costume object into the 'sprite_costumes' map with the image
    // and the given 'costume_centre_x' and 'costume_centre_y' values, and resolve
    // the promise which async_register_costume() returns with a diagnostic message.
    var async_register_costume = function(sprite_cls_name, costume_name, costume_url,
                                          costume_centre_x, costume_centre_y) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() {
                var costumes = mod.sprite_costumes;

                if ( ! costumes.hasOwnProperty(sprite_cls_name))
                    costumes[sprite_cls_name] = {};

                costumes[sprite_cls_name][costume_name]
                    = new Costume(img, costume_centre_x, costume_centre_y);

                resolve("image at '" + costume_url
                        + "' registered as costume '" + costume_name
                        + "' for sprite-class '" + sprite_cls_name + "'");
            };
            img.src = costume_url;
        });
    }

    mod._register_sprite_costume = function(py_sprite_cls_name,
                                            py_name, py_url,
                                            py_centre_x, py_centre_y) {
        return Sk.misceval.promiseToSuspension(
            async_register_costume(Sk.ffi.remapToJs(py_sprite_cls_name),
                                   Sk.ffi.remapToJs(py_name),
                                   Sk.ffi.remapToJs(py_url),
                                   Sk.ffi.remapToJs(py_centre_x),
                                   Sk.ffi.remapToJs(py_centre_y)));
    };

    mod._register_sprite_instance = function(py_sprite_cls_name, py_sprite) {
        // This 'id' isn't used for anything but lets the caller know we've
        // done something.
        var sprite_id = mod.sprite_instances.length;

        var sprite_cls_name = Sk.ffi.remapToJs(py_sprite_cls_name);
        mod.sprite_instances.push(new PytchSprite(sprite_cls_name, py_sprite));

        return Sk.builtin.int_(sprite_id);
    };


    ////////////////////////////////////////////////////////////////////////////////

    mod._yield_until_next_frame = function() {
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.int_(mod.frame_idx); };
        susp.data = { type: "Pytch", subtype: "next-frame" };
        return susp;
    };

    mod._broadcast_and_wait = function(py_message) {
        var message = Sk.ffi.remapToJs(py_message);
        var response = mod.message_response(message);

        var susp = new Sk.misceval.Suspension();
        susp.resume = function()
                      { return Sk.builtin.str("all message responses finished"); }
        susp.data = { type: "Pytch", subtype: "broadcast-and-wait", response: response };

        return susp;
    };

    mod._broadcast = function(py_message) {
        var message = Sk.ffi.remapToJs(py_message);
        var response = mod.message_response(message);

        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.str("message sent"); }
        susp.data = { type: "Pytch", subtype: "broadcast", response: response };

        return susp;
    };

    mod._sleep = function(py_n_seconds) {
        var n_seconds = Sk.ffi.remapToJs(py_n_seconds);

        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.str("time passed"); }
        susp.data = { type: "Pytch", subtype: "sleep",
                      n_frames: (Math.round(n_seconds * FRAMES_PER_SECOND) | 0) };
        return susp;
    };

    return mod;
};

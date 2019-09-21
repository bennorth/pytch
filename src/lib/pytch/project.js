var $builtinmodule = function (name) {
    var mod = {};

    const FRAMES_PER_SECOND = 60;

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Conversion etc. utilities

    const s_dunder_name = Sk.ffi.remapToPy("__name__");
    const s_dunder_class = Sk.ffi.remapToPy("__class__");
    const s_pytch_containing_project = Sk.ffi.remapToPy("_pytch_containing_project");

    const name_of_py_class = function(py_cls)
    { return Sk.ffi.remapToJs(Sk.builtin.getattr(py_cls, s_dunder_name)); };

    const map_concat = function(fun, xs)
    { return Array.prototype.concat.apply([], xs.map(fun)); };

    const js_getattr = function(py_obj, py_attr)
    { return Sk.ffi.remapToJs(Sk.builtin.getattr(py_obj, py_attr)); };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Rendering instructions.  To ease testing, there is no interaction here
    // with an actual canvas.  Instead, the project can provide a list of
    // rendering instructions.  These will in general be of various types, but
    // for now the only one is 'render this image here'.


    ////////////////////////////////////////////////////////////////////////////////
    //
    // RenderImage: A request that a particular image be drawn at a particular
    // location at a particular scale.  The 'location' is that of the top-left
    // corner.  The 'image label' is ignored in real rendering but is useful for
    // testing.
    //
    // (In due course, 'at a particular angle of rotation' will be added here.)
    //
    const RenderImage = function(x, y, scale, image, image_label) {
        this.kind = "RenderImage";
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.image = image;
        this.image_label = image_label;
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Costume: An image together with the coordinates of the point within it to be
    // considered the 'centre'.  Constructed from Image object, x-centre, y-centre.
    //
    const Costume = function(image, centre_x, centre_y) {
        this.image = image;
        this.centre_x = centre_x;
        this.centre_y = centre_y;
    };

    Costume.async_create = function(url, centre_x, centre_y) {
        return (Sk.pytch.async_load_image(url)
                .then(img => new Costume(img, centre_x, centre_y)));
    };

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Sounds: An Audio object and the URL that was used to build it.
    //
    const Sound = function(snd, src){
	this.sound = snd;
	this.url = src;
    }

    Sound.async_create = function(url){
	return (Sk.pytch.async_load_sound(url)
		.then(snd => new Sound(snd, url)));
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    //
    // PytchObject: Abstract base class for Pytch-related objects (Sprites and the Stage).
    // Holds a reference to the Python-level class and a list of its live instances
    // There is always at least one live instance; for Sprites others
    // can be created as a result of clone() operations.
    // 
    const PytchObject = function(py_cls, py_instance_0) {
	this.py_cls = py_cls;
	this.py_instances = [py_instance_0];
    };

    ////////////////////////////////////////////////////////////////////////////////
    //
    // PytchSprite: A Sprite within the Project.  It holds (a
    // reference to) the Python-level class (which is normally derived
    // from pytch.sprite.Sprite), together with a list of its live
    // instances.  There is always at least one live instance; others
    // can be created as a result of clone() operations.
    //
    const PytchSprite = function(py_cls, py_instance_0, costume_from_name) {
	PytchObject.call(this, py_cls, py_instance_0);
        this.on_clone_handlers = [];
        this.costume_from_name = costume_from_name;
    };

    PytchSprite.prototype = Object.create(PytchObject.prototype);

    PytchSprite.async_create = function(py_cls) {
        var load_costumes = PytchSprite.async_load_costumes(py_cls);

        return load_costumes.then(costume_from_name =>
            new PytchSprite(py_cls,
                            Sk.misceval.callsim(py_cls),
                            costume_from_name));
    };

    PytchSprite.s_Costumes = Sk.builtin.str("Costumes");

    PytchSprite.s_shown = Sk.builtin.str("_shown");
    PytchSprite.s_x = Sk.builtin.str("_x");
    PytchSprite.s_y = Sk.builtin.str("_y");
    PytchSprite.s_size = Sk.builtin.str("_size");
    PytchSprite.s_costume = Sk.builtin.str("_costume");

    PytchSprite.async_load_costumes = function(py_cls) {
        var py_Costumes = Sk.builtin.getattr(py_cls, PytchSprite.s_Costumes);
        var js_Costumes = Sk.ffi.remapToJs(py_Costumes);

        var costume_from_name = {};

        var populate_costume_map
            = Object.entries(js_Costumes).map(kv => {
                var costume_name = kv[0],
                    costume_descr = kv[1];

                return (Costume.async_create(costume_descr[0],
                                             costume_descr[1],
                                             costume_descr[2])
                        .then(costume =>
                              { costume_from_name[costume_name] = costume }));
            });

        return Promise.all(populate_costume_map).then(() => costume_from_name);
    };

    PytchSprite.prototype.rendering_instructions_1 = function(py_sprite) {
        var shown = js_getattr(py_sprite, PytchSprite.s_shown);
        if (! shown)
            return [];

        var x = js_getattr(py_sprite, PytchSprite.s_x);
        var y = js_getattr(py_sprite, PytchSprite.s_y);
        var size = js_getattr(py_sprite, PytchSprite.s_size);
        var costume_name = js_getattr(py_sprite, PytchSprite.s_costume);

        var costume = this.costume_from_name[costume_name];

        // The 'centre' of the costume image must end up at Stage coords (x, y).
        // The strange arithmetic here is because the centre-(x, y) coords of
        // the image are most naturally expressed in the normal image frame,
        // i.e., (0, 0) is at the top left, x increases rightwards, and y
        // increases downwards.  We must remap this into the Stage frame, where
        // y increases upwards.
        //
        return [new RenderImage(x - size * costume.centre_x,
                                y + size * costume.centre_y,
                                size,
                                costume.image,
                                costume_name)];
    };

    PytchSprite.prototype.rendering_instructions = function() {
        return map_concat(s => this.rendering_instructions_1(s),
                          this.py_instances);
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // EventHandler: A response to a particular event, for example a
    // green flag click, or the receipt of a broadcast message.  Holds
    // (a reference to) the PytchSprite which will respond to this
    // event, and the function (instancemethod) within the sprite's
    // class which will be called if the event happens.
    //
    const EventHandler = function(pytch_sprite, py_func) {
        this.pytch_sprite = pytch_sprite;
        this.py_func = py_func;
    };

    EventHandler.prototype.launch_threads = function() {
        var py_objs = this.pytch_sprite.py_instances;
        return py_objs.map(py_obj => new Thread(this.py_func, py_obj));
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Thread: One particular thread of execution.  Creating a new
    // Thread prepares to run the given Python callable with (just)
    // the given argument.
    //
    const Thread = function(py_callable, py_arg) {
        // Fake a skulpt-suspension-like object so we can treat it the
        // same as any other suspension in the scheduler.
        this.skulpt_susp = {
            resume: () => Sk.misceval.callsimOrSuspend(py_callable, py_arg)
        };
        this.state = Thread.State.RUNNING;
        this.sleeping_on = null;
    };

    Thread.State = {
        // RUNNING: The thread will be given a chance to run until
        // either completion or its next Pytch syscall.
        RUNNING: "running",

        // AWAITING_THREAD_GROUP_COMPLETION: The thread will not run
        // again until all the threads in the relevant thread-group
        // have run to completion.  A reference to the 'relevant
        // thread group' is stored in the Thread instance's
        // "sleeping_on" property.
        AWAITING_THREAD_GROUP_COMPLETION: "awaiting-thread-group-completion",

        // AWAITING_PASSAGE_OF_TIME: The thread will pause execution for the
        // number of frames stored in the "sleeping_on" property.
        AWAITING_PASSAGE_OF_TIME: "awaiting-passage-of-time",

        // ZOMBIE: The thread has terminated but has not yet been
        // cleared from the list of live threads.
        ZOMBIE: "zombie",
    };

    Thread.prototype.is_running = function()
    { return (this.state === Thread.State.RUNNING); }

    Thread.prototype.is_zombie = function()
    { return (this.state === Thread.State.ZOMBIE); }


    ////////////////////////////////////////////////////////////////////////////////
    //
    // ThreadGroup: A collection of threads, all of which started in
    // response to the same event, such as green-flag or a message
    // being broadcast.
    //
    const ThreadGroup = function(label, project, threads) {
        this.label = label;
        this.project = project;
        this.runnable_threads = threads;
    };

    ThreadGroup.prototype.is_all_finished = function() {
        return this.runnable_threads.length == 0;
    };

    ThreadGroup.prototype.one_frame = function() {
        var new_thread_groups = [];

        // Wake any threads meeting their condition-to-wake.
        this.runnable_threads.forEach(thread => {
            switch (thread.state) {
            case Thread.State.RUNNING:
                // Leave it run.
                break;
            case Thread.State.AWAITING_THREAD_GROUP_COMPLETION:
                if (thread.sleeping_on.is_all_finished()) {
                    thread.state = Thread.State.RUNNING;
                    thread.sleeping_on = null;
                }
                break;
            case Thread.State.AWAITING_PASSAGE_OF_TIME:
                thread.sleeping_on -= 1;
                if (thread.sleeping_on == 0) {
                    thread.state = Thread.State.RUNNING;
                    thread.sleeping_on = null;
                }
                break;
            default:
                throw new Error("unknown thread state \""
                                + thread.state + "\"");
            }
        });

        this.runnable_threads
            .filter(th => th.is_running())
            .forEach(thread => {
            var susp_or_retval = thread.skulpt_susp.resume();

            if ( ! susp_or_retval.$isSuspension)  {
                // Python-land code ran to completion; thread is done but
                // not yet dealt with.
                thread.state = Thread.State.ZOMBIE;
                thread.skulpt_susp = null;
            } else {
                // Python-land code invoked a syscall.

                var susp = susp_or_retval;
                if (susp.data.type !== "Pytch")
                    throw Error("cannot handle non-Pytch suspensions");

                switch (susp.data.subtype) {
                case "next-frame":
                    // The thread remains RUNNING; update suspension.
                    thread.skulpt_susp = susp;
                    break;
                case "sleep":
                    var js_n_seconds = susp.data.subtype_data;
                    var raw_n_frames = Math.ceil(js_n_seconds * FRAMES_PER_SECOND);
                    var n_frames = (raw_n_frames < 1 ? 1 : raw_n_frames);

                    // Thread blocks until that many frames have gone by; when
                    // it wakes it will resume with the new suspension.  A sleep
                    // for zero frames gets turned into a sleep for one frame.
                    // A sleep for one frame will resume on the next frame ---
                    // it's the number of frame-periods that execution pauses
                    // for, not the number of frame refreshes paused for.
                    thread.state = Thread.State.AWAITING_PASSAGE_OF_TIME;
                    thread.sleeping_on = n_frames;
                    thread.skulpt_susp = susp;
                    break;
                case "broadcast":
                    var js_msg = susp.data.subtype_data;
                    new_thread_groups.push(
                        (this
                         .project
                         .broadcast_handler_thread_group(js_msg)));

                    // Thread remains RUNNING; update suspension;
                    // leave response to run concurrently.
                    thread.skulpt_susp = susp;
                    break;
                case "broadcast-and-wait":
                    var js_msg = susp.data.subtype_data;
                    var response_thread_group
                        = (this
                           .project
                           .broadcast_handler_thread_group(js_msg));

                    new_thread_groups.push(response_thread_group);

                    // Thread blocks until that thread-group is done; when it
                    // wakes it will resume with the new suspension.
                    thread.state = Thread.State.AWAITING_THREAD_GROUP_COMPLETION;
                    thread.sleeping_on = response_thread_group;
                    thread.skulpt_susp = susp;
                    break;
                case "register-instance":
                    var py_instance = susp.data.subtype_data;
                    var py_cls = Sk.builtin.getattr(py_instance, s_dunder_class);
                    var sprite = this.project.pytch_sprite_from_py_cls(py_cls);

                    sprite.py_instances.push(py_instance);

                    var threads = sprite.on_clone_handlers.map(
                        py_fun => new Thread(py_fun, py_instance));

                    // Give each one a chance to run once; we want the on-clone
                    // stuff to definitely happen first.  Implementation is a
                    // bit of a fudge; any better way?  Two different Thread
                    // ctors?  create_ready() and create_and_schedule_once()?
                    //
                    threads.forEach(th => {
                        // Building on top of earlier fudge, 'resume' here
                        // runs the Python callable on the Python object.
                        var susp_or_retval = th.skulpt_susp.resume();
                        th.skulpt_susp.resume = (() => susp_or_retval);
                    });

                    var py_cls_name = js_getattr(py_cls, s_dunder_name);
                    var response_thread_group
                        = new ThreadGroup("new-" + py_cls_name + "-instance",
                                          this.project,
                                          threads);

                    new_thread_groups.push(response_thread_group);

                    // Thread remains running with new suspension.
                    thread.skulpt_susp = susp;
                    break;
                default:
                    throw Error("unknown Pytch suspension subtype "
                                + susp.data.subtype);
                }
            }
        });

        // Reap zombies.
        this.runnable_threads
            = this.runnable_threads.filter(th => ( ! th.is_zombie()));

        // TODO: Return new list of live ThreadGroups; this can
        // include 'this' if at least one thread suspended; it also
        // includes other thread-groups launched as a result of
        // threads in this group doing, e.g., bcast/wait.

        if ( ! this.is_all_finished())
            new_thread_groups.push(this);

        return new_thread_groups;
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // JavaScript-level "Project" class

    const Project = function() {
        this.sprites = [];
        this.handlers = {
            green_flag: [],
            keypress: {},
            message: {},
        };
        this.thread_groups = [];
    };

    Project.prototype.sprite_by_class_name = function(cls_name) {
        var sprites_having_name
            = this.sprites.filter(s => name_of_py_class(s.py_cls) == cls_name);

        if (sprites_having_name.length > 1)
            throw Error("duplicate PytchSprite instances"
                        + " with name \"" + cls_name + "\"");

        if (sprites_having_name.length === 0)
            throw Error("no PytchSprite instances"
                        + " with name \"" + cls_name + "\"");

        return sprites_having_name[0];
    };

    Project.s_im_func = Sk.builtin.str("im_func");
    Project.s_handler_attr = Sk.builtin.str("_pytch_handler_for");

    Project.hasattr = function(obj, attr) {
        var py_result = Sk.builtin.hasattr(obj, attr);
        return (py_result === Sk.builtin.bool.true$);
    };

    Project.prototype.register_handlers_of_sprite = function(pytch_sprite,
                                                             py_cls) {
        var js_dir = Sk.ffi.remapToJs(Sk.builtin.dir(py_cls));
        js_dir.forEach(x => {
            var attr_val = Sk.builtin.getattr(py_cls,
                                              Sk.builtin.str(x));

            if (Project.hasattr(attr_val, Project.s_im_func)) {
                var im_func = Sk.builtin.getattr(attr_val, Project.s_im_func);
                if (Project.hasattr(im_func, Project.s_handler_attr)) {
                    var handler_annotation
                        = Sk.builtin.getattr(im_func, Project.s_handler_attr);

                    var js_annotation
                        = Sk.ffi.remapToJs(handler_annotation);

                    this.register_handler(js_annotation[0],
                                          js_annotation[1],
                                          pytch_sprite,
                                          im_func);
                }
            }
        });
    };

    Project.prototype.async_register_sprite_class = function(py_sprite_cls) {
        var create_sprite = PytchSprite.async_create(py_sprite_cls);

        return create_sprite.then(pytch_sprite => {
            this.sprites.push(pytch_sprite);
            this.register_handlers_of_sprite(pytch_sprite, py_sprite_cls)

            return "registered";
        });
    };

    Project.prototype.register_handler = function(event_type, event_data,
                                                  pytch_sprite,
                                                  handler_py_func) {
        var handler = new EventHandler(pytch_sprite, handler_py_func);

        switch (event_type) {
        case "green-flag":
            this.handlers.green_flag.push(handler);
            break;
        case "keypress":
            if ( ! this.handlers.keypress.hasOwnProperty(event_data))
                this.handlers.keypress[event_data] = [];
            this.handlers.keypress[event_data].push(handler);
            break;
        case "message":
            if ( ! this.handlers.message.hasOwnProperty(event_data))
                this.handlers.message[event_data] = [];
            this.handlers.message[event_data].push(handler);
            break;
        case "clone":
            pytch_sprite.on_clone_handlers.push(handler_py_func);
            break;
        default:
            throw Error("unknown event-type \"" + event_type + "\"");
        };
    };

    Project.prototype.launch_keypress_handlers = function() {
        var new_keydowns = Sk.pytch.keyboard.drain_new_keydown_events();
        new_keydowns.forEach(keyname => {
            this.thread_groups.push(
                this.thread_group_from_handlers(
                    "keypress '" + keyname + "'",
                    this.handlers_for_keypress(keyname)))
        });
    };

    Project.prototype.one_frame = function() {
        this.launch_keypress_handlers();

        var new_thread_groups = [];

        this.thread_groups.forEach(existing_tg => {
            existing_tg.one_frame().forEach(new_tg => {
                new_thread_groups.push(new_tg);
            });
        });

        // TODO: How to handle implicit join()s on thread groups?
        // Previous incarnation had completion function but maybe
        // that's overcomplicated.  Do we ever have a completion
        // function which does anything other than re-enable the
        // launching thread?
        this.thread_groups = new_thread_groups;
    };

    Project.prototype.thread_group_from_handlers = function(label, handlers) {
        var threads = [];
        handlers.forEach(handler => {
            handler.launch_threads().forEach(th => threads.push(th));
        });
        return new ThreadGroup(label, this, threads);
    };

    Project.prototype.on_green_flag_clicked = function() {
        var handlers = this.handlers.green_flag;
        var thread_group = this.thread_group_from_handlers("green-flag", handlers);
        this.thread_groups.push(thread_group);
    };

    // Red Stop handling: All threads stop running; all clones get
    // deleted; in due course all sounds will stop.
    //
    Project.prototype.on_red_stop_clicked = function() {
        this.thread_groups = [];
        this.sprites.forEach(sprite => sprite.py_instances.splice(1));
    };

    Project.prototype.handlers_for_message = function(js_message) {
        return this.handlers.message[js_message] || [];
    };

    Project.prototype.handlers_for_keypress = function(keyname) {
        return this.handlers.keypress[keyname] || [];
    };

    Project.prototype.broadcast_handler_thread_group = function(js_message) {
        var handlers = this.handlers_for_message(js_message);
        return this.thread_group_from_handlers("message '" + js_message + "'",
                                               handlers);
    };

    Project.prototype.rendering_instructions = function() {
        return map_concat(s => s.rendering_instructions(), this.sprites);
    };

    Project.prototype.pytch_sprite_from_py_cls = function(target_py_cls) {
        var candidates = this.sprites.filter(s => (s.py_cls === target_py_cls));

        var n_found = candidates.length;
        if (n_found == 0)
            throw new Error("could not find sprite class \""
                            + js_getattr(target_py_cls, s_dunder_name)
                            + "\" in project");
        if (n_found > 1)
            throw new Error("found " + n_found + " sprite classes when"
                            + " looking for class with name \""
                            + js_getattr(target_py_cls, s_dunder_name)
                            + "\" in project");

        return candidates[0];
    };

    ////////////////////////////////////////////////////////////////
    //
    // Collision detection.

    Project.prototype.bounding_box_of_sprite_instance = function(py_sprite) {
        // TODO: Move constants out of PytchSprite?
        var x = js_getattr(py_sprite, PytchSprite.s_x);
        var y = js_getattr(py_sprite, PytchSprite.s_y);
        var size = js_getattr(py_sprite, PytchSprite.s_size);
        var costume_name = js_getattr(py_sprite, PytchSprite.s_costume);

        // Is this too tangled?  Maybe it's OK.
        var py_cls = Sk.builtin.getattr(py_sprite, s_dunder_class);
        var cls_name = js_getattr(py_cls, s_dunder_name);
        var pytch_sprite = this.sprite_by_class_name(cls_name);

        var costume = pytch_sprite.costume_from_name[costume_name];

        // Annoying combination of addition and subtraction to account for the
        // different coordinate systems of costume-centre vs stage.
        var min_x = x - size * costume.centre_x;
        var max_y = y + size * costume.centre_y;
        var max_x = min_x + size * costume.image.width;
        var min_y = max_y - size * costume.image.height;

        return [min_x, max_x, min_y, max_y];
    };

    Project.prototype.do_sprite_instances_touch = function(py_sprite_0,
                                                           py_sprite_1) {
        const both_shown = (js_getattr(py_sprite_0, PytchSprite.s_shown)
                            && js_getattr(py_sprite_1, PytchSprite.s_shown));

        if (! both_shown)
            return false;

        var bbox_0 = this.bounding_box_of_sprite_instance(py_sprite_0);
        var bbox_1 = this.bounding_box_of_sprite_instance(py_sprite_1);

        return (bbox_0[0] < bbox_1[1] && bbox_1[0] < bbox_0[1]
                && bbox_0[2] < bbox_1[3] && bbox_1[2] < bbox_0[3]);
    };

    Project.prototype.is_instance_touching_any_of = function(py_sprite_instance,
                                                             py_sprite_class) {
        var sprite = this.pytch_sprite_from_py_cls(py_sprite_class);
        return sprite.py_instances.some(
            other_py_sprite_instance =>
                this.do_sprite_instances_touch(py_sprite_instance,
                                               other_py_sprite_instance));
    };

    // TODO: Not sure this is a good idea but let's see.
    Project.prototype.do_synthetic_broadcast = function(js_msg) {
        var new_thread_group = this.broadcast_handler_thread_group(js_msg);
        this.thread_groups.push(new_thread_group);
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Python-level "Project" class

    const project_cls = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func((self) => {
            self.js_project = new Project();
        });

        $loc.register_sprite_class = new Sk.builtin.func((self, sprite_cls) => {
            Sk.builtin.setattr(sprite_cls, s_pytch_containing_project, self);
            return Sk.misceval.promiseToSuspension(
                self.js_project.async_register_sprite_class(sprite_cls));
        });

        $loc.go_live = new Sk.builtin.func((self) => {
            Sk.pytch.current_live_project = self;
            return Sk.builtin.none.none$;
        });

        $loc.is_instance_touching_any_of = new Sk.builtin.func(
            (self, instance, target_cls) => {
                return (self.js_project.is_instance_touching_any_of(instance,
                                                                    target_cls)
                        ? Sk.builtin.bool.true$
                        : Sk.builtin.bool.false$);
            });

        // TODO: Could make this user-level functionality, like
        //
        //     c = pytch.the_original(Cat)
        //
        // and maybe also
        //
        //    cs = pytch.all_clones_of(Cat)
        //
        $loc.instance_0_of_class = new Sk.builtin.func(
            (self, py_cls) => {
                var cls_name = js_getattr(py_cls, s_dunder_name);
                var pytch_sprite = self.js_project.sprite_by_class_name(cls_name);
                return pytch_sprite.py_instances[0];
            });

        $loc.unregister_instance = new Sk.builtin.func(
            (self, py_sprite_instance) => {
                var py_cls = Sk.builtin.getattr(py_sprite_instance, s_dunder_class);
                var cls_name = js_getattr(py_cls, s_dunder_name);
                var pytch_sprite = self.js_project.sprite_by_class_name(cls_name);
                var sprite_instances = pytch_sprite.py_instances;
                var instance_idx = sprite_instances.indexOf(py_sprite_instance);

                // Only allow de-registration of actual clones.  This test fails
                // for two kinds of result from the indexOf() call:
                //
                // If instance_idx == 0, then we have found this instance but it is
                // the 'original' instance of this sprite-class.  So it can't be
                // deleted; it's not a true clone.
                //
                // If instance_idx == -1, then we could not find this instance at
                // all.  This seems like an error, but can happen (under the current
                // design) if two threads both try to unregister the same sprite in
                // the same scheduler-time-slice.
                //
                if (instance_idx > 0)
                    sprite_instances.splice(instance_idx, 1);

                return Sk.builtin.none.none$;
            });
    };

    mod.Project = Sk.misceval.buildClass(mod, project_cls, "Project", []);

    return mod;
};

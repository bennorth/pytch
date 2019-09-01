var $builtinmodule = function (name) {
    var mod = {};

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Conversion etc. utilities

    const s_dunder_name = Sk.ffi.remapToPy("__name__");

    const name_of_py_class = function(py_cls)
    { return Sk.ffi.remapToJs(Sk.builtin.getattr(py_cls, s_dunder_name)); };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // PytchSprite: A Sprite within the Project.  It holds (a
    // reference to) the Python-level class (which is normally derived
    // from pytch.sprite.Sprite), together with a list of its live
    // instances.  There is always at least one live instance; others
    // can be created as a result of clone() operations.
    //
    const PytchSprite = function(py_cls) {
        this.py_cls = py_cls;
        this.py_instances = [Sk.misceval.callsim(py_cls)];
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
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // ThreadGroup: A collection of threads, all of which started in
    // response to the same event, such as green-flag or a message
    // being broadcast.
    //
    const ThreadGroup = function(threads) {
        this.runnable_threads = threads;
    };

    ThreadGroup.prototype.is_all_finished = function() {
        return this.runnable_threads.length == 0;
    };

    ThreadGroup.prototype.one_frame = function() {
        this.runnable_threads.forEach(thread => {
            var susp_or_retval = thread.skulpt_susp.resume();

            if (susp_or_retval.$isSuspension) {
                var susp = susp_or_retval;
                if (susp.data.type !== "Pytch")
                    throw Error("cannot handle non-Pytch suspensions");

                switch (susp.data.subtype) {
                case "next-frame":
                    // TODO
                    break;
                default:
                    throw Error("unknown Pytch suspension subtype "
                                + susp.data.subtype);
                }
            }
        });

        // TODO: Return new list of live ThreadGroups; this can
        // include 'this' if at least one thread suspended; it also
        // includes other thread-groups launched as a result of
        // threads in this group doing, e.g., bcast/wait.
        return [];
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // JavaScript-level "Project" class

    const Project = function() {
        this.sprites = [];
        this.handlers = {
            green_flag: [],
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

    Project.prototype.register_sprite_class = function(py_sprite_cls) {
        this.sprites.push(new PytchSprite(py_sprite_cls));
    };

    Project.prototype.register_handler = function(event_type, event_data,
                                                  handler_py_sprite_cls,
                                                  handler_py_func) {
        var handler_cls_name = name_of_py_class(handler_py_sprite_cls);
        var sprite = this.sprite_by_class_name(handler_cls_name);
        var handler = new EventHandler(sprite, handler_py_func);

        switch (event_type) {
        case "green-flag":
            this.handlers.green_flag.push(handler);
            break;
        default:
            throw Error("unknown event-type \"" + event_type + "\"");
        };
    };

    Project.prototype.one_frame = function() {
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

    Project.prototype.on_green_flag_clicked = function() {
        var threads = [];
        this.handlers.green_flag.forEach(event_handler => {
            event_handler.launch_threads().forEach(th => threads.push(th));
        });
        this.thread_groups.push(new ThreadGroup(threads));
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Python-level "Project" class

    const project_cls = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func((self) => {
            self.js_project = new Project();
        });

        const s_im_func = Sk.builtin.str("im_func");
        const s_handler_attr = Sk.builtin.str("_pytch_handler_for");

        const hasattr = function(obj, attr) {
            var py_result = Sk.builtin.hasattr(obj, attr);
            return (py_result === Sk.builtin.bool.true$);
        };

        $loc.register_sprite_class = new Sk.builtin.func(
            (self, sprite_cls) => {
                self.js_project.register_sprite_class(sprite_cls);

                var js_dir = Sk.ffi.remapToJs(Sk.builtin.dir(sprite_cls));
                js_dir.forEach(x => {
                    var attr_val = Sk.builtin.getattr(sprite_cls,
                                                      Sk.builtin.str(x));

                    if (hasattr(attr_val, s_im_func)) {
                        var im_func = Sk.builtin.getattr(attr_val, s_im_func);
                        if (hasattr(im_func, s_handler_attr)) {
                            var handler_annotation
                                = Sk.builtin.getattr(im_func, s_handler_attr);

                            var js_annotation
                                = Sk.ffi.remapToJs(handler_annotation);

                            self.js_project.register_handler(js_annotation[0],
                                                             js_annotation[1],
                                                             sprite_cls,
                                                             im_func);
                        }
                    }
                });
            });

        $loc.go_live = new Sk.builtin.func((self) => {
            Sk.pytch_current_live_project = self.js_project;

            var forever_unresolved = new Promise((resolve, reject) => {});
            return Sk.misceval.promiseToSuspension(forever_unresolved);
        });
    };

    mod.Project = Sk.misceval.buildClass(mod, project_cls, "Project", []);

    return mod;
};

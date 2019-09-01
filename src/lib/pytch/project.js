var $builtinmodule = function (name) {
    var mod = {};

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Conversion etc. utilities

    const s_dunder_name = Sk.ffi.remapToPy("__name__");

    const name_of_py_class = function(py_cls)
    { return Sk.ffi.remapToJs(Sk.builtin.getattr(py_cls, s_dunder_name)); };


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

    // JavaScript-level "Project" class

    const Project = function() {
        this.sprites = [];
        this.handlers = {
            green_flag: [],
        };
    };

    Project.prototype.register_sprite_class = function(py_sprite_cls) {
        this.sprites.push(new PytchSprite(py_sprite_cls));
    };

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

        $loc.go_live = new Sk.builtin.func((self) => {
            Sk.pytch_current_live_project = self.js_project;

            var forever_unresolved = new Promise((resolve, reject) => {});
            return Sk.misceval.promiseToSuspension(forever_unresolved);
        });
    };

    mod.Project = Sk.misceval.buildClass(mod, project_cls, "Project", []);

    return mod;
};

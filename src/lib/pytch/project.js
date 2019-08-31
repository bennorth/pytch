var $builtinmodule = function (name) {
    var mod = {};

    // JavaScript-level "Project" class

    const Project = function() {
    };

    // Python-level "Project" class

    const project_cls = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func((self) => {
            self.js_project = new Project();
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

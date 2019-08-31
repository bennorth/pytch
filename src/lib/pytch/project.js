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
    };

    mod.Project = Sk.misceval.buildClass(mod, project_cls, "Project", []);

    return mod;
};

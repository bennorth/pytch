"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.project'

describe("pytch.project module", function() {
    it("can be imported", function() {
        var import_result = import_from_local_file("py/project/just_import.py");
        assert.ok(import_result.$d.pytch_project);
    });

    it("can create a Project", () => {
        var import_result = import_from_local_file("py/project/create_Project.py");
        assert.ok(import_result.$d.project);
    });

    it("can go-live an empty Project", () => {
        var import_result = import_from_local_file("py/project/launch_empty_Project.py");
        assert.ok(import_result.$isSuspension);
    });

    it("can register a Sprite class", () => {
        var import_result = import_from_local_file("py/project/single_sprite.py");
        var project = import_result.$d.project.js_project;
        assert.equal(project.handlers.green_flag.length, 1);
        assert.strictEqual(project.handlers.green_flag[0].pytch_sprite.py_cls,
                           import_result.$d.FlagClickCounter)
        assert.strictEqual(project.handlers.green_flag[0].py_func,
                           import_result.$d.FlagClickCounter.count_the_click)
    });
});

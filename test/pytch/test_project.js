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

    it("Sprite responds to green-flag", () => {
        var import_result = import_from_local_file("py/project/single_sprite.py");
        var project = import_result.$d.project.js_project;
        var flag_click_counter = (project
                                  .sprite_by_class_name("FlagClickCounter")
                                  .py_instances[0]);

        assert.strictEqual(js_getattr(flag_click_counter, "n_clicks"), 0);

        project.on_green_flag_clicked();
        project.one_frame();

        assert.strictEqual(js_getattr(flag_click_counter, "n_clicks"), 1);

        project.one_frame();

        assert.strictEqual(js_getattr(flag_click_counter, "n_clicks"), 2);
    });

    it("can register a when-I-receive", () => {
        var import_result = import_from_local_file("py/project/broadcast.py");
        var project = import_result.$d.project.js_project;
        var msg_handler = project.handlers.message["something-happened"][0];
        assert.strictEqual(msg_handler.pytch_sprite.py_cls,
                           import_result.$d.Receiver)
        assert.strictEqual(msg_handler.py_func,
                           import_result.$d.Receiver.note_event)
    });

    it("broadcast syscall works", () => {
        var import_result = import_from_local_file("py/project/broadcast.py");
        var project = import_result.$d.project.js_project;
        var receiver = (project
                        .sprite_by_class_name("Receiver")
                        .py_instances[0]);

        project.on_green_flag_clicked();
        project.one_frame();
    });
});

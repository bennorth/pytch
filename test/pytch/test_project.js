"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.project'

describe("pytch.project module", () => {
    it("can be imported", () => {
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
        var do_import = Sk.misceval.asyncToPromise(
            () => import_from_local_file("py/project/single_sprite.py"));
        do_import.then(import_result => {
        var project = import_result.$d.project.js_project;
        assert.equal(project.handlers.green_flag.length, 1);
        assert.strictEqual(project.handlers.green_flag[0].pytch_sprite.py_cls,
                           import_result.$d.FlagClickCounter)
        assert.strictEqual(project.handlers.green_flag[0].py_func,
                           import_result.$d.FlagClickCounter.count_the_click)
        });
    });

    it("Sprite responds to green-flag", () => {
        var do_import = Sk.misceval.asyncToPromise(
            () => import_from_local_file("py/project/single_sprite.py"));
        do_import.then(import_result => {
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
    });

    it("can register a when-I-receive", () => {
        var do_import = Sk.misceval.asyncToPromise(
            () => import_from_local_file("py/project/broadcast.py"));
        do_import.then(import_result => {
        var project = import_result.$d.project.js_project;
        var msg_handler = project.handlers.message["something-happened"][0];
        assert.strictEqual(msg_handler.pytch_sprite.py_cls,
                           import_result.$d.Receiver)
        assert.strictEqual(msg_handler.py_func,
                           import_result.$d.Receiver.note_event)
        });
    });

    it("broadcast syscall works", () => {
        var do_import = Sk.misceval.asyncToPromise(
            () => import_from_local_file("py/project/broadcast.py"));
        do_import.then(import_result => {
        var project = import_result.$d.project.js_project;
        var receiver = (project
                        .sprite_by_class_name("Receiver")
                        .py_instances[0]);
        var sender = (project
                      .sprite_by_class_name("Sender")
                      .py_instances[0]);

        assert.strictEqual(js_getattr(sender, "n_events"), 0);
        assert.strictEqual(js_getattr(receiver, "n_events"), 0);

        // Clicking green flag only launches the threads and puts them
        // in the runnable queue.  Nothing has actually run yet.
        //
        project.on_green_flag_clicked();
        assert.strictEqual(js_getattr(sender, "n_events"), 0);
        assert.strictEqual(js_getattr(receiver, "n_events"), 0);

        // First pass through scheduler causes an event in the sender,
        // but only broadcasts the message and places a newly-created
        // thread on the receiver in the run queue.  The receiver
        // thread has not yet run.
        //
        project.one_frame();
        assert.strictEqual(js_getattr(sender, "n_events"), 1);
        assert.strictEqual(js_getattr(receiver, "n_events"), 0);

        // Next pass through does give the receiver thread a go.  The
        // sender continues to run.
        //
        project.one_frame();
        assert.strictEqual(js_getattr(sender, "n_events"), 2);
        assert.strictEqual(js_getattr(receiver, "n_events"), 1);
        });
    });

    it("broadcast-and-wait syscall works", () => {
        var do_import = Sk.misceval.asyncToPromise(
            () => import_from_local_file("py/project/broadcast_and_wait.py"));
        do_import.then(import_result => {
        var project = import_result.$d.project.js_project;
        var receiver = (project
                        .sprite_by_class_name("Receiver")
                        .py_instances[0]);
        var sender = (project
                      .sprite_by_class_name("Sender")
                      .py_instances[0]);

        const assert_n_events = function(exp_n_send, exp_n_recv) {
            assert.strictEqual(js_getattr(sender, "n_events"), exp_n_send);
            assert.strictEqual(js_getattr(receiver, "n_events"), exp_n_recv);
        }

        // Before we start, nothing should have happened.
        assert_n_events(0, 0);

        // Clicking green flag only launches the threads and puts them
        // in the runnable queue.  Nothing has actually run yet.
        //
        project.on_green_flag_clicked();
        assert_n_events(0, 0);

        // First pass through scheduler causes an event in the sender,
        // but only broadcasts the message and places a newly-created
        // thread on the receiver in the run queue.  The receiver
        // thread has not yet run.
        //
        project.one_frame();
        assert_n_events(1, 0);

        // Next pass through does give the receiver thread a go.  It
        // bumps its n-events counter then yields until next frame.
        // The sender is waiting for all receivers to finish, so does
        // not make any progress.
        //
        project.one_frame();
        assert_n_events(1, 1);

        // The receiver resumes, increments its n-events counter, and
        // finishes.  The sender is part of the first-launched
        // thread-group, so runs next, notices the sleeping-on thread
        // group has finished, and resumes.  It counts another event
        // and runs to completion.
        //
        project.one_frame();
        assert_n_events(2, 2);

        // Everything should have now finished.
        assert.strictEqual(project.thread_groups.length, 0);
        });
    });
});

"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.project'

describe("pytch.project module", () => {
    it("can be imported", () => {
        import_local_file("py/project/just_import.py").then(import_result => {
        assert.ok(import_result.$d.pytch_project);
        });
    });

    it("can create a Project", () => {
        import_local_file("py/project/create_Project.py").then(import_result => {
        assert.ok(import_result.$d.project);
        });
    });

    it("can go-live an empty Project", () => {
        import_local_file("py/project/launch_empty_Project.py").then(import_result => {
        assert.ok(import_result.$isSuspension);
        });
    });

    it("can register a Sprite class", () => {
        import_local_file("py/project/single_sprite.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            assert.equal(project.handlers.green_flag.length, 1);
            assert.strictEqual(project.handlers.green_flag[0].pytch_sprite.py_cls,
                               import_result.$d.FlagClickCounter)
            assert.strictEqual(project.handlers.green_flag[0].py_func,
                               import_result.$d.FlagClickCounter.count_the_click)
        });
    });

    it("can register a sprite's Costumes", () => {
        import_local_file("py/project/sprite_with_costumes.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            assert.strictEqual(project.sprites.length, 1);
            var balloon = project.sprites[0];
            assert.strictEqual(Object.keys(balloon.costume_from_name).length, 2);
            assert_Costume_equal(balloon.costume_from_name['red-balloon'],
                                 "red-balloon.png", 20, 60,
                                 10,
                                 20);
            assert_Costume_equal(balloon.costume_from_name['blue-balloon'],
                                 "blue-balloon.png", 25, 65,
                                 15,
                                 25);
        });
    });

    it("Sprite responds to green-flag", () => {
        import_local_file("py/project/single_sprite.py").then(import_result => {
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
        import_local_file("py/project/broadcast.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            var msg_handler = project.handlers.message["something-happened"][0];
            assert.strictEqual(msg_handler.pytch_sprite.py_cls,
                               import_result.$d.Receiver)
            assert.strictEqual(msg_handler.py_func,
                               import_result.$d.Receiver.note_event)
        });
    });

    it("broadcast syscall works", () => {
        import_local_file("py/project/broadcast.py").then(import_result => {
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
        import_local_file("py/project/broadcast_and_wait.py").then(import_result => {
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

    it("can run the moving-ball example (green flag)", () => {
        import_local_file("py/project/moving_ball.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            assert.equal(project.sprites.length, 1);

            // Ball should go to (100, 50) but its costume has center
            // (8, 8) so, given different y sense of Stage and image,
            // it's rendered at (92, 58).
            //
            assert_renders_as("start",
                              project,
                              [["RenderImage", 92, 58, 1, "yellow-ball"]]);

            // Set things going.
            //
            project.on_green_flag_clicked();

            // On the next rendered frame, it should have moved right
            // by 50.
            //
            project.one_frame();
            assert_renders_as("green-flag",
                              project,
                              [["RenderImage", 142, 58, 1, "yellow-ball"]]);

            // For 30 frames (the half-second sleep), it should not
            // move.  We have already done one of those 30, so for the
            // next 29 frames it should not move.
            //
            for (var i = 0; i < 29; ++i) {
                project.one_frame();
                assert_renders_as("frame-" + i,
                                  project,
                                  [["RenderImage", 142, 58, 1, "yellow-ball"]]);
            }

            // And now it should move another 60.
            //
            project.one_frame();
            assert_renders_as("frame-29",
                              project,
                              [["RenderImage", 202, 58, 1, "yellow-ball"]]);

            // Everything should have finished.
            assert.strictEqual(project.thread_groups.length, 0);
        });
    });

    it("can run the moving-ball example (key presses)", () => {
        import_local_file("py/project/moving_ball.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            assert.equal(project.sprites.length, 1);

            const ball_at = (x, y) => [["RenderImage", x, y, 1, "yellow-ball"]];
            assert_renders_as("start", project, ball_at(92, 58));

            mock_keyboard.press_key('w')
            project.one_frame()
            assert_renders_as("frame-1", project, ball_at(92, 68));

            // Key 'w' is still down, but it is not freshly pressed, so
            // nothing should change.
            project.one_frame()
            assert_renders_as("frame-2", project, ball_at(92, 68));

            // If someone is quick enough to type more than one key, they all
            // take effect.
            mock_keyboard.press_key('w')
            mock_keyboard.press_key('w')
            mock_keyboard.press_key('s')
            project.one_frame()
            assert_renders_as("frame-1", project, ball_at(92, 68 + 10 + 10 - 100));
        });
    });

    describe("collision detection", () => {
        it("can extract bounding boxes", () => {
            import_local_file("py/project/bounding_boxes.py").then(import_result => {
                var project = import_result.$d.project.js_project;
                assert.equal(project.sprites.length, 2);

                // Square's centre-x should be at -50; its costume is 80 wide
                // and has a centre of 20.  So 20 sticks out to the left of
                // centre and 60 to the right; so x-extent should be -70 up to
                // 10.  Its centre-y should be at -90; costume is 80 high with
                // 30 above the centre and 50 below; so y-extent should be -140
                // up to -60.
                var square = project.sprite_by_class_name("Square");
                assert_has_bbox_of("Square", project,
                                   square.py_instances[0], -70, 10, -140, -60);

                // Likewise for Rectangle:
                var rectangle = project.sprite_by_class_name("Rectangle");
                assert_has_bbox_of("Rectangle", project,
                                   rectangle.py_instances[0], -40, 20, -110, -80);
            });
        });

        it("can detect two touching sprites depending on their visibility", () => {
            import_local_file("py/project/bounding_boxes.py").then(import_result => {
                var project = import_result.$d.project.js_project;

                var square_sprite = project.sprite_by_class_name("Square");
                var rectangle_sprite = project.sprite_by_class_name("Rectangle");

                var square_sprite_instance = square_sprite.py_instances[0];
                var rectangle_sprite_instance = rectangle_sprite.py_instances[0];

                [false, true].forEach(show_square => {
                    call_method(square_sprite_instance,
                                "set_visibility", [show_square]);

                    [false, true].forEach(show_rectangle => {
                        call_method(rectangle_sprite_instance,
                                    "set_visibility", [show_rectangle]);

                        var got_touch = project.do_sprite_instances_touch(
                            square_sprite_instance, rectangle_sprite_instance);

                        var exp_touch = (show_square && show_rectangle);

                        assert.strictEqual(got_touch, exp_touch);
                    });
                });
            });
        });
    });
});

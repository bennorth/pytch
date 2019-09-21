"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.project'

describe("pytch.project module", () => {
    it("can be imported", () => {
        return import_local_file("py/project/just_import.py").then(import_result => {
            assert.ok(import_result.$d.pytch_project);
        });
    });

    it("can create a Project", () => {
        return import_local_file("py/project/create_Project.py").then(import_result => {
            assert.ok(import_result.$d.project);
        });
    });

    it("can go-live an empty Project", () => {
        return import_local_file("py/project/launch_empty_Project.py").then(import_result => {
            assert.strictEqual(import_result.$d.project, Sk.pytch.current_live_project);
        });
    });

    it("can register a Sprite class", () => {
        return import_local_file("py/project/single_sprite.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            assert.equal(project.handlers.green_flag.length, 1);
            assert.strictEqual(project.handlers.green_flag[0].pytch_sprite.py_cls,
                               import_result.$d.FlagClickCounter)
            assert.strictEqual(project.handlers.green_flag[0].py_func,
                               import_result.$d.FlagClickCounter.count_the_click)
        });
    });

    it("can register Sprite and Stage", () => {
        return import_local_file("py/project/sprite_on_stage.py").then(import_result => {
            var project = import_result.$d.project.js_project;

            // Even though we registered Table after Banana, Table should
            // end up in the first slot.
            var table = project.sprite_by_class_name("Table");
            assert.strictEqual(table, project.sprites[0]);

            // And Banana in the second.
            var banana = project.sprite_by_class_name("Banana");
            assert.strictEqual(banana, project.sprites[1]);

            // Their Costume and Backdrop should have been picked out OK.
            assert.strictEqual(banana.costume_from_name["yellow"].centre_x, 50);
            assert.strictEqual(table.costume_from_name["wooden"].centre_x, 240);
        });
    });

    it("can provide instance-0 of a registered class", () => {
        return import_local_file("py/project/single_sprite.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            var sprite = project.sprites[0];
            var instance_0 = import_result.$d.the_flag_click_counter;
            assert.strictEqual(instance_0, sprite.py_instances[0]);
        });
    });

    it("registered Sprites have containing-project slot populated correctly", () => {
        return import_local_file("py/project/single_sprite.py").then(import_result => {
            var flag_click_counter_cls = import_result.$d.FlagClickCounter;
            var got_containing_project
                = Sk.builtin.getattr(flag_click_counter_cls,
                                     Sk.builtin.str("_pytch_containing_project"));

            var exp_containing_project = import_result.$d.project;

            assert.strictEqual(got_containing_project, exp_containing_project);
        });
    });

    it("can register a sprite's Costumes", () => {
        return import_local_file("py/project/sprite_with_costumes.py").then(import_result => {
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
        return import_local_file("py/project/single_sprite.py").then(import_result => {
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
        return import_local_file("py/project/broadcast.py").then(import_result => {
            var project = import_result.$d.project.js_project;
            var msg_handler = project.handlers.message["something-happened"][0];
            assert.strictEqual(msg_handler.pytch_sprite.py_cls,
                               import_result.$d.Receiver)
            assert.strictEqual(msg_handler.py_func,
                               import_result.$d.Receiver.note_event)
        });
    });

    it("broadcast syscall works", () => {
        return import_local_file("py/project/broadcast.py").then(import_result => {
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
        return import_local_file("py/project/broadcast_and_wait.py").then(import_result => {
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
        return import_local_file("py/project/moving_ball.py").then(import_result => {
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
        return import_local_file("py/project/moving_ball.py").then(import_result => {
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

    describe("red stop handling", () => {
        const red_stop_specs = [
            {tag: "green flag", method_name: "on_green_flag_clicked"},
            {tag: "red stop", method_name: "on_red_stop_clicked"},
        ];
        red_stop_specs.forEach(spec =>
        it(spec.tag + " halts everything", () => {
            return import_local_file("py/project/red_stop.py").then(import_result => {
                var project = import_result.$d.project.js_project;

                const assert_n_brooms = (n => {
                    assert.equal(project.sprites.length, 1);
                    var all_brooms = project.sprites[0].py_instances;
                    assert.strictEqual(all_brooms.length, n);
                });

                const assert_all_brooms_at = (exp_x => {
                    var all_brooms = project.sprites[0].py_instances;
                    var all_xs = all_brooms.map(b => js_getattr(b, "_x"));
                    all_xs.sort((x, y) => (x - y));
                    assert.strictEqual(all_xs[0], exp_x);
                    assert.strictEqual(all_xs[all_xs.length - 1], exp_x);
                });

                assert_n_brooms(1);

                // Double the number of brooms; this takes effect on next frame.
                project.do_synthetic_broadcast("make-new-brooms");
                project.one_frame();
                assert_n_brooms(2);

                // Re-double the number of brooms; this takes effect on next
                // frame.
                project.do_synthetic_broadcast("make-new-brooms");
                project.one_frame();
                assert_n_brooms(4);

                // Set them all moving and check they click along 10 per frame.
                assert_all_brooms_at(0);
                project.do_synthetic_broadcast("move");
                project.one_frame();
                assert_all_brooms_at(10);
                project.one_frame();
                assert_all_brooms_at(20);

                // Stop!  All brooms but the original should vanish, and it
                // should stop moving.
                project[spec.method_name]();
                assert_n_brooms(1);
                project.one_frame();
                assert_all_brooms_at(20);
                project.one_frame();
                assert_all_brooms_at(20);
            });
        }));
    });

    describe("collision detection", () => {
        it("can extract bounding boxes", () => {
            return import_local_file("py/project/bounding_boxes.py").then(import_result => {
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
            return import_local_file("py/project/bounding_boxes.py").then(import_result => {
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

        // Hopefully this abstraction isn't worse than the duplication.  For a
        // test we need to know what method to call, and which args to pass out
        // of the candidate list of [square-class, square-instance,
        // rectangle-class, rectangle-instance].  Gather these into specs:
        //
        const touch_test_specs = [
            {tag: "two touching sprites",
             method_name: "do_sprite_instances_touch",
             get_arg0: (sc, si, rc, ri) => si,
             get_arg1: (sc, si, rc, ri) => ri},
            {tag: "Square touching any Rectangle",
             method_name: "is_instance_touching_any_of",
             get_arg0: (sc, si, rc, ri) => si,
             get_arg1: (sc, si, rc, ri) => rc},
            {tag: "Rectangle touching any Square",
             method_name: "is_instance_touching_any_of",
             get_arg0: (sc, si, rc, ri) => ri,
             get_arg1: (sc, si, rc, ri) => sc},
        ];

        touch_test_specs.forEach(spec =>
        it("can detect " + spec.tag + " depending on their locations", () => {
            return import_local_file("py/project/bounding_boxes.py").then(import_result => {
                var project = import_result.$d.project.js_project;

                var square_sprite = project.sprite_by_class_name("Square");
                var rectangle_sprite = project.sprite_by_class_name("Rectangle");

                var square_sprite_instance = square_sprite.py_instances[0];
                var rectangle_sprite_instance = rectangle_sprite.py_instances[0];

                var is_touching_fun = project[spec.method_name].bind(project);
                var arg0 = spec.get_arg0(square_sprite.py_cls, square_sprite_instance,
                                         rectangle_sprite.py_cls, rectangle_sprite_instance);
                var arg1 = spec.get_arg1(square_sprite.py_cls, square_sprite_instance,
                                         rectangle_sprite.py_cls, rectangle_sprite_instance);

                // Move the Square around and test for hits against stationary
                // Rectangle.  Keeping Square's y constant, it should touch the
                // Rectangle if x is (exclusively) between -100 and 40.
                //
                for (var sq_x = -120; sq_x < 60; sq_x += 1) {
                    call_method(square_sprite_instance, "set_x_pos", [sq_x]);

                    var got_touch = is_touching_fun(arg0, arg1);
                    var exp_touch = (sq_x > -100) && (sq_x < 40);

                    assert.strictEqual(got_touch, exp_touch,
                                       "for Square having x of " + sq_x);
                }

                // Keeping Square's x constant at a level where it touches
                // Rectangle, the Square should touch the Rectangle if the
                // Square's y is (exclusively) between -140 and -30.
                //
                call_method(square_sprite_instance, "set_x_pos", [0]);
                for (var sq_y = -160; sq_y < 10; sq_y += 1) {
                    call_method(square_sprite_instance, "set_y_pos", [sq_y]);

                    var got_touch = is_touching_fun(arg0, arg1);
                    var exp_touch = (sq_y > -140) && (sq_y < -30);

                    assert.strictEqual(got_touch, exp_touch,
                                       "for Square having y of " + sq_y);
                }
            });
        }));
    });

    describe("cloning", () => {
        it("can clone by instance", () => {
            return import_local_file("py/project/launch_clones.py").then(import_result => {
                var project = import_result.$d.project.js_project;
                var all_aliens = () => project.sprites[0].py_instances;

                // Do not want to make assumptions about which order instances
                // get cloned, so sort the returned list of values of
                // attributes.
                const assert_all_attrs = ((attrname, exp_values) => {
                    var values = all_aliens().map(a => js_getattr(a, attrname));
                    values.sort((x, y) => (x - y));
                    assert.deepStrictEqual(values, exp_values);
                });

                const assert_n_aliens = (n => {
                    assert.strictEqual(all_aliens().length, n);
                });

                // The synthetic broadcast just puts the handler threads in the
                // queue; they don't run immediately.
                project.do_synthetic_broadcast("clone-self");
                assert_n_aliens(1);

                // On the next frame the clones are created.
                project.one_frame();
                assert_n_aliens(2);

                // And they should have run through their when-I-start-as-a-clone
                // for one scheduling step.
                assert_all_attrs("copied_id", [42, 43]);
                assert_all_attrs("generated_id", [100, 101]);

                // If we trigger another clone, we should get another id-43 one,
                // and also an id-44 one.
                project.do_synthetic_broadcast("clone-self");
                assert_n_aliens(2);
                project.one_frame();
                assert_n_aliens(4);

                assert_all_attrs("copied_id", [42, 43, 43, 44]);
                assert_all_attrs("generated_id", [100, 101, 102, 103]);
            });
        });

        it("can chain-clone", () => {
            return import_local_file("py/project/launch_clones.py").then(import_result => {
                var project = import_result.$d.project.js_project;
                var all_brooms = () => project.sprite_by_class_name("Broom").py_instances;

                // Do not want to make assumptions about which order instances
                // get cloned, so sort the returned list of values of
                // attributes.
                const assert_all_IDs = (exp_values => {
                    var values = all_brooms().map(a => js_getattr(a, "copied_id"));
                    values.sort((x, y) => (x - y));
                    assert.deepStrictEqual(values, exp_values);
                });

                // The synthetic broadcast just puts the handler threads in the
                // queue; they don't run immediately.
                project.do_synthetic_broadcast("clone-self");
                assert_all_IDs([1])

                // On the next frame the first clone is created, and the next clone
                // operation is queued.
                project.one_frame();
                assert_all_IDs([1, 2])

                // Repeat until five instances
                project.one_frame();
                assert_all_IDs([1, 2, 3])
                project.one_frame();
                assert_all_IDs([1, 2, 3, 4])
                project.one_frame();
                assert_all_IDs([1, 2, 3, 4, 5])
            });
        })

        it("can delete clones", () => {
            return import_local_file("py/project/launch_clones.py").then(import_result => {
                var project = import_result.$d.project.js_project;
                var all_aliens = () => project.sprites[0].py_instances;

                // Do not want to make assumptions about which order instances
                // get cloned, so sort the returned list of values of
                // attributes.
                const assert_all_attrs = ((attrname, exp_values) => {
                    var values = all_aliens().map(a => js_getattr(a, attrname));
                    values.sort((x, y) => (x - y));
                    assert.deepStrictEqual(values, exp_values);
                });

                const assert_n_aliens = (n => {
                    assert.strictEqual(all_aliens().length, n);
                });

                // TODO: What does/should happen if we do multiple clones
                // between frames?
                project.do_synthetic_broadcast("clone-self");
                project.one_frame();
                project.do_synthetic_broadcast("clone-self");
                project.one_frame();
                assert_n_aliens(4);

                assert_all_attrs("copied_id", [42, 43, 43, 44]);
                project.do_synthetic_broadcast("delete-id-43")
                project.one_frame();
                assert_n_aliens(2);
                assert_all_attrs("copied_id", [42, 44]);
            });
        });
    });
});

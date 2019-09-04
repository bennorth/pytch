"use strict";


////////////////////////////////////////////////////////////////////////////////

const fs = require("fs");
const reqskulpt = require('../../support/run/require-skulpt').requireSkulpt;

before(() => {
    // Inject 'Sk' object into global namespace.
    reqskulpt(false);

    global.mock_keyboard = (() => {
        var undrained_keydown_events = [];
        var is_key_down = {};

        const press_key = (keyname) => {
            is_key_down[keyname] = true;
            undrained_keydown_events.push(keyname);
        };

        const release_key = (keyname) => {
            is_key_down[keyname] = false;
        };

        const drain_new_keydown_events = () => {
            var evts = undrained_keydown_events;
            undrained_keydown_events = [];
            return evts;
        };

        const is_key_pressed = (keyname => (is_key_down[keyname] || false));

        return {
            press_key: press_key,
            release_key: release_key,
            is_key_pressed: is_key_pressed,
            drain_new_keydown_events: drain_new_keydown_events,
        };
    })();

    // Images: For tests, what would normally be a URL for an image is instead a
    // three-element tuple of (tag, width, height).  We need something which has
    // 'width' and 'height' attributes for use with bounding-box and collision
    // tests.  The tag is for identification and diagnostics.
    //
    const MockImage = function(tag, width, height) {
        this.tag = tag;
        this.width = width;
        this.height = height;
    };

    const async_create_mock_image = (descriptor => {
        return Promise.resolve(new MockImage(descriptor[0],
                                             descriptor[1],
                                             descriptor[2]));
    });

    // Connect read/write to filesystem and stdout.
    Sk.configure({
        read: (fname) => { return fs.readFileSync(fname, "utf8"); },
        output: (args) => { process.stdout.write(args); },
        pytch: {
            async_load_image: async_create_mock_image,
            keyboard: global.mock_keyboard,
        },
    });


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Test helpers

    global.import_local_file = function(fname) {
        var code_text = fs.readFileSync(fname, { encoding: "utf8" });
        var do_import = Sk.importMainWithBody("<stdin>", false, code_text, true);
        return Sk.misceval.asyncToPromise(() => do_import);
    };

    global.assert = require("assert");

    global.js_getattr = function(py_obj, js_attrname) {
        var py_attrname = Sk.ffi.remapToPy(js_attrname);
        var py_attrval = Sk.builtin.getattr(py_obj, py_attrname)
        return Sk.ffi.remapToJs(py_attrval);
    };

    global.call_method = function(py_obj, js_methodname, js_args) {
        var fun = Sk.builtin.getattr(py_obj, Sk.ffi.remapToPy(js_methodname));
        var py_args = js_args.map(Sk.ffi.remapToPy);
        var py_result = Sk.misceval.callsimArray(fun, py_args);
        return Sk.ffi.remapToJs(py_result);
    };

    global.assert_Costume_equal = function(got_costume,
                                           exp_img_tag, exp_img_wd, exp_img_ht,
                                           exp_centre_x,
                                           exp_centre_y) {
        assert.equal(got_costume.image.tag, exp_img_tag);
        assert.equal(got_costume.image.width, exp_img_wd);
        assert.equal(got_costume.image.height, exp_img_ht);
        assert.strictEqual(got_costume.centre_x, exp_centre_x)
        assert.strictEqual(got_costume.centre_y, exp_centre_y);
    };

    global.assert_renders_as = function(label,
                                        project,
                                        exp_render_instrns) {
        var got_render_instrns = project.rendering_instructions();

        var exp_n_instrns = exp_render_instrns.length;
        var got_n_instrns = got_render_instrns.length;
        assert.strictEqual(got_n_instrns, exp_n_instrns,
                           "for " + label + ", got " + got_n_instrns
                           + " rendering instruction/s but expected "
                           + exp_n_instrns);

        got_render_instrns.forEach((got_instr, idx) => {
            var exp_instr = exp_render_instrns[idx];
            assert.strictEqual(got_instr.kind, exp_instr[0],
                               "at index " + idx + " of " + label
                               + ", got instruction of kind \""
                               + got_instr.kind
                               + "\" but expected kind \""
                               + exp_instr[0]
                               + "\"");

            switch(got_instr.kind) {
            case "RenderImage":
                var pfx = "in RenderImage at index " + idx + " of " + label;
                assert.ok(((got_instr.x == exp_instr[1])
                           && (got_instr.y == exp_instr[2])),
                          pfx
                          + ", got coords (" + got_instr.x + ", "
                          + got_instr.y + ") but expected ("
                          + exp_instr[1] + ", " + exp_instr[2]
                          + ")");
                assert.ok(got_instr.scale == exp_instr[3],
                          pfx
                          + ", got scale " + got_instr.scale
                          + " but expected "
                          + exp_instr[3]);
                assert.ok(got_instr.image_label == exp_instr[4],
                          pfx
                          + ", got image-label \"" + got_instr.image_label
                          + "\" but expected \""
                          + exp_instr[4]
                          + "\"");
                break;
            default:
                assert.ok(null,
                          "unknown instruction kind \""
                          + got_instr.kind + "\"");
            }
        });
    };

    global.assert_has_bbox_of = function(label, project, py_sprite,
                                         exp_xmin, exp_xmax, exp_ymin, exp_ymax) {
        var got_bbox = project.bounding_box_of_sprite_instance(py_sprite);

        const assert_prop_eq = ((slot, got_val, exp_val) => {
            var msg = ("got " + got_val + " for " + slot + " of " + label
                       + " but expected " + exp_val);
            assert.equal(got_val, exp_val, msg);
        });

        assert_prop_eq("xmin", got_bbox[0], exp_xmin);
        assert_prop_eq("xmax", got_bbox[1], exp_xmax);
        assert_prop_eq("ymin", got_bbox[2], exp_ymin);
        assert_prop_eq("ymax", got_bbox[3], exp_ymax);
    };
});


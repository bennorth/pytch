"use strict";


////////////////////////////////////////////////////////////////////////////////

const fs = require("fs");
const reqskulpt = require('../../support/run/require-skulpt').requireSkulpt;

before(() => {
    // Inject 'Sk' object into global namespace.
    reqskulpt(false);

    // Connect read/write to filesystem and stdout.
    Sk.configure({
        read: (fname) => { return fs.readFileSync(fname, "utf8"); },
        output: (args) => { process.stdout.write(args); },
        pytch: {
            async_load_image: (url => Promise.resolve("image-loaded-from-" + url)),
        },
    });


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Test helpers

    global.import_from_local_file = function(fname) {
        var code_text = fs.readFileSync(fname, { encoding: "utf8" });
        return Sk.importMainWithBody("<stdin>", false, code_text, true);
    };

    global.assert = require("assert");

    global.js_getattr = function(py_obj, js_attrname) {
        var py_attrname = Sk.ffi.remapToPy(js_attrname);
        var py_attrval = Sk.builtin.getattr(py_obj, py_attrname)
        return Sk.ffi.remapToJs(py_attrval);
    };

    global.assert_Costume_equal = function(got_costume,
                                           exp_image,
                                           exp_centre_x,
                                           exp_centre_y) {
        assert.equal(got_costume.image, exp_image);
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
});


"use strict";


////////////////////////////////////////////////////////////////////////////////

const assert = require("assert");
const fs = require("fs");

// Inject 'Sk' object into global namespace.
const reqskulpt = require('../../support/run/require-skulpt').requireSkulpt;
this.Sk = reqskulpt(false);

// Connect read/write to filesystem and stdout.
Sk.configure({
    read: (fname) => { return fs.readFileSync(fname, "utf8"); },
    output: (args) => { process.stdout.write(args); },
});


////////////////////////////////////////////////////////////////////////////////
//
// Test helpers

const import_from_local_file = function(fname) {
    var code_text = fs.readFileSync(fname, { encoding: "utf8" });
    return Sk.importMainWithBody(fname, false, code_text, true);
}


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.hat_blocks'

describe("pytch.hat_blocks module", function() {
    const cls_method_handler_attribute = function(js_cls, js_method_name) {
        var method = js_cls[js_method_name];
        var py_handler_attr = method.$d._pytch_handler_for;
        assert.ok(py_handler_attr);
        return Sk.ffi.remapToJs(py_handler_attr);
    };

    const assert_handler_for = function(js_cls, js_method_name,
                                        handler_type, handler_data) {
        var handler = cls_method_handler_attribute(js_cls, js_method_name);
        assert.equal(handler[0], handler_type);
        assert.equal(handler[1], handler_data);
    };
});

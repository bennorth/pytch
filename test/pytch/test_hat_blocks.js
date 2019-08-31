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
});

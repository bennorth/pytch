"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.sprite'

describe("pytch.project module", function() {
    it("can be imported", function() {
        var import_result = import_from_local_file("py/sprite/just_import.py");
        assert.ok(import_result.$d.pytch_sprite);
    });
});

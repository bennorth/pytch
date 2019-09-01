"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.sprite'

describe("pytch.project module", () => {
    it("can be imported", () => {
        var import_result = import_from_local_file("py/sprite/just_import.py");
        assert.ok(import_result.$d.pytch_sprite);
    });
});

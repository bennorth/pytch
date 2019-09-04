"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.sprite'

describe("pytch.project module", () => {
    it("can be imported", () => {
        import_local_file("py/sprite/just_import.py").then(import_result => {
        assert.ok(import_result.$d.pytch_sprite);
        });
    });
});

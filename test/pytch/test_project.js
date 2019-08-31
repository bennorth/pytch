"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.project'

describe("pytch.project module", function() {
    it("can be imported", function() {
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
});

"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Module 'pytch.project'

describe("pytch.project module", () => {
    it("can run two threads at once", () => {
	return import_local_file("py/project/two_threads.py").then(import_result => {
	    var project = import_result.$d.project.js_project;
	    var t1 = (project.sprite_by_class_name("T1").py_instances[0]);
	    var t2 = (project.sprite_by_class_name("T2").py_instances[0]);
	    assert.strictEqual(js_getattr( t1, "counter"), 0);
	    assert.strictEqual(js_getattr( t2, "counter"), 0);
            project.on_green_flag_clicked();
            project.one_frame();
	    // After one frame both threads should have had a chance to run
	    assert.strictEqual(js_getattr( t1, "counter"), 1);
	    assert.strictEqual(js_getattr( t2, "counter"), 1);
	    

	});
    });
});

"use strict";


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

    it("decorators apply attributes to functions", () => {
        import_local_file("py/hat_blocks/decorators.py").then(import_result => {
        var py_Spaceship = import_result.$d.Spaceship;
        assert_handler_for(py_Spaceship, "move_left", "keypress", "a");
        assert_handler_for(py_Spaceship, "move_right", "keypress", "d");
        assert_handler_for(py_Spaceship, "launch", "green-flag", null);
        assert_handler_for(py_Spaceship, "engage_shields", "click", null);
        });
    });
});

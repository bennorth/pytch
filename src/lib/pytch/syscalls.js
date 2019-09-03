var $builtinmodule = function (name) {
    var mod = {};

    const new_pytch_suspension = function(subtype, data) {
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.none.none$; };
        susp.data = { type: "Pytch", subtype: subtype, subtype_data: data };
        return susp;
    };

    mod._yield_until_next_frame = new Sk.builtin.func(() => {
        return new_pytch_suspension("next-frame", null);
    });

    mod._broadcast = new Sk.builtin.func((py_message) => {
        var js_message = Sk.ffi.remapToJs(py_message);
        return new_pytch_suspension("broadcast", js_message);
    });

    mod._broadcast_and_wait = new Sk.builtin.func((py_message) => {
        var js_message = Sk.ffi.remapToJs(py_message);
        return new_pytch_suspension("broadcast-and-wait", js_message);
    });

    mod._sleep = new Sk.builtin.func((py_n_seconds) => {
        var js_n_seconds = Sk.ffi.remapToJs(py_n_seconds);
        return new_pytch_suspension("sleep", js_n_seconds);
    });

    return mod;
};

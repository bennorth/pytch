var $builtinmodule = function (name) {
    var mod = {};

    mod._yield_until_next_frame = new Sk.builtin.func(() => {
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.none.none$; };
        susp.data = { type: "Pytch", subtype: "next-frame" };
        return susp;
    });

    mod._broadcast = new Sk.builtin.func((py_message) => {
        var js_message = Sk.ffi.remapToJs(py_message);
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.none.none$; };
        susp.data = {
            type: "Pytch",
            subtype: "broadcast",
            subtype_data: js_message,
        };
        return susp;
    });

    mod._broadcast_and_wait = new Sk.builtin.func((py_message) => {
        var js_message = Sk.ffi.remapToJs(py_message);
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.none.none$; };
        susp.data = {
            type: "Pytch",
            subtype: "broadcast-and-wait",
            subtype_data: js_message,
        };
        return susp;
    });

    return mod;
};

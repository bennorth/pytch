var $builtinmodule = function (name) {
    var mod = {};

    mod._yield_until_next_frame = new Sk.builtin.func(() => {
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() { return Sk.builtin.none.none$; };
        susp.data = { type: "Pytch", subtype: "next-frame" };
        return susp;
    });

    return mod;
};

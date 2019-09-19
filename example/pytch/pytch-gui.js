// pytch-gui.js

$(document).ready(function() {

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Editor interaction

    var ace_editor = ace.edit("editor");


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Skulpt interaction

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined
                || Sk.builtinFiles["files"][x] === undefined)
	    throw "File not found: '" + x + "'";

        return Sk.builtinFiles["files"][x];
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Provide rendering target via canvas

    const stage_canvas = (() => {
        const canvas_elt = $("#pytch-canvas")[0];

        if (! canvas_elt.hasAttribute("tabindex"))
            canvas_elt.setAttribute("tabindex", 0);

        const stage_wd = canvas_elt.width;
        const stage_hwd = (stage_wd / 2) | 0;
        const stage_ht = canvas_elt.height;
        const stage_hht = (stage_ht / 2) | 0;

        const canvas_ctx = canvas_elt.getContext("2d");

        canvas_ctx.translate(stage_hwd, stage_hht);
        canvas_ctx.scale(1, -1);

        const enact_instructions = function(rendering_instructions) {
            rendering_instructions.forEach(instr => {
                switch(instr.kind) {
                case "RenderImage":
                    canvas_ctx.save();
                    canvas_ctx.translate(instr.x, instr.y);
                    canvas_ctx.scale(instr.scale, -instr.scale);
                    canvas_ctx.drawImage(instr.image, 0, 0);
                    canvas_ctx.restore();
                    break;

                default:
                    throw new Error("unknown render-instruction kind \""
                                    + instr.kind
                                    + "\"");
                }
            });
        };

        const render = function(project) {
            canvas_ctx.clearRect(-stage_hwd, -stage_hht, stage_wd, stage_ht);
            enact_instructions(project.rendering_instructions());
        };

        return {
            dom_elt: canvas_elt,
            render: render,
        };
    })();


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Provide 'keyboard' interface via browser keyboard

    const browser_keyboard = (() => {
        var undrained_keydown_events = [];
        var is_key_down = {};

        const on_key_down = function(e) {
            is_key_down[e.key] = true;
            undrained_keydown_events.push(e.key);
            e.preventDefault();
        };

        const on_key_up = function(e) {
            is_key_down[e.key] = false;
            e.preventDefault();
        };

        const is_key_pressed = function(keyname) {
            return (is_key_down[keyname] || false);
        };

        const drain_new_keydown_events = function() {
            var evts = undrained_keydown_events;
            undrained_keydown_events = [];
            return evts;
        };

        return {
            on_key_down: on_key_down,
            on_key_up: on_key_up,
            is_key_pressed: is_key_pressed,
            drain_new_keydown_events: drain_new_keydown_events,
        };
    })();


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Provide 'asynchronous load image' interface

    const async_load_image = function(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() { resolve(img); };
            img.src = url;
        });
    };
});

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
});

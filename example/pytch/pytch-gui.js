// pytch-gui.js

$(document).ready(function() {

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Editor interaction

    var ace_editor = ace.edit("editor");

    ace_editor.getSession().setUseWorker(false);
    ace_editor.session.setMode("ace/mode/python");
    ace_editor.setValue("#\n# Write your Pytch code here!\n#\n");
    ace_editor.clearSelection();

    var show_code_changed_indicator = function(evt)
    { $("#code-change-indicator").show(); };

    var hide_code_changed_indicator = function(evt)
    { $("#code-change-indicator").hide(); };

    ace_editor.on("change", show_code_changed_indicator);

    var ace_editor_set_code = function(code_text) {
        ace_editor.setValue(code_text);
        ace_editor.clearSelection();
        ace_editor.moveCursorTo(0, 0);
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Info tabs (stdout, stderr)

    var make_tab_current_via_evt = function(evt) {
        var tab_nub = evt.target.dataset.tab;
        make_tab_current(tab_nub);
    }

    var make_tab_current = function(tab_nub) {
        var tab_head_id = "tab-header-" + tab_nub;
        var tab_pane_id = "tab-pane-" + tab_nub;

        $("#info-panels-container ul.tabs li").removeClass("current");
        $("#info-panels-container div.tab-content").removeClass("current");

        $("#" + tab_head_id).addClass("current");
        $("#" + tab_pane_id).addClass("current");
    };

    $("#info-panels-container ul.tabs li").click(make_tab_current_via_evt);


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Populate 'Examples' drop-down menu

    (function() {
        var examples_menu_contents = $('#jq-dropdown-examples > ul');

        var examples = [
            {label: 'Moving Ball', url: 'examples/moving_ball.py'},
        ];

        var menubar = $("#editor-menubar");

        var load_example = function(evt) {
            menubar.jqDropdown("hide");

            var evt_data = evt.target.dataset;
            var code_url = evt_data.pytchUrl;
            $.ajax(code_url).then(ace_editor_set_code);
        };

        examples.forEach((example) => {
            var label_elt = $("<label"
                              + " data-pytch-url=\"" + example.url + "\""
                              + " data-pytch-label=\"" + example.label + "\">"
                              + example.label
                              + "</label>");
            $(label_elt).click(load_example);
            var li_elt = $("<li></li>");
            li_elt.append(label_elt);
            examples_menu_contents.append(li_elt);
        });
    })();


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


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Build user code

    var build_immediate_feedback = function() {
        hide_code_changed_indicator();
        $("#build-button").html("<i>Working...</i>");
    };

    var build_do_real_work = function() {
        var prog = ace_editor.getValue();
        var p = Sk.misceval.asyncToPromise(function() {
            $("#build-button").html("BUILD");
            return Sk.importMainWithBody("<stdin>", false, prog, true);
        });
        // TODO: Provide feedback (OK / error) from p.
    };

    var build_user_code = function() {
        build_immediate_feedback();
        window.setTimeout(build_do_real_work, 125);
    };

    $("#build-button").click(build_user_code);


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Connect Skulpt to our various interfaces

    Sk.configure({ read: builtinRead,
                   pytch: {
                       async_load_image: async_load_image,
                       keyboard: browser_keyboard,
                   },
                 });


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Connect browser events to Pytch handlers

    $("#green-flag").click(() => {
        Sk.pytch.current_live_project.js_project.on_green_flag_clicked();
    });

    $("#red-stop").click(() => {
        Sk.pytch.current_live_project.js_project.on_red_stop_clicked();
    });


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Define and launch perpetual Pytch loop

    const one_frame = function() {
        var project = Sk.pytch.current_live_project.js_project;

        project.one_frame();
        stage_canvas.render(project);

        window.requestAnimationFrame(one_frame);
    };

    window.requestAnimationFrame(one_frame);
});

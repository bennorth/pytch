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

    ////////////////////////////////////////////////////////////////////////
    //
    // Contents of individual panes

    function TextPane(initial_html, tab_nub) {
        this.initial_html = initial_html;
        this.content_elt = document.getElementById("tab-content-" + tab_nub);
        this.reset();
    }

    TextPane.prototype.reset = function() {
        this.content_elt.innerHTML = this.initial_html;
        this.is_placeholder = true;
    };

    TextPane.prototype.append_text = function(txt) {
        if (this.is_placeholder) {
            this.content_elt.innerHTML = txt;
            this.is_placeholder = false;
        } else {
            this.content_elt.innerHTML += txt;
        }
    };

    var stdout_info_pane = new TextPane(
        "<span class=\"info\">Any output from your script will appear here.</span>",
        "stdout");

    var stderr_info_pane = new TextPane(
        "<span class=\"info\">Any errors from your script will appear here.</span>",
        "stderr");


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Populate 'Examples' drop-down menu

    (function() {
        var examples_menu_contents = $('#jq-dropdown-examples > ul');

        var examples = [
            {label: 'Moving Ball', url: 'examples/moving_ball.py'},
            {label: 'Pong', url: 'examples/pong.py'},
        ];

        var menubar = $("#editor-menubar");

        // Curried for ease of using in $.ajax() call.  Refers to
        // "user projects local storage" object defined below.
        var set_name_and_code = function(name) {
            return function(code) {
                user_projects.set_project_name(name);
                ace_editor_set_code(code);
            };
        };

        var load_example = function(evt) {
            menubar.jqDropdown("hide");

            var evt_data = evt.target.dataset;
            var user_project_name = "My " + evt_data.pytchLabel;
            var code_url = evt_data.pytchUrl;
            $.ajax(code_url).then(set_name_and_code(user_project_name));
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
    // Local storage for projects

    var user_projects = (function() {
        var local_storage_key = "pytch-saved-projects";
        var user_projects_menu_header = $("#user-projects-menu-header");
        var user_projects_contents = $("#jq-dropdown-user-projects > ul");
        var user_project_name_input = $("#user-chosen-project-name");
        var save_my_project_button = $("#save-my-project-button");
        var menubar = $("#editor-menubar");

        var saved_project_data = function() {
            var json_saved_projects = window.localStorage.getItem(local_storage_key);
            return ((json_saved_projects === null)
                    ? []
                    : JSON.parse(json_saved_projects));
        };

        var persist_saved_projects = function(project_descriptors) {
            window.localStorage.setItem(local_storage_key,
                                        JSON.stringify(project_descriptors));
        };

        var maybe_project_by_name = function(projects, target_name) {
            var tgt_idx = projects.findIndex(proj => (proj.name === target_name));

            var next_tgt_idx = projects.findIndex(
                (proj, idx) => ((idx > tgt_idx) && (proj.name === target_name)));

            if (next_tgt_idx !== -1)
                // TODO: More useful error-reporting, even though this is an
                // internal error.
                throw new Error("found \"" + target_name + "\" more than once");

            return (tgt_idx === -1) ? null : projects[tgt_idx];
        };

        var save_project = function() {
            // TODO: Prompt for confirmation of overwriting if different name
            // to last loaded/saved.

            var project_name = user_project_name_input.val();
            var saved_projects = saved_project_data();
            var project_code_text = ace_editor.getValue();

            var maybe_existing_project
                = maybe_project_by_name(saved_projects, project_name);

            if (maybe_existing_project !== null) {
                var existing_project = maybe_existing_project;
                existing_project.code_text = project_code_text;
            } else {
                saved_projects.push({ name: project_name,
                                      code_text: project_code_text });
            }

            persist_saved_projects(saved_projects);
            refresh();
        };

        var load_saved_project_by_name = function(target_name) {
            var maybe_project = maybe_project_by_name(saved_project_data(),
                                                      target_name);

            if (maybe_project === null) {
                // TODO: More useful error-reporting even though this is an
                // internal error.
                throw new Error("couldn't find project \"" + target_name + "\"");
            } else {
                menubar.jqDropdown("hide");
                var project = maybe_project;
                ace_editor_set_code(project.code_text);
            }
        };

        var load_saved_project = function(evt) {
            var project_name = evt.target.dataset.pytchLabel;
            load_saved_project_by_name(project_name);
        };

        var project_menu_entry_from_evt = function(evt) {
            var entry_idx = evt.target.dataset.pytchEntryIdx;
            var entry = $("#user-projects-menu-elt-" + entry_idx);
            if (entry.length !== 1)
                throw Error("expecting exactly one entry; got " + entry.length);
            return entry;
        };

        var highlight_to_be_deleted_project = function(evt)
        { project_menu_entry_from_evt(evt).addClass("cued-for-delete"); };

        var unhighlight_to_be_deleted_project = function(evt)
        { project_menu_entry_from_evt(evt).removeClass("cued-for-delete"); };

        var delete_saved_project = function(evt) {
            menubar.jqDropdown("hide");
            evt.stopPropagation();

            var projects = saved_project_data();
            var project_idx = +(evt.target.dataset.pytchEntryIdx);
            projects.splice(project_idx, 1);
            persist_saved_projects(projects);

            refresh();
        };

        var refresh = function() {
            user_projects_contents.empty();

            var saved_projects = saved_project_data();
            saved_projects.forEach((project_descriptor, entry_idx) => {
                var name = project_descriptor.name;
                var label_elt = $("<label></label>");
                label_elt.attr("id", "user-projects-menu-elt-" + entry_idx);
                label_elt.attr("data-pytch-label", name);
                label_elt.text(name);
                var li_elt = $("<li></li>");
                li_elt.append(label_elt);
                var delete_elt = $("<span class=\"delete-button\">DELETE</span>");
                delete_elt.attr("data-pytch-entry-idx", entry_idx);
                $(delete_elt).hover(highlight_to_be_deleted_project,
                                    unhighlight_to_be_deleted_project);
                $(delete_elt).click(delete_saved_project);
                li_elt.append(delete_elt);
                $(li_elt).click(load_saved_project);
                user_projects_contents.append(li_elt);
            });

            if (saved_projects.length == 0)
                user_projects_menu_header.addClass("greyed-out");
            else
                user_projects_menu_header.removeClass("greyed-out");
        };

        var set_project_name = function(name) {
            user_project_name_input.val(name);
        };

        refresh();
        save_my_project_button.click(save_project);

        return {
            set_project_name: set_project_name,
        };
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
    // Report errors

    var report_uncaught_exception = function(e) {
        var msg = Sk.builtin.str(e).v;
        stderr_info_pane.append_text(msg + "\n");
        make_tab_current("stderr");
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Build user code

    var build_immediate_feedback = function() {
        hide_code_changed_indicator();
        stdout_info_pane.reset();
        stderr_info_pane.reset();
        make_tab_current("stdout");
        $("#build-button").html("<i>Working...</i>");
    };

    var build_do_real_work = function() {
        var prog = ace_editor.getValue();
        var p = Sk.misceval.asyncToPromise(function() {
            $("#build-button").html("BUILD");
            return Sk.importMainWithBody("<stdin>", false, prog, true);
        });
        return p.catch(report_uncaught_exception);
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
                   output: (txt => stdout_info_pane.append_text(txt)),
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
        stage_canvas.dom_elt.focus();
    });

    $("#red-stop").click(() => {
        Sk.pytch.current_live_project.js_project.on_red_stop_clicked();
        stage_canvas.dom_elt.focus();
    });

    stage_canvas.dom_elt.onkeydown = browser_keyboard.on_key_down;
    stage_canvas.dom_elt.onkeyup = browser_keyboard.on_key_up;


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

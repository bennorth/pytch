$(document).ready(function() {

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Editor interaction

    var ace_editor = ace.edit("editor");

    var set_project_name_and_code = function(name) {  // Curried
        return function(code_text) {
            $("#user-chosen-project-name").val(name);
            ace_editor.setValue(code_text);
            ace_editor.clearSelection();
            ace_editor.moveCursorTo(0, 0);
        };
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Stdout / stderr tabs

    var make_tab_current_via_evt = function(evt) {
        var tab_id = "tab-" + evt.target.dataset.tab;
        make_tab_current(evt.target.id, tab_id);
    }

    var make_tab_current = function(tab_header_id, tab_content_id) {
        $("ul.tabs li").removeClass("current");
        $("div.tab-content").removeClass("current");

        $("#" + tab_header_id).addClass("current");
        $("#" + tab_content_id).addClass("current");
    };

    $("ul.tabs li").click(make_tab_current_via_evt);

    var stdout_content_is_placeholder = true;

    var reset_stdout_panel = function() {
        document.getElementById("stdout-content").innerHTML
            = "<span class=\"info\">Any output from your script will appear here.</span>";
        stdout_content_is_placeholder = true;
    };

    var stderr_content_is_placeholder = true;

    var reset_stderr_panel = function() {
        document.getElementById("stderr-content").innerHTML
            = "<span class=\"info\">Any errors from your script will appear here.</span>";
        stderr_content_is_placeholder = true;
    };

    reset_stdout_panel();
    reset_stderr_panel();

    var append_stdout = function(text) {
        var elt = document.getElementById("stdout-content");
        if (stdout_content_is_placeholder) {
            elt.innerHTML = text;
            stdout_content_is_placeholder = false;
        } else
            elt.innerHTML = elt.innerHTML + text;
    };


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Populate 'Examples' menu

    var menubar = $("#editor-menubar");

    var examples = [
        {label: 'Pong', url: 'pong.py'},
        {label: 'Chase Game', url: 'make-a-chase-game.py'},
        {label: 'Space Invaders', url: 'space-invaders.py'},  // Doesn't exist yet.
    ];

    var load_example = function(evt) {
        menubar.jqDropdown("hide");

        var code_url = evt.target.dataset.pytchUrl;
        var project_name = evt.target.dataset.pytchLabel;
        $.ajax(code_url).then(set_project_name_and_code("My " + project_name));
    };

    var examples_menu_contents = $('#jq-dropdown-examples > ul');

    examples.forEach((example) => {
        var label_elt = $("<li><label"
                          + " data-pytch-url=\"" + example.url + "\""
                          + " data-pytch-label=\"" + example.label + "\">"
                          + example.label
                          + "</label></li>");
        $(label_elt).click(load_example);
        examples_menu_contents.append(label_elt);
    });


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Work with 'Open' menu and 'Save' button

    var open_menu_top_level = $("#user-storage-menu");
    var open_menu_contents = $('#jq-dropdown-user-stored > ul');

    var persist_saved_projects = function(project_descriptors) {
        window.localStorage.setItem("pytch-saved-projects",
                                    JSON.stringify(project_descriptors));
    };

    var ensure_have_saved_project_data = function() {
        var maybe_saved_projects = window.localStorage.getItem("pytch-saved-projects");
        if (maybe_saved_projects === null)
            persist_saved_projects([]);
    };

    var saved_project_data = function() {
        var json_saved_projects = window.localStorage.getItem("pytch-saved-projects");
        return JSON.parse(json_saved_projects);
    };

    var find_maybe_project_by_name = function(projects, target_name) {
        var target = null;

        projects.forEach(proj => {
            if (proj.name == target_name) {
                if (target !== null) {
                    // TODO: More useful error-reporting even though this is an
                    // internal error.
                    throw new Error("found " + target_name + " more than once");
                }
                target = proj;
            }
        });

        return target;
    };

    var load_saved_project_by_name = function(target_name) {
        var maybe_project = find_maybe_project_by_name(saved_project_data(),
                                                       target_name);
        if (maybe_project === null) {
            // TODO: More useful error-reporting even though this is an
            // internal error.
            console.log("Couldn't find project " + target_name);
        } else {
            menubar.jqDropdown("hide");
            set_project_name_and_code(target_name)(maybe_project.code_text);
        }
    };

    var load_saved_project = function(evt) {
        var project_name = evt.target.dataset.pytchLabel;
        load_saved_project_by_name(project_name);
    };

    var refresh_open_menu_contents = function() {
        var saved_projects = saved_project_data();

        open_menu_contents.empty();
        saved_projects.forEach(project_descriptor => {
            var name = project_descriptor.name;
            var label_elt = $("<label></label>");
            label_elt.attr("data-pytch-label", name);
            label_elt.text(name);
            var li_elt = $("<li></li>");
            li_elt.append(label_elt);
            $(li_elt).click(load_saved_project);
            open_menu_contents.append(li_elt);
        });

        if (saved_projects.length == 0)
            open_menu_top_level.addClass("greyed-out");
        else
            open_menu_top_level.removeClass("greyed-out");
    };

    // TODO: Prompt for confirmation of overwriting if different name
    // to last loaded/saved.

    var save_project = function() {
        var project_name = $("#user-chosen-project-name").val();

        var saved_projects = saved_project_data();

        var maybe_existing_project
            = find_maybe_project_by_name(saved_projects, project_name);

        var project_code_text = ace_editor.getValue();

        if (maybe_existing_project !== null) {
            maybe_existing_project.code_text = project_code_text;
        } else {
            saved_projects.push({name: project_name,
                                 code_text: project_code_text});
        }

        persist_saved_projects(saved_projects);
        refresh_open_menu_contents();
    };

    ensure_have_saved_project_data();
    refresh_open_menu_contents();

    $("#save-to-storage-button").click(save_project);


    ////////////////////////////////////////////////////////////////////////////////
    //
    // Top level Skulpt interaction

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
	    throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    Sk.configure({ read: builtinRead,
                   output: append_stdout,
                 });

    $("#compile-button").click(function() {
        reset_stdout_panel();
        reset_stderr_panel();
        make_tab_current("stdout-heading", "tab-stdout");

        var prog = ace_editor.getValue();
        var p = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, prog, true);
        });
    });

    ace_editor.getSession().setUseWorker(false);
    ace_editor.session.setMode("ace/mode/python");
    ace_editor.setValue("#\n# Write your Pytch code here, or\n# try one of the examples!\n#\n");
    ace_editor.clearSelection();

});

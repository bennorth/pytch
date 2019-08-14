$(document).ready(function() {

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

        var editor = ace.edit("editor");
        var code_url = evt.target.dataset.pytchUrl;
        var project_name = evt.target.dataset.pytchLabel;
        $.ajax(code_url).then(code_text => {
            $("#user-chosen-project-name").val("My " + project_name);
            editor.setValue(code_text);
        });
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
            var editor = ace.edit("editor");
            $("#user-chosen-project-name").val(target_name);
            editor.setValue(maybe_project.code_text);
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
            console.log("trying", project_descriptor);
            var name = project_descriptor.name;
            var label_elt = $("<label></label>");
            label_elt.attr("data-pytch-label", name);
            label_elt.text(name);
            var li_elt = $("<li></li>");
            li_elt.append(label_elt);
            $(li_elt).click(load_saved_project);
            open_menu_contents.append(li_elt);
            console.log("appended", li_elt, "to", open_menu_contents);
        });

        if (saved_projects.length == 0)
            open_menu_top_level.addClass("greyed-out");
        else
            open_menu_top_level.removeClass("greyed-out");
    };

    ensure_have_saved_project_data();
    refresh_open_menu_contents();


});

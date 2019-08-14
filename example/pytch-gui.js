$(document).ready(function() {

    ////////////////////////////////////////////////////////////////////////////////
    //
    // Populate 'Examples' menu

    var examples_menu = $("#editor-menubar");

    var examples = [
        {label: 'Pong', url: 'pong.py'},
        {label: 'Chase Game', url: 'make-a-chase-game.py'},
        {label: 'Space Invaders', url: 'space-invaders.py'},  // Doesn't exist yet.
    ];

    function load_example(evt) {
        examples_menu.jqDropdown("hide");

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

});

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
});

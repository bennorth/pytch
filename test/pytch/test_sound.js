"use strict";


////////////////////////////////////////////////////////////////////////////////
//
// Test sound functions

describe("pytch.project module", () => {
    it("can load a sound", () => {
        return import_local_file("py/project/sound_sprite.py").then(import_result => {
            var project = import_result.$d.project.js_project;
	    var s = (project.sprite_by_class_name("SoundSprite"));
	    assert.notStrictEqual(s.soundByName,{});
        });
    });
});

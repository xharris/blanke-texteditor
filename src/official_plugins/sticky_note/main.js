document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "Sticky Note") {
        // Plugin has loaded
        b_search.addCommands(note_plugin);
        
        // load previous notes
        // // if save.json exists read it
        // // for each key, call loadNote(key_value)
    }
});

var note_plugin = {
    commands: [
        ['note add', '(Create a sticky note)']
    ],
    
    action: function(input) {
        var input_parts = input.split(/[ ]+/);

        if (input_parts[0] === 'note') {
            if (input_parts[1] === 'add') {
                createNote();
            }
        }
    }
}

function createNote() {
    console.log($(window).width())
    var box = b_ui.dragBox(70,70,250,0);
    
    $(box).addClass("sticky-note");
    $(box).html(
        "<button><i class='mdi mdi-close'></i></button>"+
        "<textarea class='no-drag'></textarea>"
    );
}

// note_info = {text, left, top}
function loadNote(note_info) {
    
}

function saveNotes() {
    // iterate through .sticky-note
    // ...
    // get its value and position (top, left);
}
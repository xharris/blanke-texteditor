document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "Sticky Note") {
        // Plugin has loaded
        b_search.addCommands(default_commands);var default_commands = {
            commands: note_commands,
            action: noteAction
        };
    }
});

var note_commands = [
    ['note add', '(Create a sticky note)']
]

function noteAction(input) {
    var input_parts = input.split(/[ ]+/);
    
    if (input_parts[0] === 'note') {
        if (input_parts[1] === 'add') {
            
        }
    }
}

function createNote() {
    $("#main_window").append(
        "<div class='sticky-note'>"+
            "<button><i class='mdi mdi-close'></i></button>"+
            "<textarea></textarea>"+
        "</div>"
    );
}
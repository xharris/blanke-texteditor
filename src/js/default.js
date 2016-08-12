$(function(){
    b_search.addCommands(default_commands);
});

// [command, arg hints]
var ideCommands = [
    ['dev-tools','(Show developer tool for this IDE)'],
    ['cmd','<command-name> -global -delete'],
    ['plugins','(opens plugin dialog)'],
    ['options ide','(Change IDE Appearance, Editor settings, etc.)'],
];

var ideActions = function(input) {
    var input_parts = input.split(/[ ]+/);

    if (input_parts[0] === "dev-tools") {
        b_ide.showDevTools();
        b_editor.focus();
    }
    if (input_parts[0] === "cmd") {
        if (input_parts.length >= 2) {
            var extra_options = input_parts.slice(2, input_parts.length);
        }
    }
    if (input_parts[0] === "plugins") {
        b_plugin.showViewer();
    }
    if (input_parts[0] === "options") {
        if (input_parts[1] === "ide") {
            b_ide.showIdeOptions();
        }
    }
}

var default_commands = {
    commands: ideCommands,
    action: ideActions
};

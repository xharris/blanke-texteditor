$(function(){
    b_search.addCommands(default_commands);
});

// [command, arg hints]
var ideCommands = [
    ['dev-tools','(Show developer tool for this IDE)'],
    ['plugins','(opens plugin dialog)'],
    ['options ide','(Change IDE Appearance, Editor settings, etc.)'],
    
    ['project refresh','(Rescan the project directory)'],
    ['project explore','(Open the project in explorer/finder)'],
    
    ['file explore','(Show the file in explorer/finder)'],
    
    ['editor wrap','(wrap text)'],
    
    ['appdata explore','(Explore AppData folder)'],  
    
    ['system beep',''],
    ['stop loading','(Stop the loading bar animation if it won\'t stop)'],
    ['clear data','(Clears the editors data files. Not your code)']
];

var ideActions = function(input) {
    var input_parts = input.split(/[ ]+/);

    if (input_parts[0] === "dev-tools") {
        b_ide.showDevTools();
        b_editor.focus()
    }
    if (input_parts[0] === "plugins") {
        b_plugin.showViewer();
    }
    if (input_parts[0] === "options") {
        if (input_parts[1] === "ide") {
            b_ide.showIdeOptions();
        }
    }
    if (input_parts[0] === "project") {
        if (input_parts[1] === "refresh") {
            b_project.refreshTree(b_ide.getData()['current_project']);
        }
        if (input_parts[1] === "explore") {
            eSHELL.showItemInFolder(b_ide.getData()["current_project"]);
        }
    }
    if (input_parts[0] === "file") {
        if (input_parts[1] === "explore") {
            eSHELL.showItemInFolder(b_project.getSetting("curr_file"));
        }
    }
    if (input_parts[0] === "editor") {
        if (input_parts[1] === "wrap") {
            editor.getSession().setUseWrapMode(!editor.getSession().getUseWrapMode());
        }
    }
    if (input_parts[0] === "appdata") {
        if (input_parts[1] === "explore") {
            eSHELL.showItemInFolder(eAPP.getPath("appData"))
        }
    }
    if (input_parts[0] === "system") {
        if (input_parts[1] === "beep") {
            eSHELL.beep();
        }
    }
    if (input_parts[0] === "stop") {
        if (input_parts[1] === "loading") {
            b_ide.hideProgressBar();
        }
    }
    if (input_parts[0] === "clear") {
        if (input_parts[1] === "data") {
            
            nwFILE.rmdir(b_ide.data_folder, function(){
                
            });
        }
    }
}

var default_commands = {
    commands: ideCommands,
    action: ideActions
};

var IDE_NAME = "TextEditor";

var nwFILE = require('fs');
var nwPATH = require('path');

var nwGREP = require('simple-grep');

var eIPC = require('electron').ipcRenderer;

var ide_data = {
    project_paths: [],  // folders dropped in the ide
    unsaved_text: {},   // save text from unsaved files from each project
    recent_files: [],   // recently searched files from each project
    curr_file: '',      // currently opened file
    current_project: ''
};

var labels = {
    project: '<span class="label label-red">project</span>'
};

var editor;
var curr_project;
var curr_folder;
var proj_tree = [];
var re_file_ext = /(?:\.([^.]+))?$/;

var search_box_options = {
    file: {
        icon: 'fa fa-file-o',
        color: '#00bcd4',
        text: 'white',
        action: searchTypeChange
    },
    text: {
        icon: 'fa fa-font',
        color: '#8bc34a',
        text: 'white',
        action: searchTypeChange
    },
    cmd: {
        icon: 'fa fa-terminal',
        color: '#f44336',
        text: 'white',
        action: searchTypeChange
    }
}

var commands = {};

var _search_type = Object.keys(search_box_options)[0];

$(function(){
    loadData('data/ide_data.json');

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setFontSize(14);

    // set events for window close
    eIPC.on('window-close', function(event) {
        closeProject(function(){
            eIPC.send('confirm-window-close');
        });
    });

    var drop_mainwin = document.getElementById("main_window");
	drop_mainwin.ondragover = () => {
        // console.log(e.dataTransfer.files);
		if ($(".filedrop-overlay").hasClass("inactive")) {
			//$(".filedrop-overlay").removeClass("inactive");
		}
		return false;
	}
	drop_mainwin.ondragleave = drop_mainwin.ondragend = () => {
		//$(".filedrop-overlay").addClass("inactive");
		return false;
	}
	drop_mainwin.ondrop = (e) => {
		e.preventDefault();

		for (var f of e.dataTransfer.files) {
			var in_path = f.path;
			var ext = re_file_ext.exec(in_path)[1];

            var file_type = nwFILE.lstatSync(in_path);

            if (file_type.isDirectory()) {
                var folder_name = nwPATH.basename(in_path);

                addProjectFolder(in_path)
            }
            else if (file_type.isFile()) {
                addToast({
                    message: "file: " + in_path,
                    can_dismiss: false,
                    timeout: 1500
                });
            }

		}
		$(".filedrop-overlay").addClass("inactive");
		return false;
	}

    $(".search-type").comboBox(search_box_options);

    $("#editor").on("keydown", function(evt) {
        var keyCode = evt.keyCode || evt.which;;
        var key = evt.key;
        // command 224

        var special_chars = {
            16: 'mdi-chevron-up', // shift
            20: 'mdi-chevron-double-up', // caps lock
            91: 'mdi-apple-keyboard-command', // apple META/command key
            93: 'mdi-apple-keyboard-command', // apple META/command key
        }
        
        if (Object.keys(special_chars).includes(keyCode+"")) {
            key = '<i class="mdi ' + special_chars[keyCode] + '"></i>';
        }

        $(".status-bar .keycode").html('<span class="char">' + key + '</span>' + keyCode);
    });

    editor.commands.addCommand({
        name: 'save_file',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: b_editor.saveFile(),
        readOnly: true // false if this command should not apply in readOnly mode
    });
});

function indexDir(path) {
    nwFILE.readdir(path, function(err, files){
        for (var f = 0; f < files.length; f++) {
            var file = nwPATH.join(path, files[f]);

            console.log(file);
            var file_type = nwFILE.lstatSync(file);

            if (file_type.isDirectory()) {
                var next_path = file;
                proj_tree.concat(indexDir(nwPATH.join(path,files[f])));
            } else if (file_type.isFile()) {
                proj_tree.push(file);
            }
        }
    });
}

function dirTree(filename) {
    var stats = nwFILE.lstatSync(filename),
        info = {
            path: filename,
            name: nwPATH.basename(filename)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = nwFILE.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }

    // proj_tree.push(info.path.replace(curr_project, '')); // my custom line
    return info;
}

function searchTypeChange(new_type) {
    console.log('changed ' + new_type)
    _search_type = new_type;
}

function getSearchType() {
    return _search_type;
}

function saveData() {
    // create data directory
    try {
        nwFILE.mkdirSync('data');
    } catch (e) {}

    // save file
    nwFILE.writeFileSync(
        nwPATH.join('data','ide_data.json'),
        JSON.stringify(ide_data),
        {
            flag: 'w+'
        }
    );
}

function loadData(path) {
    try {
        var stat = nwFILE.lstatSync(path);

        if (stat.isFile()) {
            nwFILE.readFile(path, function(err, data) {
                if (!err) {
                    ide_data = JSON.parse(data);

                    setProjectFolder(ide_data['current_project']);
                }
            });
        }
    } catch (e) {

    }
}

function addProjectFolder(path) {
    var folder_name = nwPATH.basename(path);

    ide_data['project_paths'].push(path);

    addToast({
        message: 'added ' + labels['project'] + ' ' + folder_name,
        can_dismiss: true,
        timeout: 750
    });

    setProjectFolder(path);

    saveData();
}

function setProjectFolder(path) {
    $(".suggestions").removeClass("active");
    // set current project in settings
    ide_data['current_project'] = normalizePath(path);

    // set current project in ide
    for (var p = 0; p < ide_data['project_paths'].length; p++) {
        if (ide_data['project_paths'][p] === path) {
            curr_project = ide_data['project_paths'][p];
        }
    }

    proj_tree = dirTree(path);

    nwFILE.watch(path, (eventType, filename) => {
        if (filename) {
            proj_tree = dirTree(curr_project);
        }
    });
}

function normalizePath(path) {
    return path.replace(/(\/|\\)/g, '/');
}

function addCommands(new_commands) {
    var keys = Object.keys(new_commands);

    for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (!Object.keys(commands).includes(key)) {
            commands[key] = [];
        }
        commands[key].push(new_commands[key]);
    }
}

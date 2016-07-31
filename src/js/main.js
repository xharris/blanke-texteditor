var IDE_NAME = "TextEditor";

var nwFILE = require('fs');
var nwPATH = require('path');

var nwGREP = require('simple-grep');

var eIPC = require('electron').ipcRenderer;

var ide_data = {
    project_paths: [],  // folders dropped in the ide
    unsaved_text: {},   // save text from unsaved files
    current_project: ''
};

var labels = {
    project: '<span class="label label-red">project</span>'
};

var editor;
var curr_project = {};
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

                addToast({
                    message: 'added ' + labels['project'] + ' ' + folder_name,
                    can_dismiss: true,
                    timeout: 1500
                });
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
});

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

    ide_data['project_paths'].push({
        name: folder_name,
        path: path
    });

    setProjectFolder(path);

    saveData();
}

function setProjectFolder(path) {
    // set current project in settings
    ide_data['current_project'] = path;

    // set current project in ide
    for (var p = 0; p < ide_data['project_paths']; p++) {
        if (ide_data['project_paths'][p]['path'] === path) {
            curr_project = ide_data['project_paths'][p]['path']
        }
    }
}

function addCommands(new_commands) {
    var keys = Object.keys(new_commands);

    for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        for (var c = 0; c < new_commands[keys[k]].length; c++) {
            if (!Object.keys(commands).includes(key)) {
                commands[key] = [];
            }
            commands[key].push(new_commands[key][c]);
        }
    }

    console.log(commands);
}

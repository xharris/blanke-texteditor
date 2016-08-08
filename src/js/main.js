var IDE_NAME = "BlankE";
var DEV_MODE = true;

var ZOOM_AMT = 1;

var nwFILE = require('fs');
var nwPATH = require('path');
var nwPROC = require('process');
var nwZIP = require("unzip");
var nwRAF = require("rimraf");
var nwGREP = require('simple-grep');

var eIPC = require('electron').ipcRenderer;

var ide_themes = ["light", "dark"];
var editor_themes = [
    "ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt",
    "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "idle_fingers",
    "iplastic", "katzenmilch", "kr_theme", "kuroir", "merbivore",
    "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark",
    "solarized_light", "sqlserver", "terminal", "textmate", "tomorrow", "tomorrow_night",
    "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties",
    "twilight", "vibrant_ink", "xcode"
];

var default_options = {
    "appearance": {
        "ide": "light",
        "editor": "chrome"
    },
    "editor": {
        "zoom": 14
    }
}

var ide_data = {
    project_paths: [],      // folders dropped in the ide
    project_settings: {},
    recent_ide_commands: [], // recently used ide commands
    current_project: '',
    options: default_options,
    plugins: []
};
var project_settings_template = {
    unsaved_text: {},   // save text from unsaved files from each project
    recent_files: [],   // recently searched files from each project
    history: [],
    curr_file: '',      // currently opened file
    cursor_pos: {}
}

var labels = {
    project: '<span class="label label-red">project</span>',
    plugin: '<span class="label label-orange">plugin</span>',
    file: '<span class="label label-gray">file</span>'
};

var editor, aceModeList;
var data_path;
var curr_project;
var curr_folder;
var proj_tree = [];
var re_file_ext = /(?:\.([^.]+))?$/;

var search_box_options = {
    file: {
        icon: 'mdi mdi-file-outline',
        color: '#00bcd4',
        text: 'white',
        action: searchTypeChange
    },
    ide: {
        icon: 'mdi mdi-application',
        color: '#8bc34a',
        text: 'white',
        action: searchTypeChange
    },
    /*
    cmd: {
        icon: 'fa fa-terminal',
        color: '#f44336',
        text: 'white',
        action: searchTypeChange
    }*/
}

var commands = {};

var _search_type = Object.keys(search_box_options)[0];

$(function(){
    /* prevent page reload
    window.onbeforeunload = function() {
        return false;
    }
    */

    data_path = nwPATH.join(nwPROC.cwd(),'data','ide_data.json');
    loadData(data_path);

    editor = ace.edit("editor");
    editor.$blockScrolling = Infinity;
    aceModeList = ace.require("ace/ext/modelist");

    b_editor.setMode('Text');
    editor.setTheme("ace/theme/chrome");

    if (DEV_MODE) {
        b_ide.showDevTools();
    }

    // set events for window close
    eIPC.on('window-close', function(event) {
        saveData();
        eIPC.send('confirm-window-close');
    });

    eIPC.on('focus-search', function(event) {
        if (b_search.isFocus()) {
            $(".search-type").trigger("nextOption");
        } else {
            b_search.focus();
        }
    })

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
            else if (file_type.isSymbolicLink()) {
                addToast({
                    message: " symoblic! " + in_path,
                    can_dismiss: false,
                    timeout: 2000
                });
            }
            else if (file_type.isFile()) {
                addToast({
                    message: labels['file'] + " " + in_path,
                    can_dismiss: false,
                    timeout: 2000
                });
            }

		}
		$(".filedrop-overlay").addClass("inactive");
		return false;
	}

    $(".search-type").comboBox(search_box_options);

    $("#in-search").on("keydown", function(evt) {
        var keyCode = evt.keyCode || evt.which;
        var key = evt.key;

        if (evt.ctrlKey && keyCode == 82) {
            // previous option
            if (evt.shiftKey) {
                $(".search-type").trigger("prevOption");
            }
            // next option
            else {
                $(".search-type").trigger("nextOption");
            }
        }
    });
    $("#editor").on("keydown", function(evt) {
        var keyCode = evt.keyCode || evt.which;
        var key = evt.key;
        // command 224

        // uses mdi
        var special_chars = {
            13: 'mdi-keyboard-return', // enter
            16: 'mdi-chevron-up', // shift
            20: 'mdi-chevron-double-up', // caps lock
            32: 'mdi-dots-horizontal', // space
            91: 'mdi-apple-keyboard-command', // apple META/command
            93: 'mdi-apple-keyboard-command', // apple META/command
        };

        // doesn't use mdi
        var special_chars2 = {
            12: 'Clr', // clear
            17: 'Ctrl', // ctrl
            27: 'Esc', // escape
        };

        // zoom in
        if (evt.ctrlKey && keyCode == 187) {
            b_editor.zoom(ZOOM_AMT);
        }
        // zoom out
        if (evt.ctrlKey && keyCode == 189) {
            b_editor.zoom(-ZOOM_AMT);
        }

        if (Object.keys(special_chars).includes(keyCode+"")) {
            key = '<i class="mdi ' + special_chars[keyCode] + '"></i>';
        }
        else if (Object.keys(special_chars2).includes(keyCode+"")) {
            key = special_chars2[keyCode];
        }

        $(".status-bar .keycode").html('<span class="char">' + key + '</span>' + keyCode);

        // text changes autosave
        if (b_ide.isProjectSet() && /^[a-z0-9]+$/i.test(key)) {
            getProjectSetting('unsaved_text')[getProjectSetting('curr_file')] = editor.getValue();
            b_history.refreshList();
        }

        saveCursor();
    });

    // remember cursor position
    $("#editor").on('click', function(e) {
        saveCursor();
    });

    // saving
    editor.commands.addCommand({
        name: 'save_file',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function(editor) {
            b_editor.saveFile()
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });

    // history
    editor.commands.addCommand({
        name: 'history_back',
        bindKey: {win: 'Ctrl-Left',  mac: 'Command-Left'},
        exec: function(editor) {
            b_history.back();
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });
    editor.commands.addCommand({
        name: 'history_forward',
        bindKey: {win: 'Ctrl-Right',  mac: 'Command-Right'},
        exec: function(editor) {
            b_history.forward();
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });

    // project selection box
    $(".projects")[0].addEventListener("change", function() {
        var choice = this.options[this.selectedIndex].text;
        setProjectFolder(choice);
    });
});

function saveCursor() {
    console.log("save cursor");
    b_ide.addDataValue('cursor', {});
    if (b_ide.isProjectSet()) {
        getProjectSetting('cursor_pos')[getProjectSetting('curr_file')] = editor.selection.getCursor();
        getProjectSetting('cursor_pos')[getProjectSetting('curr_file')].row += 1;
    }
}

var dirTree = function(dir, done) {
    var results = [];

    nwFILE.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: nwPATH.basename(dir), type: 'folder', children: results});

        list.forEach(function(file) {
            file = nwPATH.resolve(dir, file);
            nwFILE.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    dirTree(file, function(err, res) {
                        results.push({
                            name: nwPATH.basename(file),
                            path: file,
                            type: 'folder',
                            children: res
                        });
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.push({
                        type: 'file',
                        path: file,
                        name: nwPATH.basename(file)
                    });
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

function refreshProjectTree(path, callback) {
    b_ide.showProgressBar();
    $("#in-search").prop('disabled', true);
    dirTree(path, function(err, res) {
        if (!err) {
            proj_tree = res;
            b_ide.hideProgressBar();
            $("#in-search").prop('disabled', false);

            if (callback) {
                callback(res);
            }
        }
    })
}

function searchTypeChange(new_type) {
    _search_type = new_type;
}

function getSearchType() {
    return _search_type;
}

function saveData() {
    setProjectSetting('history', b_history.save());
    // create data directory
    try {
        nwFILE.mkdirSync('data');
    } catch (e) {}

    // save file
    nwFILE.writeFileSync(
        data_path,
        JSON.stringify(ide_data),
        {
            flag: 'w+'
        }
    );
}

function dispatchEvent(ev_name, ev_properties) {
    var new_event = new CustomEvent(ev_name, ev_properties);
    document.dispatchEvent(new_event);
}

function loadData(path, callback) {
    try {
        var stat = nwFILE.lstatSync(path);

        if (stat.isFile()) {
            nwFILE.readFile(path, function(err, data) {
                if (!err) {
                    ide_data = JSON.parse(data);

                    //try {
                        b_plugin.loadPlugins(ide_data['plugins']);
                        b_ide.loadOptions();
                        setProjectFolder(ide_data['current_project']);
                        b_editor.setZoom(b_ide.getOption('editor').zoom);
                        b_editor.setFile(getProjectSetting('curr_file'));
                        b_history.loadHistory(getProjectSetting('history'));
                    //} catch(e) {
                        // make a whole new json
                        // ...
                    //}

                }
            });
        }
    } catch (e) {

    }
}

function refreshProjectList() {
    // remake project list
    $(".projects").empty();
    var proj_html = '';
    for (var p = 0; p < ide_data['project_paths'].length; p++) {
        var path = ide_data['project_paths'][p];
        var selected = '';
        if (path === curr_project) {
            selected = "selected='selected'";
        }
        proj_html += "<option value='" + path + "' " + selected + " >" + path + "</option>";
    }
    $(".projects").html(proj_html);
}

function addProjectFolder(path) {
    path = normalizePath(path);
    var folder_name = nwPATH.basename(path);

    ide_data['project_paths'].push(path);
    ide_data['project_settings'][path] = project_settings_template;

    addToast({
        message: 'added ' + labels['project'] + ' ' + folder_name,
        can_dismiss: true,
        timeout: 1000
    });

    if (ide_data['project_paths'].length == 1) {
        setProjectFolder(path);
    } else {
        refreshProjectList();
    }
    saveData();
}

function setProjectFolder(new_path) {
    console.log(new_path)
    if (new_path === undefined || new_path === "") return;
    // set current project in settings
    ide_data['current_project'] = normalizePath(new_path);

    // set current project in ide
    curr_project = ide_data['current_project'];

    $(".suggestions").removeClass("active");

    refreshProjectTree(curr_project);

    // TODO: will be a problem once alerts is implemented and USED (huh?)
    b_editor.setFile(getProjectSetting("curr_file"));

    // TODO: needs a closer look at. will this continue to watch previous projects?
    nwFILE.watch(curr_project, (eventType, filename) => {
        if (filename) {
            refreshProjectTree(curr_project);
        }
    });

    addToast({
        message: 'set ' + labels['project'] + ' ' + curr_project,
        can_dismiss: true,
        timeout: 1000
    });
    refreshProjectList();

    dispatchEvent("post_set_project", {
        'detail': {
            'project': curr_project
        }
    });
}

function getProjectSetting(setting_name) {
    if (b_ide.isProjectSet()) {
        //console.log('get ' + curr_project + ' > ' + setting_name);
        return ide_data['project_settings'][curr_project][setting_name];
    }
}

function setProjectSetting(setting_name, new_value) {
    if (b_ide.isProjectSet()) {
        //console.log('set ' + curr_project + ' > ' + setting_name + ' = ' + new_value);
        ide_data['project_settings'][curr_project][setting_name] = new_value;
    }
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

function winSetTitle(new_title) {
    eIPC.send('set-win-title', new_title)
}

function chooseFile(path, callback) {
    eIPC.send('open-file-dialog');
    eIPC.on('selected-directory', function (event, path) {
        callback(path);
    })
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

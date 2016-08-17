var IDE_NAME = "BlankE";
var ZOOM_AMT = 1;
var DEV_MODE = true; // use dev_data instead of data for saving

var nwFILE = require('fs');
var nwPATH = require('path');
var nwPROC = require('process');
var nwZIP = require("unzip");
var nwRAF = require("rimraf");
var nwLESS = require('less');

var eIPC = require('electron').ipcRenderer;
var eREMOTE = require('electron').remote;
var eAPP = eREMOTE.require('electron').app;
var eSHELL = eREMOTE.require('electron').shell;

var editor, aceModeList;
var re_file_ext = /(?:\.([^.]+))?$/;


$(function(){
    /* prevent page reload
    window.onbeforeunload = function() {
        return false;
    }
    */

    b_ide.loadData();
    b_plugin.loadOfficialPlugins();

    ace.require("ace/ext/language_tools");
    editor = ace.edit("editor");
    editor.$blockScrolling = Infinity;
    aceModeList = ace.require("ace/ext/modelist");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        fontFamily: "Courier New"
    });


    b_editor.setMode('Text');
    editor.setTheme("ace/theme/chrome");

    // set events for window close
    eIPC.on('window-close', function(event) {
        b_ide.saveData();
        eIPC.send('confirm-window-close');
    });

    eIPC.on('focus-search', function(event) {
        b_search.focus();
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

                b_project.addFolder(in_path)
            }
            else if (file_type.isSymbolicLink()) {
                b_ide.addToast({
                    message: " symoblic! " + in_path,
                    can_dismiss: false,
                    timeout: 2000
                });
            }
            else if (file_type.isFile()) {
                b_ide.addToast({
                    message: labels['file'] + " " + in_path,
                    can_dismiss: false,
                    timeout: 2000
                });
            }

		}
		$(".filedrop-overlay").addClass("inactive");
		return false;
	}


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

        var is_special = false;
        if (Object.keys(special_chars).includes(keyCode+"")) {
            key = '<i class="mdi ' + special_chars[keyCode] + '"></i>';
            is_special = true;
        }
        else if (Object.keys(special_chars2).includes(keyCode+"")) {
            key = special_chars2[keyCode];
            is_special = true;
        }

        $(".status-bar .keycode").html('<span class="char">' + key + '</span>' + keyCode);

        // text changes autosave
        if (b_ide.isProjectSet() && !is_special) {
            b_project.getSetting('unsaved_text')[b_project.getSetting('curr_file')] = editor.getValue();
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
        var choice_el = this.options[this.selectedIndex];
        var choice_path = choice_el.title;
        
        b_project.setFolder(choice_path);
    });

    editor.resize();
});

function saveCursor() {
    b_ide.addDataValue('cursor', {});
    if (b_ide.isProjectSet()) {
        b_project.getSetting('cursor_pos')[b_project.getSetting('curr_file')] = editor.selection.getCursor();
        b_project.getSetting('cursor_pos')[b_project.getSetting('curr_file')].row += 1;
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

function dispatchEvent(ev_name, ev_properties) {
    var new_event = new CustomEvent(ev_name, ev_properties);
    document.dispatchEvent(new_event);
}

function normalizePath(path) {
    return path.replace(/(\/|\\)/g, '/');
}

function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString();
}

function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function shortenPath(path, length) {
    var path_parts = path.split(nwPATH.sep);
    if (path_parts.length > length) {
        return nwPATH.normalize(path_parts.splice(path_parts.length - length, length).join(nwPATH.sep));
    }
}

function fillSelect(selector, values, selected_value, capitalize=true) {
    var html = '';
    for (var i = 0; i < values.length; i++) {
        var selected = '';
        if (values[i] === selected_value) {
            selected = ' selected ';
        }
        var new_val = values[i];
        if (capitalize) {
            var new_val = values[i].charAt(0).toUpperCase() + values[i].slice(1);
        }
        html += "<option value='" + values[i] + "'" + selected + ">" + new_val + "</option>";
    }
    $(selector).html(html);
}

Array.prototype.includesMulti = function(arr){
    var is_there = false;
    this.map(function(val) {
        is_there = (arr.includes(val));
    });
    return is_there;
}

function obj_assign(obj, prop, value) {
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        var e = prop.shift();
        obj_assign(obj[e] =
                 Object.prototype.toString.call(obj[e]) === "[object Object]"
                 ? obj[e]
                 : {},
               prop,
               value);
    } else
        obj[prop[0]] = value;
}

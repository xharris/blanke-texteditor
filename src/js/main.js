var IDE_NAME = "TextEditor";

const electron = require('electron')
// Module to control application life.
const app = electron.app

var eRemote = require('electron').remote;
var eMenu = eRemote.Menu;
var eIPC = require('electron').ipcRenderer;
var eScreen = require('electron').screen;

// save text from unsaved files
var unsaved_text = {};

var editor;

var search_box_options = {
    file: {
        html: '<i class="fa fa-file-o" aria-hidden="true"></i>',
        action: searchTypeChange
    },
    text: {
        html: '<i class="fa fa-font" aria-hidden="true"></i>',
        action: searchTypeChange
    },
    command: {
        html: '<i class="fa fa-terminal" aria-hidden="true"></i>',
        action: searchTypeChange
    }
}

$(function(){
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
	drop_mainwin.ondragover = (e) => {
        console.log(e.dataTransfer.files);
		if ($(".filedrop-overlay").hasClass("inactive")) {
			$("#file-drop-options").empty();

			$(".filedrop-overlay").removeClass("inactive");
		}
		return false;
	}
	drop_mainwin.ondragleave = drop_mainwin.ondragend = () => {
		$(".filedrop-overlay").addClass("inactive");
		return false;
	}
	drop_mainwin.ondrop = (e) => {
		e.preventDefault();

		for (var f of e.dataTransfer.files) {
			var in_path = f.path;
			var ext = re_file_ext.exec(in_path)[1];

			console.log(in_path);
		}
		$(".filedrop-overlay").addClass("inactive");
		return false;
	}

    $(".search-type").comboBox(search_box_options);
});

function searchTypeChange(new_type) {

}

var IDE_NAME = "TextEditor";

var nwFILE = require('fs');
var nwPATH = require('path');

var eIPC = require('electron').ipcRenderer;

var ide_data = {
    'project_paths': []
};

var labels = {
    project: '<span class="label label-red">project</span>'
};

// save text from unsaved files
var unsaved_text = {};

var editor;
var re_file_ext = /(?:\.([^.]+))?$/;

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
var _search_type = Object.keys(search_box_options)[0];

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

                addToast({
                    message: 'added ' + labels['project'] + ' ' + folder_name,
                    can_dismiss: true,
                    //timeout: 1500
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
    _search_type = new_type;
}

function getSearchType() {
    return _search_type;
}

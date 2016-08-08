$(function(){
    //document.addEventListener("on_set_project", function(e) {
        addCommands(default_commands);
    //});
});

var findFile = {
    suggest: function(input) {
        if (!b_ide.isProjectSet()) return '';

        var input_parts = input.split('/');
        var html = [];

        var files = proj_tree;
        // iterate through already typed path dirs
        if (files && files.length) {
            for (var p = 0; p < input_parts.length; p++) {
                var part = input_parts[p];

                // find next directory to go down
                console.log(files);
                for (var f = 0; f < files.length; f++) {
                    // TODO: if there is for example, '/.git' and '/.gitattributes', the first one gets priority (make this better)
                    if (files[f].name === part) {
                        files = files[f].children;
                    }
                }
            }
        }

        // previous suggestion (higher priority)
        for (var r = 0; r < getProjectSetting('recent_files').length; r++) {
            var full_path = normalizePath(getProjectSetting('recent_files')[r]);
            var file_path = full_path.replace(curr_project,'');
            var prev_path = nwPATH.basename(file_path);

            if (prev_path.startsWith(input)) {
                var result_txt = prev_path.replace(input, "<b>" + input + "</b>");
                html.push("<div class='suggestion high-priority' tabIndex='$1' data-value='" + file_path + "'>" + result_txt +  "<span class='full-path'>" + full_path + "</span>" + "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + full_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>");
            }
        }

        // create html suggestion array
        for (var f = 0; f < files.length; f++) {
            var full_path = normalizePath(files[f].path)
            var file_path = full_path.replace(curr_project,'');

            if (file_path.includes(input)) {
                var result_txt = file_path.replace(input, "<b>" + input + "</b>");

                // normal priority suggestion
                if (!getProjectSetting('recent_files').includes(file_path)) {
                    html.push("<div class='suggestion' tabIndex='$1' data-value='" + file_path + "'>" + result_txt + "</div>");
                }
            }
        }
        // turn it into a string
        var html_str = '';
        for (var h = 0; h < html.length; h++) {
            html_str += html[h].replace('$1', h+1);
        }
        return html_str;

    },

    submit: function(input) {
        if (!b_ide.isProjectSet()) return '';

        // open file
        b_editor.setFile(nwPATH.join(curr_project, input));
    }
};

// [command, arg hints]
var ideCommands = [
    ['dev-tools','(Show developer tool for this IDE)'],
    ['cmd','<command-name> -global -delete'],
    ['plugins','(opens plugin dialog)'],
    ['options ide','(Change IDE Appearance, Editor settings, etc.)'],
];

var ideActions = {
    suggest: function(input) {
        var input_parts = input.split(' ');
        var html = [];

        // previous suggestion (higher priority)
        for (var r = 0; r < ide_data['recent_ide_commands'].length; r++) {
            var command = ide_data['recent_ide_commands'][r];

            if (command.startsWith(input)) {
                var result_txt = command.replace(input, "<b>" + input + "</b>");
                html.push("<div class='suggestion high-priority' tabIndex='$1' data-value='" + command + "'>" + result_txt + "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + file_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>");
            }
        }

        // create html suggestion array
        for (var c = 0; c < ideCommands.length; c++) {
            var command_start = ideCommands[c][0];

            if (command_start.includes(input)) {

                var result_txt = command_start.replace(input, "<b>" + input + "</b>") + " <span class='options'>" + ideCommands[c][1] + "</span>";

                // normal priority suggestion
                if (!ide_data['recent_ide_commands'].includes(command_start)) {
                    html.push("<div class='suggestion' tabIndex='$1' data-value='" + command_start + "'>" + result_txt + "</div>");
                }
            }
        }
        // turn it into a string
        var html_str = '';
        for (var h = 0; h < html.length; h++) {
            html_str += html[h].replace('$1', h+1);
        }
        return html_str;
    },

    submit: function(input) {
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
};

var default_commands = {
    file: findFile,
    ide: ideActions
};

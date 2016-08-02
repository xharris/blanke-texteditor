/*
    [
        regex,
        'match'/'grep'/'file',
        'callbacks'
    ]
*/

$(function(){
    addCommands(default_commands);
})

var findFile = {
    suggest: function(input) {
        if (!b_ide.isProjectSet()) return '';

        var input_parts = input.split('/');
        var html = [];

        var files = proj_tree.children;
        // iterate through already typed path dirs
        for (var p = 0; p < input_parts.length; p++) {
            var part = input_parts[p];

            // find next directory to go down
            for (var f = 0; f < files.length; f++) {
                // TODO: if there is for example, '/.git' and '/.gitattributes', the first one gets priority (make this better)
                if (files[f].name === part) {
                    files = files[f].children;
                }
            }
        }

        // previous suggestion (higher priority)
        for (var r = 0; r < ide_data['recent_files'].length; r++) {
            var full_path = normalizePath(ide_data['recent_files'][r]);
            var file_path = full_path.replace(curr_project,'');
            var prev_path = nwPATH.basename(file_path);

            if (prev_path.startsWith(input)) {
                var result_txt = prev_path.replace(input, "<b>" + input + "</b>");
                html.push("<div class='suggestion high-priority' tabIndex='$1' data-value='" + file_path + "'>" + result_txt + "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + full_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>");
            }
        }

        // create html suggestion array
        for (var f = 0; f < files.length; f++) {
            var file_path = normalizePath(files[f].path).replace(curr_project,'');

            if (file_path.includes(input)) {

                var result_txt = file_path.replace(input, "<b>" + input + "</b>");

                // normal priority suggestion
                if (!ide_data['recent_files'].includes(file_path)) {
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
}

// [command, arg hints]
var ideCommands = [
    ['dev-tools','']
]

var ideActions = {
    suggest: function(input) {
        var input_parts = input.split(' ');
        var html = [];

        // previous suggestion (higher priority)
        for (var r = 0; r < ide_data['recent_ide_commands'].length; r++) {
            var command = ide_data['recent_ide_commands'][r];

            if (command.startsWith(input)) {
                var result_txt = command.replace(input, "<b>" + input + "</b>");
                html.push("<div class='suggestion high-priority' tabIndex='$1' data-value='" + command + "'>" + command + "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + file_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>");
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
    }
}

var default_commands = {
    file: findFile,
    ide: ideActions
}

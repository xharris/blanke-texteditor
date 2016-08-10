$(function(){
    b_search.addCommands(default_commands);
});

var findFile = {
    suggest: function(input) {
        if (!b_ide.isProjectSet()) return '';

        // TODO: add option for case-sensitive searching
        input = input.toLowerCase();
        var input_parts = input.split('/');
        var html = [];

        var files = b_project.tree;
        // iterate through already typed path dirs
        if (files && files.length) {
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
        }

        // previous suggestion (higher priority)
        for (var r = 0; r < b_project.getSetting('recent_files').length; r++) {
            var full_path = normalizePath(b_project.getSetting('recent_files')[r]);
            var file_path = full_path.replace(b_project.curr_project,'');
            var prev_path = nwPATH.basename(file_path);

            if (prev_path.toLowerCase().startsWith(input)) {
                var result_txt = prev_path.replace(input, "<b>" + input + "</b>");
                html.push("<div class='suggestion high-priority' tabIndex='$1' data-value='" + file_path + "'>" + result_txt +  "<span class='full-path'>" + full_path + "</span>" + "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + full_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>");
            }
        }

        // create html suggestion array
        for (var f = 0; f < files.length; f++) {
            var full_path = normalizePath(files[f].path)
            var file_path = full_path.replace(b_project.curr_project,'');

            if (file_path.toLowerCase().includes(input)) {
                var result_txt = file_path.replace(input, "<b>" + input + "</b>");

                // normal priority suggestion
                if (!b_project.getSetting('recent_files').includes(file_path)) {
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
        b_editor.setFile(nwPATH.join(b_project.curr_project, input));
    }
};

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
    file: findFile,
    ide: [ideCommands, ideActions]
};

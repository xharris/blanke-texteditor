/*
    [
        regex,
        'match'/'grep'/'file',
        'callbacks'
    ]
*/

$(function(){
    addCommands(file_commands);
})

var previous_sugg = [];

/*
{
children: array
name
path
folder
}
*/

var findFile = {
    suggest: function(input) {
        var input_parts = input.split('\\');
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

        // create html suggestion array
        for (var f = 0; f < files.length; f++) {
            var file_path = files[f].path.replace(/\//g, '\\').replace(curr_project,'');

            if (file_path.includes(input)) {

                var result_txt = file_path.replace(input, "<b>" + input + "</b>");


                // previous suggestion (higher priority)
                if (previous_sugg.includes(result_txt)) {
                    html.splice(0, 0, "<div class='suggestion high-priority' tabIndex='$1' data-value='" + file_path + "'>" + result_txt + "</div>");
                }
                // normal priority suggestion
                else {
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
        if (previous_sugg.includes(input)) {
            previous_sugg.splice(previous_sugg.indexOf(input), 1, input);
        }
        else {
            // add to previous_sugg array
            previous_sugg.splice(0, 0, input);
        }

        // open file
        b_editor.setFile(nwPATH.join(curr_project, input));
    }
}

var file_commands = {
    file: findFile
}

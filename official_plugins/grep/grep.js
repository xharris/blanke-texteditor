var nwGREP;

$(function() {
    document.addEventListener("plugin_js_loaded", function(e) {
        if (e.detail.plugin.name === "Grep") {
            addCommands(grepCommands);
            var plugin_path = e.detail.plugin.path;
            console.log('its grep! bring in ' + plugin_path);

            nwGREP = require(nwPATH.join(plugin_path, 'node_modules'));
            console.log('grep include');
            console.log(nwGREP);
        }
    });

})

// [command, arg hints]
var grepCommands = [
    ['grep','"<search-text>"']
];

var ideActions = {
    suggest: function(input) {
        var input_parts = input.split(' ');
        var html = [];

        // create html suggestion array
        for (var c = 0; c < grepCommands.length; c++) {
            var command_start = grepCommands[c][0];

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

        if (input_parts[0] === "grep") {
            // remove --options
            // ...
            var search_str = input_parts.slice(1,input_parts.length).join(' ');
            console.log('searching for <' + search_str + '>');
            // do the grep
            // ...
            // add results to result panel (implement later)
            // ...
            // show result panel
            // ...
        }
    }
};

var default_commands = {
    file: findFile,
    ide: ideActions
};

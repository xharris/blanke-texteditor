var nwGREP;

$(function() {
    document.addEventListener("plugin_js_loaded", function(e) {
        if (e.detail.plugin.name === "Grep") {
            b_search.addCommands(grep);
            console.log(e.detail)
            var plugin_path = e.detail.path;
            console.log('its grep! bring in ' + plugin_path);

            nwGREP = require(nwPATH.join(plugin_path, 'node_modules', 'simple-grep'));
        }
    });

})

// [command, arg hints]
var grep_command = [
    ['grep','[search-text]']
];

var grep_action = function(input) {
    var input_parts = input.split(/[ ]+/);

    if (input_parts[0] === "grep") {
        // remove --options
        // ...
        var search_str = input_parts.slice(1,input_parts.length).join(' ');
        console.log('searching for <' + search_str + '>');
        // do the grep
        nwGREP(search_str, b_project.curr_project, function(list){
          console.log(list);
        });
        // add results to result panel (implement later)
        // ...
        // show result panel
        // ...
    }
}

var grep = {
    commands: grep_command,
    action: grep_action
};

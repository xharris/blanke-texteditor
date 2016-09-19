document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "The Plugin Name") {
        // Plugin has loaded
        
        // example
        b_search.addCommands(grep);
        var plugin_path = e.detail.path;

        nwGREP = require(nwPATH.join(plugin_path,'node_modules','the-module'));
    }
});

var grep_command = [
    ['grep','[search-text]']
];

var grep_action = function(input) {
    
}

var grep = {
    commands: grep_command,
    action: grep_action
};
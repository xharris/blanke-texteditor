var nwSERVE;
var nwEXPRESS;

const default_port = 8000;

document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "HTTP Server") {
        // Plugin has loaded
        var plugin_path = e.detail.path;
        nwSERVE = require(nwPATH.join(plugin_path,'node_modules','serve-static'));
        nwEXPRESS = require(nwPATH.join(plugin_path,'node_modules','express'));
        
        b_search.addCommands(plugin_http);
    }
});


// [command, arg hints]
var http_command = [
    ['server start','[index-path] [8000] (start local http server)']
];

var http_action = function(input) {
    var input_parts = input.split(/[ ]+/);
    
    if (input_parts[0] === "server") {
        if (input_parts[1] === "start") {
            var app = nwEXPRESS();
            var index_path = b_project.curr_project;
            
            // server root is specified
            if (input_parts.length > 2 && input_parts[2] !== '.') {
                index_path = nwPATH.join(index_path,input_parts[2]);
            }
            
            // port number is specified
            var port = default_port;
            if (input_parts.length > 3) {
                port = input_parts[3];
            }
            console.log('starting server: ' +index_path+ ' (' +port+ ')');
            app.use(nwSERVE(index_path));
            app.listen(port);
            eSHELL.openExternal('http://localhost:'+port);
        }
    }
};

var plugin_http = {
    commands: http_command,
    action: http_action
}
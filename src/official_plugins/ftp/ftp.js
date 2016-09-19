var nwFTP;
var sesh;

var ftp_path = nwPATH.join(b_project.curr_project, 'ftp');

document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "FTP") {
        
        
        /* Plugin has loaded
        b_search.addCommands(ftp);
        var plugin_path = e.detail.path;

        nwFTP = require(nwPATH.join(plugin_path,'node_modules','ftp'));
        
        sesh = new nwFTP();
        sesh.on('ready', function(){
            sesh.connect({
                host: 'gl.umbc.edu',
                port: 22,
                user: 'xharris1',
                password: 'UMBC57xx',
                //local: ftp_path
            });
        });
        sesh.on('greeting', function(msg) {
            console.log('server: ' + msg)
        });
        */
    }
});

var ftp_command = [
    ['ftp','[search-text]']
];

var ftp_action = function(input) {
    var parts = input.split(/[ ]+/);
    
    if (parts[0] === 'ftp') {
        nwFTP.settings = {
            host: 'gl.umbc.edu',
            user: 'xharris1',
            pass: 'UMBC57xx',
            local: ftp_path
        };
        nwFTP.run(function(err, result){
            console.log(err);
            console.log(result);
        });
    }
}

var ftp = {
    commands: ftp_command,
    action: ftp_action
};
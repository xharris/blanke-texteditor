var b_plugin;

/*
plugin json
{
    "name"
    "version"
    "main" (main js file to include)
    "less" [less files]
}
*/

$(function(){
    b_plugin = {
        loadPlugins: function(plugins) {
            var plugin_names = ide_data['plugins'];

            for (var p = 0; p < plugin_names.length; p++) {
                var p_name = plugin_names[p];
                var p_path = nwPATH.join(nwPROC.cwd(),'data','plugins',p_name);
                var p_info = nwPATH.join(p_path,'plugin.json');

                // look at plugin.json (contains info about plugin)
                var p_json = '';
                try {
                    var stat = nwFILE.lstatSync(p_info);

                    if (stat.isFile()) {
                        p_json = nwFILE.readFileSync(p_info).toString();
                        console.log(p_json)
                        p_json = JSON.parse(p_json);
                        console.log(p_json)
                    }
                } catch (e) {
                    console.log('ERR: unable to load plugin: ' + p_name);
                    return;
                }

                var json_keys = Object.keys(p_json);
                // load css file
                if (json_keys.includes("css")) {
                    for (var c = 0; c < p_json["css"].length; c++) {
                        // check if css file exists
                        var stat = nwFILE.lstatSync(nwPATH.join(p_path, p_json['css'][c]));
                        if (stat.isFile()) {
                            // import css file
                            var fileref=document.createElement("link")
                            fileref.setAttribute("rel", "stylesheet")
                            fileref.setAttribute("type", "text/css")
                            fileref.setAttribute("href", nwPATH.join(p_path, p_json['css'][c]));
                            if (typeof fileref!="undefined") {
                                document.getElementsByTagName("head")[0].appendChild(fileref);
                            }
                        }
                    }
                }

                // load main js file
                if (json_keys.includes("main_js")) {
                    // check if it exists
                    var stat = nwFILE.lstatSync(nwPATH.join(p_path, p_json['main_js']));
                    if (stat.isFile()) {
                        // import js file
                        var fileref=document.createElement('script')
                        fileref.setAttribute("type","text/javascript")
                        fileref.setAttribute("src", nwPATH.join(p_path, p_json['main_js']));
                        if (typeof fileref!="undefined") {
                            document.getElementsByTagName("head")[0].appendChild(fileref);
                        }
                    }
                }

                // other js files
                if (json_keys.includes("js")) {
                    for (var j = 0; j < p_json["js"].length; j++) {
                        // check if it exists
                        var stat = nwFILE.lstatSync(nwPATH.join(p_path, p_json['js'][j]));
                        if (stat.isFile()) {
                            // import js file
                            var fileref=document.createElement('script')
                            fileref.setAttribute("type","text/javascript")
                            fileref.setAttribute("src", nwPATH.join(p_path, p_json['js'][j]));
                            fileref.onload = function() {
                                dispatchEvent("plugin_js_loaded", {
                                    'detail': {
                                        'plugin': p_json
                                    }
                                });
                            }
                            if (typeof fileref!="undefined") {
                                document.getElementsByTagName("head")[0].appendChild(fileref);
                            }
                        }
                    }
                }
            }
        },

        update: function(name) {
            // TODO: implement in the far, post-release future?
        },

        install: function(path) {
            // --- encapsulate everything in try/catch
            // --- in catch, show toast saying 'error installing plugin'

            // create plugin directory using (zip name + random uuid)
            // ...
            // add to ide_data as that dir_name
            // ...
            // unzip into plugin directory
            // ...
            // call loadPlugins for ['<plugin-name>']
        }
    }
});

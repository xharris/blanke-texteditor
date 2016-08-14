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
        plugin_path: nwPATH.join(b_ide.data_folder, 'plugins'),
        official_plugin_path: nwPATH.join('..','official_plugins'),
        
        loadOfficialPlugins: function() {
            nwFILE.readdir(b_plugin.official_plugin_path, function(err, files){
                var names = {};
                for (var p = 0; p < files.length; p++) {
                    names[files[p]] = '';
                }
            })
            b_plugin.loadPlugins({'markdown':'','grep':''}, true);
        },
        
        _loadPlugin: function(p_name, p_path, p_info, is_official) {
            // look at plugin.json (contains info about plugin)
            p_json = '';
            
            nwFILE.lstat(p_info, function(err, stats) {
                if (!err && stats.isFile()) {
                    nwFILE.readFile(p_info, 'utf-8', function(err, data) {
                        if (!err) {
                            p_json = data.toString();
                            p_json = JSON.parse(p_json);
                            p_json.folder_name = p_name;
                            if (!is_official) {
                                b_ide.getData().plugins[p_name] = p_json;
                                
                                b_plugin.refreshPluginViewerList();
                            }
                            // start adding resources to header
                            b_plugin.importPluginResources(p_name, p_json, is_official);
                        }
                    });
                } else {
                   console.log('ERR: unable to load plugin: ' + p_name);
                   b_plugin.removePlugin(p_name);
                   return;
                }
            });
        },
        
        loadPlugins: function(plugins, is_official=false) {
            var plugin_names = Object.keys(plugins);
            var p_path, p_info, p_name, p_json;

            for (var p = 0; p < plugin_names.length; p++) {
                p_name = plugin_names[p];
                p_path = is_official ? nwPATH.join(b_plugin.official_plugin_path, p_name) : nwPATH.join(b_plugin.plugin_path, p_name);
                p_info = nwPATH.join(p_path,'plugin.json');

                b_plugin._loadPlugin(p_name, p_path, p_info, is_official);
            }

        },
        
        importCSS: function(plugin_name, p_css, p_path, load_callback) {
            
            // check if css file exists
            nwFILE.lstat(nwPATH.join(p_path, p_css), function(err, stats){
                if (!err && stats.isFile()) {
                    // import css file
                    var fileref=document.createElement("link");
                    fileref.classList.add("css-" + plugin_name);
                    fileref.setAttribute("rel", "stylesheet");
                    fileref.setAttribute("type", "text/css");
                    fileref.setAttribute("href", nwPATH.join(p_path, p_css));
                    if (load_callback) {
                        fileref.onload = load_callback;
                    }
                    if (fileref !== undefined) {
                        document.getElementsByTagName("head")[0].appendChild(fileref);
                    }
                } else {
                    console.log("ERR: could not load " + path + " for " + p_json.name);
                }
            });
        },
        
        importJS: function(plugin_name, p_js, p_path, load_callback) {
            
            // check if it exists
            nwFILE.lstat(nwPATH.join(p_path, p_js), function(err, stats){
                if (!err && stats.isFile()) {
                    // import js file
                    var fileref=document.createElement('script');
                    fileref.classList.add("js-" + plugin_name);
                    fileref.setAttribute("type","text/javascript");
                    fileref.setAttribute("src", nwPATH.join(p_path, p_js));
                    if (load_callback) {
                        fileref.onload = load_callback;
                    }
                    if (typeof fileref!="undefined") {
                        document.getElementsByTagName("head")[0].appendChild(fileref);
                    }
                }                        
            });
        },
        
        importPluginResources: function(plugin_name, p_json, is_official=false) {
            var p_path = is_official ? nwPATH.join(b_plugin.official_plugin_path, plugin_name) : nwPATH.join(b_plugin.plugin_path, plugin_name);
            var json_keys = Object.keys(p_json);
            
            // load css files
            if (json_keys.includes("css")) {
                p_json.css.forEach(function(p_css){
                    b_plugin.importCSS(plugin_name, p_css, p_path);
                });
            }
            
            // other js files
            if (json_keys.includes("js")) {
                p_json.js.forEach(function(p_js){
                    b_plugin.importJS(plugin_name, p_js, p_path, function(){
                        console.log('loaded ' + p_js);
                    });
                });
            }

            // load main js file
            if (json_keys.includes("main_js")) {
                b_plugin.importJS(plugin_name, p_json.main_js, p_path, function(){
                    dispatchEvent("plugin_js_loaded", {
                        'detail': {
                            'plugin': p_json,
                            'path': p_path
                        }
                    });
                });
            }
            
        },

        update: function(name) {
            // TODO: implement in the far, post-release future?
        },

        install: function(path) {
            // --- encapsulate everything in try/catch
            // --- in catch, show toast saying 'error installing plugin'

            // if path is undefined or a blank string show file dialog
            if (path == undefined || path === "") {
                chooseFile(path, this._install);
            } else {
                chooseFile(path, this._install);
            }
        },

        _install: function(path) {
            path = path[0];
            // create ide plugin directory
            nwFILE.mkdir(nwPATH.join(b_plugin.plugin_path), function(){
                
                // create plugin directory using (zip name + random uuid)
                var zipname = nwPATH.basename(path, nwPATH.extname(path));
                var folder_name = zipname + "_" + zipname.hashCode();
                var folder_path = nwPATH.join(b_plugin.plugin_path,folder_name);
                    
                if (!b_ide.hasPlugin(folder_name)) {
                    // add to ide_data as that dir_name
                    b_ide.getData().plugins[folder_name] = {};
                
                    nwFILE.mkdir(folder_path, function(){
                        // unzip into plugin directory
                        nwFILE.createReadStream(path).pipe(nwZIP.Extract({ path: folder_path }).on("close", function(){
                            // call loadPlugins for ['<plugin-name>']
                            b_plugin.loadPlugins(b_ide.getData().plugins);
                            b_plugin.refreshPluginViewerList();
                        }));
                    });
                } else {
                    b_ide.addToast({
                        message: labels.plugin + ' ' + b_ide.getData().plugins.name + ' is already installed',
                        can_dismiss: true,
                        timeout: 1000
                    });
                }

            });


        },

        uninstallPlugin: function(plugin_name) {
            var p_name = b_ide.getData().plugins[plugin_name].name;
            
            // remove from list
            delete b_ide.getData().plugins[plugin_name];
            
            // remove plugin folder
            nwRAF(nwPATH.join(b_plugin.plugin_path,plugin_name), function() {
                $(".js-" + plugin_name).remove();
                $(".css-" + plugin_name).remove();

                b_ide.addToast({
                    message: 'removed ' + labels.plugin + ' ' + p_name,
                    can_dismiss: true,
                    timeout: 1000
                });
                
                
                b_plugin.refreshPluginViewerList();
            });
        },

        showViewer: function() {
            b_plugin.refreshPluginViewerList();
            $(".plugin-viewer").addClass("active");
        },

        refreshPluginViewerList: function() {
            // print plugin list
            $(".plugin-viewer > .list").empty();
            var list_html = '';

            for (var p = 0; p < Object.keys(b_ide.getData().plugins).length; p++) {
                var p_name = Object.keys(b_ide.getData().plugins)[p];
                var p_json = b_ide.getData().plugins[p_name];
                
                list_html += ""+
                "<div class='plugin " + p_name + "'>"+
                    "<span class='name'>" + p_json.name + "</span>"+
                    "<span class='plugin-actions'>"+
                        "<button class='btn-delete' onclick='b_plugin.uninstallPlugin(\"" + p_json.folder_name + "\")' title='Remove plugin (requires restart)'><i class='mdi mdi-delete'></i></button>"+
                    "</span>"+
                "</div>";

            }
            $(".plugin-viewer > .list").html(list_html);
        },

        // incomplete
        removePlugin: function(plugin_name) {
            var p_path = nwPATH.join(b_plugin.plugin_path,plugin_name);
            
            $(".plugin ." + plugin_name).addClass("removed");
            b_ide.getData()['plugins'].splice(b_ide.getData()['plugins'].indexOf(plugin_name), 1);
            
        },

        hideViewer: function() {
            $(".plugin-viewer").removeClass("active");
        }
    };
    
});

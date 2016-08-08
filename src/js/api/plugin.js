var b_plugin,
    plugin_info = {};

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
            var plugin_names = plugins;

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
                        p_json = JSON.parse(p_json);
                        plugin_info[p_name] = p_json;
                        plugin_info[p_name].folder_name = p_name;
                    }
                } catch (e) {
                    console.log('ERR: unable to load plugin: ' + p_name);
                    b_plugin.removePlugin(p_name);
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
                            fileref.classList.add("css-" + p_name);
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
                        fileref.classList.add("js-" + p_name);
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
                            fileref.classList.add("js-" + p_name);
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

            b_plugin.refreshPluginViewerList();
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

            // create plugin directory using (zip name + random uuid)
            var folder_name = nwPATH.basename(path, nwPATH.extname(path)) + "_" + guid();
            var folder_path = nwPATH.join(nwPROC.cwd(),'data','plugins',folder_name);
            nwFILE.mkdirSync(folder_path);

            // add to ide_data as that dir_name
            ide_data['plugins'].push(folder_name);

            // unzip into plugin directory
            nwFILE.createReadStream(path).pipe(nwZIP.Extract({ path: folder_path }).on("close", function(){
                // call loadPlugins for ['<plugin-name>']
                b_plugin.loadPlugins([folder_name]);
            }));
        },

        uninstallPlugin: function(plugin_name) {
            // remove plugin folder
            nwRAF(nwPATH.join(nwPROC.cwd(),'data','plugins',plugin_name), function() {
                // remove from list
                delete plugin_info[plugin_name];
                ide_data['plugins'].splice(ide_data['plugins'].indexOf(plugin_name), 1);

                $(".js-" + plugin_name).remove();
                $(".css-" + plugin_name).remove();

                b_plugin.refreshPluginViewerList();

                addToast({
                    message: 'removed ' + labels['project'] + ' ' + plugin_info[plugin_name].name,
                    can_dismiss: true,
                    timeout: 1000
                });
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

            for (var p = 0; p < ide_data['plugins'].length; p++) {
                var p_dirname = ide_data['plugins'][p];
                var p_info = plugin_info[p_dirname];
                try {
                    var stat = nwFILE.lstatSync(nwPATH.join(nwPROC.cwd(),'data','plugins',p_dirname));

                    if (stat.isDirectory()) {
                        list_html += ""+
                        "<div class='plugin " + p_dirname + "'>"+
                            "<span class='name'>" + p_info.name + "</span>"+
                            "<span class='plugin-actions'>"+
                                "<button class='btn-delete' onclick='b_plugin.uninstallPlugin(\"" + p_info.folder_name + "\")' title='Remove plugin (requires restart)'><i class='mdi mdi-delete'></i></button>"+
                            "</span>"+
                        "</div>";
                    } else {
                        b_plugin.removePlugin(p_dirname);
                    }
                } catch(e) {
                    b_plugin.removePlugin(p_dirname);
                }

            }
            $(".plugin-viewer > .list").html(list_html);
        },

        // incomplete
        removePlugin: function(plugin_name) {
            $(".plugin ." + plugin_name).addClass("removed");
            ide_data['plugins'].splice(ide_data['plugins'].indexOf(plugin_name), 1);
        },

        hideViewer: function() {
            $(".plugin-viewer").removeClass("active");
        }
    };
});

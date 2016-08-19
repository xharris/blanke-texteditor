var b_project;
var MAX_PATH_LIST_LENGTH = 3;

var project_settings_template = {
    unsaved_text: {},   // save text from unsaved files from each project
    recent_files: [],   // recently searched files from each project
    history: {},
    cursor_pos: {},
    recent_ide_commands: [], // recently used ide commands
    curr_file: '',
    can_refresh: []
}


   

$(function(){
    b_project = {
        settings: copyObj(project_settings_template),
        curr_project: '',
        curr_file: '',      // currently opened file
        data_path: '',
        tree: '',

        setSetting: function(setting_name, new_value) {
            if (b_ide.isProjectSet()) {
                //console.log('set ' + b_project.curr_project + ' > ' + setting_name + ' = ' + new_value);
                b_project.settings[setting_name] = new_value;
            }
        },

        getSetting: function(setting_name) {
            if (b_ide.isProjectSet()) {
                return b_project.settings[setting_name];
            } else {
                return project_settings_template[setting_name];
            }
        },

        addFolder: function(path) {
            path = normalizePath(path);

            // don't add project if it was previously added
            if (b_ide.getData()['project_paths'].includes(path)) {
                b_ide.addToast({
                    message: labels['project'] + ' already added',
                    can_dismiss: true,
                    timeout: 1000
                });
                return;
            }
            var folder_name = nwPATH.basename(path);

            b_ide.getData()['project_paths'].push(path);
            b_project.settings = copyObj(project_settings_template);

            b_ide.addToast({
                message: 'added ' + labels['project'] + ' ' + folder_name,
                can_dismiss: true,
                timeout: 1000
            });

            if (b_ide.getData()['project_paths'].length == 1) {
                b_project.setFolder(path);
            } else {
                b_project._refreshList();
            }
            b_ide.saveData();
        },
        
        removeFolder: function(path) {
            var path_list = b_ide.getData()['project_paths'].includes(path);
            
            if (path_list.includes(path)) {
                path_list.splice(path_list.indexOf(path), 1);
                b_project._refreshList();
                
                // did the user have this project open?
                if (b_ide.getData()['current_project'] === path) {
                    // are there any other projects?
                    // ...
                    // YES: open the first project on the list
                    // ...
                    // NO: reset editor and everything
                    b_editor.clear();
                }
            }  
        },

        // reset attributes and things to default values
        reset: function() {
            b_project.curr_file = '';
            b_project.settings = copyObj(project_settings_template);
            b_project.curr_project = '';
            b_project.curr_file = '';      // currently opened file
            b_project.data_path = '';
            b_project.tree = [];
        },

        setFolder: function(new_path) {
            if (new_path === undefined || new_path === "") return;

            b_project.saveData(function(){

                // reset things
                b_history.clear();
                b_project.reset();

                // set current project in settings
                b_ide.getData()['current_project'] = normalizePath(new_path);

                // set current project in ide
                b_project.curr_project = b_ide.getData()['current_project'];
                var proj_hashCode = new_path.hashCode();
                b_project.data_path = nwPATH.join(b_ide.data_folder, proj_hashCode + '.json');

                b_search.clear();
                b_editor.clear();
                b_project.loadData(function(){

                    $(".suggestions").removeClass("active");

                    b_history.loadHistory(b_project.settings.history);
                    b_project.refreshTree(b_project.curr_project);

                    // TODO: will be a problem once alerts is implemented and USED (huh?)
                    b_editor.setFile(b_project.getSetting("curr_file"),true);

                    // TODO: needs a closer look at. will this continue to watch previous projects?
                    nwFILE.watch(b_project.curr_project, {'recursive':true}, (eventType, filename) => {
                        console.log(eventType + ': ' + filename);
                        b_project.refreshTree();
                    })

                     // limit path to 3 levels 
                     var short_path = b_project.curr_project;
                    var path_parts = b_project.curr_project.split(nwPATH.sep);
                    if (path_parts.length > MAX_PATH_LIST_LENGTH) {
                        short_path = '...' + path_parts.splice(path_parts.length - 3, 3).join(nwPATH.sep);
                    }
                    
                    b_ide.addToast({
                        message: 'set ' + labels.project + ' ' + short_path,
                        can_dismiss: true,
                        timeout: 1000
                    });
                    b_project._refreshList();

                    dispatchEvent("post_set_project", {
                        'detail': {
                            'project': b_project.curr_project
                        }
                    });
                });
            });
        },

        // refreshes the SELECT element containing a list of folders
        _refreshList: function() {
            // remake project list
            $(".projects").empty();
            var proj_html = '';
            var project_paths = b_ide.getData()['project_paths'];
            for (var p = 0; p < project_paths.length; p++) {
                var full_path = project_paths[p];
                var path = full_path;
                
                // limit path to 3 levels 
                var path_parts = path.split(nwPATH.sep);
                if (path_parts.length > MAX_PATH_LIST_LENGTH) {
                    path = '...' + path_parts.splice(path_parts.length - 3, 3).join(nwPATH.sep);
                }
                
                var selected = '';
                if (full_path === b_project.curr_project) {
                    selected = "selected";
                }
                proj_html += "<option value='" + path + "' " + selected + " title='" + full_path + "' value='" + full_path + "'>" + path + "</option>";
            }
            $(".projects").html(proj_html);
        },

        refreshTree: function(path, callback) {
            b_ide.showProgressBar();
            $("#in-search").prop('disabled', true);
            
            var the_path = nwPATH.normalize(b_project.curr_project)
            emitter = nwWALK(the_path);
            
            // add file path
            emitter.on('file', function(filename, stat) {
                b_project.tree += '\"' + normalizePath(filename) + '\" ';   
            });
            
            // add empty folder paths only
            emitter.on('empty', function(dirname, stat) {
                b_project.tree += '\"' + normalizePath(dirname) + '/\" '; 
            });
            
            // done walking the directories
            emitter.on('end', function(){ 
                b_ide.hideProgressBar();
                $("#in-search").prop('disabled', false);
                if (callback) {
                    callback(b_project.tree);
                }
            });
        },

        // load ide .json file or make a new one if it doesn't exist
        loadData: function(done_callback) {
            nwFILE.lstat(b_project.data_path, function(err, stats) {
                if (!err && stats.isFile()) {
                    nwFILE.readFile(b_project.data_path, 'utf-8', function(err, data) {
                        if (!err) {
                            try {
                                b_project.settings = JSON.parse(data);
                            } catch (e) {
                                console.log('ERR: could\'t load project for whatever reason. probably unexpected end of json.')
                            }
                                if (done_callback) {
                                    done_callback();
                                }
                        }
                    });
                } else {
                    console.log('ERR: cannot find project file. creating new one.');
                    b_project.settings = copyObj(project_settings_template);
                    b_project.saveData(function(){
                        b_project.loadData(done_callback);
                    });
                }
            });
        },

        // save current project's .blanke file
        saveData: function(done_callback) {
            if (b_ide.isProjectSet()) {
                b_project.settings.history = b_history.save();
                nwFILE.mkdir(nwPATH.join(eAPP.getPath("userData"),'data'), function() {
                    // save ide settings file
                    nwFILE.writeFile(b_project.data_path, JSON.stringify(b_project.settings), {flag: 'w+'}, function() {
                        if (done_callback) {
                            done_callback();
                        }
                    });
                });
            } else {
                if (done_callback) {
                    done_callback();
                }
            }
        }
    }

});

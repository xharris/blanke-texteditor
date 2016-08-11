var b_project;

var project_settings_template = {
    unsaved_text: {},   // save text from unsaved files from each project
    recent_files: [],   // recently searched files from each project
    history: {},
    cursor_pos: {},
    recent_ide_commands: [], // recently used ide commands
    curr_file: ''
}

$(function(){
    b_project = {
        settings: copyObj(project_settings_template),
        curr_project: '',
        curr_file: '',      // currently opened file
        data_path: '',
        tree: [],

        setSetting: function(setting_name, new_value) {
            if (b_ide.isProjectSet()) {
                //console.log('set ' + b_project.curr_project + ' > ' + setting_name + ' = ' + new_value);
                b_project.settings[setting_name] = new_value;
            }
        },

        getSetting: function(setting_name) {
            if (b_ide.isProjectSet()) {
                //console.log('get ' + b_project.curr_project + ' > ' + setting_name);
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
                    b_editor.setFile(b_project.getSetting("curr_file"));

                    /* TODO: needs a closer look at. will this continue to watch previous projects?
                    nwFILE.watch(b_project.curr_project, (eventType, filename) => {
                        if (filename) {
                            b_project.refreshTree(b_project.curr_project);
                        }
                    })*/

                    b_ide.addToast({
                        message: 'set ' + labels['project'] + ' ' + b_project.curr_project,
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

        _refreshList: function() {
            // remake project list
            $(".projects").empty();
            var proj_html = '';
            var project_paths = b_ide.getData()['project_paths'];
            for (var p = 0; p < project_paths.length; p++) {
                var path = project_paths[p];
                var selected = '';
                if (path === b_project.curr_project) {
                    selected = "selected='selected'";
                }
                proj_html += "<option value='" + path + "' " + selected + " >" + path + "</option>";
            }
            $(".projects").html(proj_html);
        },

        refreshTree: function(path, callback) {
            b_ide.showProgressBar();
            $("#in-search").prop('disabled', true);
            dirTree(path, function(err, res) {
                if (!err) {
                    b_project.tree = res;
                    b_ide.hideProgressBar();
                    $("#in-search").prop('disabled', false);

                    if (callback) {
                        callback(res);
                    }
                }
            })
        },

        // load current project's .blanke file or make a new one if it doesn't exist
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

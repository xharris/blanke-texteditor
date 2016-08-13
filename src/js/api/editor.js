var b_editor;

$(function(){
    b_editor = {
        font_size: 14,

        // removes currently active file
        clear: function() {
            editor.setValue('');
        },

        setFile: function(file_path,loading=false) {
            if (file_path === undefined || file_path.length <= 1) return;

            b_ide.hideSideContent();

            file_path = nwPATH.normalize(file_path);
            
            if (b_project.getSetting('curr_file') !== '' && !loading) {
                b_project.getSetting('unsaved_text')[b_project.getSetting('curr_file')] = editor.getValue();
                b_history.refreshList();
            }
            
            nwFILE.lstat(file_path, function(err, stats) {
                if (!err && stats.isFile()) {
                    // has file been edited earlier without saving?
                    if (Object.keys(b_project.getSetting("unsaved_text")).includes(file_path)) {
                        editor.setValue(b_project.getSetting("unsaved_text")[file_path]);
                        b_editor.post_setFile(file_path);
                    }
                    // file has not been previously edited and will be loaded 'classically'
                    else {
                        nwFILE.readFile(file_path, 'utf-8', function(err, data) {
                            if (!err) {
                                $("#suggestions").removeClass("active");
                                editor.setValue(data);
                                editor.clearSelection();
                                b_editor.post_setFile(file_path);
                            }
                        });
                    }

                    // add file to b_project.getSetting('recent_files')
                    var new_recent = nwPATH.basename(file_path);
                    b_search.removeSuggestion(file_path);
                    b_search.addSuggestion(file_path);

                    b_history.addFile(file_path);

                    b_project.setSetting('curr_file', file_path);
                    dispatchEvent("editor_set_file", {
                        'detail': {
                            'file': file_path
                        }
                    });
                    b_ide.saveData();

                    b_editor.setModeFromFile(file_path);
                    b_ide.setWinTitle(file_path.replace(b_project.curr_project,''));

                } else {
                    // ask user if they want to create the file
                    b_alert.showYesNo({
                        message: "\"" + file_path + "\" does not exist. <br><br><b>Would you like to create this file?<b>",
                        // YES
                        onYes: function(ans) {
                            // make the file!
                            nwFILE.writeFileSync(
                                file_path,
                                "",
                                {
                                    flag: 'w+'
                                }
                            );
                            b_editor.setFile(file_path);
                        },
                        // NO
                        onNo: function (ans) {
                            // remove the file from existence
                            b_history.removeFile(file_path);
                        }
                    });

                    return;
                }
            });
        },

        post_setFile: function(file_path) {
            if (Object.keys(b_project.getSetting('cursor_pos')).includes(file_path)) {
                editor.gotoLine(b_project.getSetting('cursor_pos')[file_path].row, b_project.getSetting('cursor_pos')[file_path].column);
            }
            // reset undos
            editor.getSession().setUndoManager(new ace.UndoManager());
            b_editor.focus();
        },

        saveFile: function() {
            if (b_project.getSetting('curr_file') !== '') {
                    nwFILE.writeFileSync(
                        b_project.getSetting('curr_file'),
                        editor.getValue(),
                        {
                            flag: 'w+'
                        }
                    )
                    delete b_project.getSetting("unsaved_text")[b_project.getSetting("curr_file")];
                    b_history.refreshList();
                    console.log("saved")
                //} catch (e) {

                //}
            }
        },

        setMode: function(new_mode) {
            //if (b_project.getOption("syntax_highlighting")) {
                editor.getSession().setMode(new_mode);
            //}
        },

        setModeFromFile: function(file) {
            var mode = aceModeList.getModeForPath(file).mode;
            b_editor.setMode(mode);
        },

        focus: function(file) {
            editor.focus();
        },

        zoom: function(amt) {
            b_editor.setZoom(b_editor.font_size + amt);
        },

        setZoom: function(amt) {
            b_editor.font_size = amt;
            editor.setFontSize(b_editor.font_size);
            b_ide.setOption('editor', 'zoom', b_editor.font_size);
            b_ide.saveData();
        }
    }
});

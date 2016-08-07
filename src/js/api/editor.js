var b_editor;

$(function(){
    b_editor = {
        font_size: 14,

        setFile: function(file_path) {
            if (file_path === undefined) return;

            b_ide.hideSideContent();

            file_path = nwPATH.normalize(file_path);
            try {
                var stat = nwFILE.lstatSync(file_path);
            } catch (e) {
                // ask user if they want to create the file
                b_alert.showYesNo({
                    message: "\"" + file_path + "\" does not exist. <br><br><b>Would you like to create this file?<b>",
                    // YES
                    onYes: function(ans) {
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
                        // show file not found toast
                    }
                });

                return;
            }

            if (stat.isFile()) {
                // has file been edited earlier without saving?
                if (Object.keys(getProjectSetting("unsaved_text")).includes(file_path)) {
                    editor.setValue(getProjectSetting("unsaved_text")[file_path]);
                    this.post_setFile(file_path);
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

                // add file to getProjectSetting('recent_files')
                var new_recent = nwPATH.basename(file_path);
                b_search.removeSuggestion(file_path);
                b_search.addSuggestion(file_path);

                b_history.addFile(file_path);

                setProjectSetting('curr_file', file_path);
                dispatchEvent("editor_set_file", {
                    'detail': {
                        'file': file_path
                    }
                });
                saveData();

                this.setModeFromFile(file_path);
                winSetTitle(file_path.replace(curr_project,''));
            }
        },

        post_setFile: function(file_path) {
            if (Object.keys(getProjectSetting('cursor_pos')).includes(file_path)) {
                editor.gotoLine(getProjectSetting('cursor_pos')[file_path].row, getProjectSetting('cursor_pos')[file_path].column);
            }
            this.focus();
        },

        saveFile: function() {
            if (getProjectSetting('curr_file') !== '') {
                //try {
                    nwFILE.writeFileSync(
                        getProjectSetting('curr_file'),
                        editor.getValue(),
                        {
                            flag: 'w+'
                        }
                    )
                    delete getProjectSetting("unsaved_text")[getProjectSetting("curr_file")];
                    b_history.refreshList();
                    console.log("saved")
                //} catch (e) {

                //}
            }
        },

        setMode: function(new_mode) {
            editor.getSession().setMode(new_mode);
        },

        setModeFromFile: function(file) {
            var mode = aceModeList.getModeForPath(file).mode;
            editor.getSession().setMode(mode);
        },

        focus: function(file) {
            editor.focus();
        },

        zoom: function(amt) {
            this.setZoom(this.font_size + amt);
        },

        setZoom: function(amt) {
            this.font_size = amt;
            editor.setFontSize(this.font_size);
            b_ide.setOption('editor', 'zoom', this.font_size);
            saveData();
        }
    }
});

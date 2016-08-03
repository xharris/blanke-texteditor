var b_editor;

$(function(){
    b_editor = {
        font_size: 12,

        setFile: function(file_path) {
            //try {
                file_path = nwPATH.normalize(file_path);
                var stat = nwFILE.lstatSync(file_path);

                if (stat.isFile()) {
                    nwFILE.readFile(file_path, 'utf-8', function(err, data) {
                        if (!err) {
                            $("#suggestions").removeClass("active");
                            editor.setValue(data);
                            editor.clearSelection();
                            this.focus();
                        }
                    });

                    // add file to ide_data['recent_files']
                    var new_recent = nwPATH.basename(file_path);
                    b_search.removeSuggestion(file_path);
                    b_search.addSuggestion(file_path);

                    b_history.addFile(file_path);

                    ide_data['curr_file'] = file_path;
                    saveData();

                    this.setModeFromFile(file_path);
                    winSetTitle(file_path.replace(curr_project,''));
                }

            //} catch (e) {

            //}
        },

        saveFile: function() {
            if (ide_data['curr_file'] !== '') {
                try {
                    nwFILE.writeFileSync(
                        ide_data['curr_file'],
                        editor.getValue(),
                        {
                            flag: 'w+'
                        }
                    )
                } catch (e) {

                }
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
            this.font_size += amt;
            editor.setFontSize(this.font_size);
            ide_data['zoom'] = this.font_size;
            saveData();
        }
    }
});

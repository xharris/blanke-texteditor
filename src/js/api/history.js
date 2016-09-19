var b_history;

$(function(){
    b_history = {
        history_index: 0,
        history: [],
        file_activity: {}, // how often files are accessed
        old_files: [],
        max_history_length: 6,

        loadHistory: function(data) {
            if (data !== undefined) {
                this.history_index = data.history_index;
                this.history = data.history;
                this.file_activity = data.file_activity
                b_history.refreshList();
            }
        },

        save: function() {
            return {
                history_index: this.history_index,
                history: this.history,
                file_activity: this.file_activity
            }
        },

        refreshList: function() {
            $(".file-history").empty();
            // create element for each history index
            var full_path,
                file_name;
            for (var h = this.history.length - 1; h >= 0; h--) {
                var is_current = '';
                var is_not_saved = '';
                var is_old = '';

                full_path = this.history[h];
                file_name = nwPATH.basename(full_path);
                
                // is there another file with the same basename
                var dupe_count = 0;
                for (var s = 0; s < this.history.length; s++) {
                    if (nwPATH.basename(this.history[s]) === file_name) {
                        dupe_count++;
                    }
                }
                //console.log(file_name ' dupes ' + dupe_count)
                if (dupe_count > 1) {
                    var path_parts = full_path.split(nwPATH.sep);
                    file_name = nwPATH.join(path_parts[path_parts.length - 2], path_parts[path_parts.length - 1]);
                }

                // is this the file that is currenty opened/being edited
                if (h == this.history_index) {
                    is_current = ' is-open';
                }
                // has the file been edited without being saved
                if (Object.keys(b_project.getSetting('unsaved_text')).includes(full_path)) {
                    is_not_saved = '*';
                }
                // is this an old file that will be removed soon?
                if (this.old_files.includes(full_path)) {
                    is_old = ' is-old'
                }
                $(".file-history").append("<span class='file" + is_current + is_old + "' data-path='" + full_path + "' title='" + full_path + "' onclick='b_history.goToPosition(" + h + ");'>" + file_name + is_not_saved + "</span>");

            }
            /* clear history button
            if (this.history.length > 0) {
                $(".file-history").append("<button class='clear-history' onclick='b_history.clear(true);' title='Clear history'><i class='mdi mdi-close'></i></button>");
            }
            */

            var file_open = $(".file-history > .file.is-open")[0];
            if (file_open !== undefined) {
                file_open.scrollIntoView({
                    behavior: "smooth"
                });
            }
        },

        addFile: function(path) {
            if (this.history.includes(path)) {
                this.history.splice(this.history.indexOf(path), 1);
            }
            this.history.splice(this.history_index, 0, path);
            
            // increment all file activity numbers
            var activity_paths = Object.keys(this.file_activity);
            for (var a = 0; a < activity_paths.length; a++){
                var other_path = activity_paths[a];
                this.file_activity[other_path]++;
            }
            
            // add to file activity
            this.file_activity[path] = 0;
            
            this.cleanHistory();
            
            this.refreshList();
            b_ide.saveData();
        },
        
        removeFile: function(path) {
            // save currently selected file
            var curr = this.history[this.history_index];
            
            // remove file
            var del_index = this.history.indexOf(path);
            if (this.history.includes(path)) {
                this.history.splice(this.history.indexOf(path), 1);
            }
            
            // remove from activity paths
            delete this.file_activity[path];
            
            // set index to currently selected file if it wasnt the removed one
            if (del_index != this.history_index) {
                this.history_index = this.history.indexOf(curr);
            } else {
                this.goToPosition(this.history_index);
            }
            
            this.cleanHistory();
            this.refreshList();
            b_ide.saveData();
        },
        
        // finds old history values that should be removed due to inactivity
        cleanHistory: function() {
            this.old_files = [];
            var activity_paths = Object.keys(this.file_activity);
            $(".file-history > .file").removeClass("is-old");
            
            var max_num = 1;
            var second_max = 1;
            // mark files that are getting old and will be removed
            if (this.history.length > this.max_history_length - 1) {
                // get max
                for (var m = 0; m < activity_paths.length; m++) {
                    var path = activity_paths[m];
                    if (this.file_activity[path] > max_num) {
                        second_max = max_num;
                        max_num = this.file_activity[path];
                    } else if (this.file_activity[path] > second_max) {
                        second_max = this.file_activity[path];
                    }
                }
                
                // mark the old files as... old
                for (var o = 0; o < activity_paths.length; o++) {
                    var path = activity_paths[o];
                    
                    // history will break limit on next fileadd
                    if (this.history.length == this.max_history_length - 1) {
                        if (this.file_activity[path] == second_max) {
                            this.old_files.push(path);
                        }
                    } else {
                        // history limit is broken and a fill will disappear
                        if (this.file_activity[path] == max_num) {
                            this.old_files.push(path);
                        }
                    }
                }
            }
            
            // clear out old history :)
            if (this.history.length > this.max_history_length) { // TODO: add to options
                // remove the weakest links!
                for (var w = 0; w < activity_paths.length; w++) {
                    var path = activity_paths[w];
                    if (this.file_activity[path] == max_num) {
                        this.removeFile(path);   
                    }
                }
            }
        },

        goToPosition: function(position) {
            if (this.history == 0) {
                b_editor.clear();
            } else {
                // set the file
                this.history_index = position
                var new_path = this.history[position];
                b_editor.setFile(new_path);
                
                // increment all file activity numbers
                var activity_paths = Object.keys(this.file_activity);
                for (var a = 0; a < activity_paths.length; a++){
                    var path = activity_paths[a];
                    this.file_activity[path]++;
                }
                
                // reset activity number of current file
                this.file_activity[new_path] = 0;

                this.cleanHistory();
                this.refreshList();
            }
        },

        back: function() {
            if (this.history_index < this.history.length - 1) {
                this.goToPosition(this.history_index + 1);
            }
        },

        forward: function() {
            if (this.history_index > 0) {
                this.goToPosition(this.history_index - 1);
            }
        },

        clear: function(keep_curr_file=false) {
            this.history = [];
            this.history_index = 0;
            this.file_activity = {};

            // add currently opened file as first value in history
            if (keep_curr_file) {
                this.addFile(b_project.getSetting("curr_file"));
            }
        }
    }
    
    // right click: delete 
    $(".file-history").on('contextmenu', '.file', function(){
        var path = $(this).data('path');
        b_history.removeFile(path);
        console.log(path);
    })
});

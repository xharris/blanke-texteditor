var b_history;

$(function(){
    b_history = {
        history_index: 0,
        history: [],

        loadHistory: function(data) {
            if (data !== undefined) {
                this.history_index = data.history_index;
                this.history = data.history;
                b_history.refreshList();
            }
        },

        save: function() {
            return {
                history_index: this.history_index,
                history: this.history
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

                full_path = this.history[h];
                file_name = nwPATH.basename(this.history[h]);

                // is this the file that is currenty opened/being edited
                if (h == this.history_index) {
                    is_current = ' is-open';
                }
                // console.log(Object.keys(b_project.getSetting('unsaved_text')));
                if (Object.keys(b_project.getSetting('unsaved_text')).includes(full_path)) {
                    is_not_saved = '*';
                }
                $(".file-history").append("<span class='file" + is_current + "' title='" + full_path + "' onclick='b_history.goToPosition(" + h + ");'>" + file_name + is_not_saved + "</span>");

            }
            // clear history button
            if (this.history.length > 0) {
                $(".file-history").append("<button class='clear-history' onclick='b_history.clear(true);' title='Clear history'><i class='mdi mdi-close'></i></button>");
            }

            var file_open = $(".file-history > .file.is-open")[0];
            if (file_open !== undefined) {
                file_open.scrollIntoView({
                    behavior: "smooth"
                });
            }
        },

        addFile: function(path) {
            console.log('history add: ' + path);
            if (this.history.includes(path)) {
                this.history.splice(this.history.indexOf(path), 1);
            }
            this.history.splice(this.history_index, 0, path);
            this.refreshList();
            b_ide.saveData();
        },

        goToPosition: function(position) {
            this.history_index = position
            var new_path = this.history[position];
            b_editor.setFile(new_path);
            this.refreshList();
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

            // add currently opened file as first value in history
            if (keep_curr_file) {
                this.addFile(b_project.getSetting("curr_file"));
            }
            console.log('cleared history');
            console.log(this.history);
        }
    }
});

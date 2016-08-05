var b_history;

$(function(){
    b_history = {
        history_index: 0,
        history: [],

        load: function(data) {
            if (data !== undefined) {
                this.history_index = data['history_index'];
                for (var h = 0; h < data['history'].length; h++) {
                    this.addFile(data['history'][h]);
                }
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
                // console.log(Object.keys(getProjectSetting('unsaved_text')));
                if (Object.keys(getProjectSetting('unsaved_text')).includes(full_path)) {
                    is_not_saved = '*';
                }
                $(".file-history").append("<span class='file" + is_current + "' title='" + full_path + "' onclick='b_history.goToPosition(" + h + ");'>" + file_name + is_not_saved + "</span>");

            }

            $(".file-history > .file.is-open")[0].scrollIntoView({
                behavior: "smooth"
            });
        },

        addFile: function(path) {
            if (this.history.includes(path)) {
                this.history.splice(this.history.indexOf(path), 1);
            }
            this.history.splice(this.history_index, 0, path);
            this.refreshList();
            saveData();
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
        }
    }
});

var b_history;

$(function(){
    b_history = {
        history_index: 0,
        history: [],

        load: function(data) {
            console.log(data);
            if (data != undefined) {
                this.history_index = data.history_index;
                this.history = data.history;
            }
        },

        save: function() {
            return {
                history_index: this.history_index,
                history: this.history
            }
        },

        refreshList: function() {
            // create element for each history index
            // ...
            // add them to history list
            // ...
        },

        addFile: function(path) {
            if (this.history.includes(path)) {
                this.history.splice(this.history.indexOf(path), 1);
            }
            this.history.unshift(path);
            saveData();
        },

        goToPosition: function(position) {
            var new_path = history[position];
            b_editor.setFile(new_path);
        },

        back: function() {
            if (this.history_index > 0) {
                this.goToPosition(this.history_index - 1);
            }
        },

        forward: function() {
            if (this.history_index < this.history.length - 1) {
                this.goToPosition(this.history_index + 1);
            }
        }
    }
});

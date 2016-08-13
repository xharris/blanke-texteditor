var b_search;
var search_box_options;

$(function(){
    b_search = {
        options: {},
        curr_type: '',
        commands: [],
        cmd_submit: [],

        // clear in-search input value
        clear: function() {
            $("#in-search").val('');
        },

        removeSuggestion: function(sugg_val) {
            sugg_val = normalizePath(sugg_val);
            if (b_project.getSetting('recent_files').includes(sugg_val)) {
                console.log('removing ' + sugg_val);
                console.log(b_project.getSetting("recent_files"))
                b_project.getSetting('recent_files').splice(b_project.getSetting('recent_files').indexOf(sugg_val), 1);
            }
            b_ide.saveData();
        },

        addSuggestion: function(sugg_val) {
            sugg_val = normalizePath(sugg_val);
            if (!b_project.getSetting('recent_files').includes(sugg_val)) {
                b_project.getSetting('recent_files').unshift(sugg_val);
                b_ide.saveData();
            }
        },

        isFocus: function() {
            return $("#in-search").is(":focus");
        },

        focus: function() {
            b_search.clear();
            $("#in-search").focus();
        },

        addCommands: function(new_commands) {
            // add possible command list
            for (var c = 0; c < new_commands.commands.length; c++) {
                b_search.commands.push(new_commands.commands[c]);
            }
            
            // add command submit function
            b_search.cmd_submit.push(new_commands.action);
        },

        getCommands: function(type) {
            return b_search.commands;
        },

        getCmdSubmits: function() {
            return b_search.cmd_submit;
        }
    }
});

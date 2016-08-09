var b_search;
var search_box_options;

$(function(){
    b_search = {
        options: {},
        curr_type: '',
        file_commands: [],
        ide_commands: [],
        ide_cmd_submit: [],

        setOptions: function(new_options) {
            b_search.options = new_options;
            b_search.setType(Object.keys(new_options)[0]);
            $(".search-type").comboBox(new_options);
        },

        removeSuggestion: function(sugg_val) {
            if (b_project.getSetting('recent_files').includes(sugg_val)) {
                b_project.getSetting('recent_files').splice(b_project.getSetting('recent_files').indexOf(sugg_val), 1);
            }
            b_ide.saveData();
        },

        addSuggestion: function(sugg_val) {
            b_project.getSetting('recent_files').unshift(sugg_val);
            b_ide.saveData();
        },

        nextSearchType: function() {

        },

        prevSearchType: function() {

        },

        isFocus: function() {
            return $("#in-search").is(":focus");
        },

        focus: function() {
            $("#in-search").val('');
            $("#in-search").focus();
        },

        setType: function(new_type) {
            console.log('type is ' + new_type)
            b_search.curr_type = new_type;
        },

        getType: function() {
            return b_search.curr_type;
        },

        addCommands: function(new_commands) {
            var keys = Object.keys(new_commands);

            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];

                if (key === 'file') {
                    b_search.file_commands.push(new_commands.file);
                }
                else if (key === 'ide') {
                    b_search.ide_commands.push(new_commands.ide[0]);
                    b_search.ide_cmd_submit.push(new_commands.ide[1]);
                }
            }
        },

        getCommands: function(type) {
            if (type === 'file') {
                return b_search.file_commands;
            }
            else if (type === 'ide') {
                return b_search.ide_commands;
            }
        },

        getIdeCmdSubmits: function() {
            return b_search.ide_cmd_submit;
        }
    }

    search_box_options = {
        file: {
            icon: 'mdi mdi-file-outline',
            color: '#00bcd4',
            text: 'white',
            action: b_search.setType
        },
        ide: {
            icon: 'mdi mdi-application',
            color: '#8bc34a',
            text: 'white',
            action: b_search.setType
        },
    };

    b_search.setOptions(search_box_options);

    $("#in-search").on("keydown", function(evt) {
        var keyCode = evt.keyCode || evt.which;
        var key = evt.key;

        if (evt.ctrlKey && keyCode == 82) {
            // previous option
            if (evt.shiftKey) {
                $(".search-type").trigger("prevOption");
            }
            // next option
            else {
                $(".search-type").trigger("nextOption");
            }
        }
    });
});

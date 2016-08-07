var b_ide;

$(function(){
    $(".option-tabs").on("click", ".option", function() {
        b_ide.selectIdeOptionTab($(this).attr("for"));
    });

    // events for when option inputs change
    $(".opt-theme").on("change", function() {
        var selected_val = this.options[this.selectedIndex].value;
        if ($(this).hasClass("ide")) {
            b_ide.setOption("appearance", "ide", selected_val);
        }
        if ($(this).hasClass("editor")) {
            b_ide.setOption("appearance", "editor", selected_val);
        }
    });

    b_ide = {
        showDevTools: function() {
            eIPC.send("show-dev-tools");
        },

        isProjectSet: function() {
            return (typeof(curr_project) != "undefined" && curr_project !== "");
        },

        showProgressBar: function() {
            $(".loading-bar").addClass("active");
        },

        hideProgressBar: function() {
            $(".loading-bar").removeClass("active");
        },

        addDataValue: function(category, value) {
            if (!Object.keys(ide_data).includes(category)) {
                ide_data[category] = value;
            }
        },

        showSideContent: function() {
            $(".side-content").empty();
            $("#editor").addClass("side-content-open");
            $(".side-content").addClass("active");
        },

        hideSideContent: function() {
            $("#editor").removeClass("side-content-open");
            $(".side-content").removeClass("active");
        },

        showIdeOptions: function() {
            if ($(".option-tabs > .option.selected").length == 0) {
                $($(".option-tabs > .option")[0]).trigger("click");
            }
            $(".ide-options").addClass("active");
        },

        hideIdeOptions: function() {
            $(".ide-options").removeClass("active");
        },

        selectIdeOptionTab: function(tab_name) {
            // tab selection
            $(".option-tabs > .option").removeClass("selected");
            $(".option-tabs > ." + tab_name).addClass("selected");

            // show panel
            $(".option-viewer > .panel").removeClass("active");
            $(".option-viewer > ." + tab_name).addClass("active");
        },

        // set option that will be saved in ide_data
        setOption: function(name, key, value) {
            if (!Object.keys(ide_data.options).includes(name)) {
                ide_data.options[name] = default_options[name];
            }
            // other actions for certain options
            if (name === "appearance") {
                if (key === "ide") {
                    // set ide theme
                    $("#main_window").attr("theme", value);
                }
                if (key === "editor") {
                    // set editor theme
                    editor.setTheme("ace/theme/" + value);
                }
            }
            ide_data.options[name][key] = value;
        },

        // get option from ide_data
        getOption: function(name) {
            if (!Object.keys(ide_data.options).includes(name)) {
                ide_data.options[name] = default_options[name];
            }
            return ide_data.options[name];
        },

        loadOptions: function() {
            // APPEARANCE
            var set_appear = b_ide.getOption("appearance");
            // ide theme
            var curr_ide_theme = set_appear["ide"];
            b_ide.setOption("appearance", "ide", curr_ide_theme);
            var ide_theme_html = '';
            for (var i = 0; i < ide_themes.length; i++) {
                var selected = '';
                if (ide_themes[i] === curr_ide_theme) {
                    selected = ' selected ';
                }
                var cap_theme_name = ide_themes[i].charAt(0).toUpperCase() + ide_themes[i].slice(1);
                ide_theme_html += "<option value='" + ide_themes[i] + "'" + selected + ">" + cap_theme_name + "</option>";
            }
            $(".opt-theme.ide").html(ide_theme_html);
            // editor theme
            var curr_editor_theme = set_appear["editor"];
            b_ide.setOption("appearance", "editor", curr_editor_theme);
            var editor_theme_html = '';
            for (var i = 0; i < editor_themes.length; i++) {
                var selected = '';
                if (editor_themes[i] === curr_editor_theme) {
                    selected = ' selected ';
                }
                var cap_theme_name = editor_themes[i].charAt(0).toUpperCase() + editor_themes[i].slice(1);
                editor_theme_html += "<option value='" + editor_themes[i] + "'" + selected + ">" + cap_theme_name + "</option>";
            }
            $(".opt-theme.editor").html(editor_theme_html);
        }
    }
});

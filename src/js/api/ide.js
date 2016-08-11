var b_ide;

var default_options = {
    "appearance": {
        "ide": "light",
        "editor": "chrome"
    },
    "editor": {
        "zoom": 14
    }
}

var labels = {
    project: '<span class="label label-red">project</span>',
    plugin: '<span class="label label-orange">plugin</span>',
    file: '<span class="label label-gray">file</span>'
};

var ide_themes = ["light", "dark"];

var editor_themes = [
    "ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt",
    "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "idle_fingers",
    "iplastic", "katzenmilch", "kr_theme", "kuroir", "merbivore",
    "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark",
    "solarized_light", "sqlserver", "terminal", "textmate", "tomorrow", "tomorrow_night",
    "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties",
    "twilight", "vibrant_ink", "xcode"
];

$(function(){
    console.log('userData: ' + eAPP.getPath('userData'));

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
        data: {
            project_paths: [],      // folders dropped in the ide
            current_project: '',
            options: default_options,
            plugins: {}
        },
        data_folder: (DEV_MODE ? nwPATH.join(eAPP.getPath("userData"),'dev_data') : nwPATH.join(eAPP.getPath("userData"),'data')),
        data_path: (DEV_MODE ? nwPATH.join(eAPP.getPath("userData"),'dev_data','ide_data.json') : nwPATH.join(eAPP.getPath("userData"),'data','ide_data.json')),

        showDevTools: function() {
            eIPC.send("show-dev-tools");
        },

        isProjectSet: function() {
            return (typeof(b_project.curr_project) != "undefined" && b_project.curr_project !== "");
        },

        showProgressBar: function() {
            $(".loading-bar").addClass("active");
        },

        hideProgressBar: function() {
            $(".loading-bar").removeClass("active");
        },

        addDataValue: function(category, value) {
            if (!Object.keys(b_ide.getData()).includes(category)) {
                b_ide.getData()[category] = value;
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
            if (!Object.keys(b_ide.getData().options).includes(name)) {
                b_ide.getData().options[name] = default_options[name];
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
            b_ide.getData().options[name][key] = value;

            b_ide.saveData();
        },

        // get option from ide_data
        getOption: function(name) {
            if (!Object.keys(b_ide.getData().options).includes(name)) {
                b_ide.getData().options[name] = default_options[name];
            }
            return b_ide.getData().options[name];
        },

        // fill input boxes for option panel
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
        },

        setWinTitle: function(new_title) {
            eIPC.send('set-win-title', new_title);
        },

        getData: function() {
            return this.data;
        },

        loadData: function(callback) {
            nwFILE.lstat(b_ide.data_path, function(err, stats) {
                if (!err && stats.isFile()) {
                    nwFILE.readFile(b_ide.data_path, 'utf-8', function(err, data) {
                        if (!err) {
                            b_ide.data = JSON.parse(data);

            		    b_ide.loadOptions();
                            b_plugin.loadPlugins(b_ide.getData().plugins);
                            b_project.setFolder(b_ide.getData().current_project);
                            b_editor.setZoom(b_ide.getOption('editor').zoom);


                        }
                    });
                } else {
                    console.log('ERR: cannot ide file ide_data.json. creating new one.');
                    b_ide.saveData();
            	    b_ide.loadOptions();
                }
            });
        },

        saveData: function() {
            // b_project.setSetting('history', b_history.save());			
            nwFILE.mkdir(b_ide.data_folder, function() {
                // save ide settings file
                nwFILE.writeFile(b_ide.data_path, JSON.stringify(b_ide.getData()), {flag: 'w+'}, function(err) {
                    // save project settings file
                    b_project.saveData();
                });
            });
        },
        
        hasPlugin: function(plugin_name) {
            return (Object.keys(b_ide.data.plugins).includes(plugin_name));
        },

        /*
        options = {
            message     [html string]
            can_dismiss [boolean]
            timeout     [int]           : milliseconds
        }
        */

        addToast: function(options) {
            var el_toast_container = $(".toast-container");
            var el_toast = document.createElement("div");
            $(el_toast).addClass('toast');

            var el_message = document.createElement("span");
            $(el_message).html(options['message']);
            $(el_toast).append(el_message);

            var el_newline = document.createElement("br");

            if (options['can_dismiss']) {
                var el_btn_dismiss = document.createElement("button");
                $(el_btn_dismiss).addClass('btn-close');
                $(el_btn_dismiss).html('<i class="mdi mdi-close" aria-hidden="true"></i>');
                el_btn_dismiss.addEventListener("click", function(){
                    $(this).parent(".toast").next('br').remove();
                    $(this).parent(".toast").fadeOut(300, function() { $(this).remove(); })
                });
                $(el_toast).hide();
                $(el_toast).append(el_btn_dismiss);
            }

            if (options['timeout']) {
                $(el_toast).delay(options['timeout'] + 300).fadeOut(300, function() { $(this).remove(); });
            }

            // add toast
            $(el_toast_container).append(el_toast);
            $(el_toast_container).append(el_newline);

            $(el_toast).show();
        }
    }
});

var b_ide;

var default_options = {
    "appearance": {
        "theme": {
            "ide": "dark",
            "editor": "monokai",
        },
        "font": {
            "family" : "Inconsolata",
            "size" : 16
        },
    },
    "editor": {
        "autocomplete" : {
            "enabled": true,
            "live": true
        }
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

var font_families = [ 'Courier New', 'Courier', 'ProFont', 'Monofur', 'Proggy Clean', 'Proggy Square', 'Inconsolata'];

$(function(){
    console.log('userData: ' + eAPP.getPath('userData'));
    
    // fonts only available on mac
    if (nwOS.platform() === "Darwin") {
        font_families.push("Andale Mono", "Monaco");
    }

    $(".option-tabs").on("click", ".option", function() {
        b_ide.selectIdeOptionTab($(this).attr("for"));
    });

    // events for when option inputs change
    $(".opt-input").on("change", function() {
        var value = '';

        if ($(this).hasClass("select")) {
            value = this.options[this.selectedIndex].value;
        }
        if ($(this).hasClass("number")) {
            value = $(this).val();
        }
        if ($(this).hasClass("checkbox")) {
            value = this.checked;
        }

        b_ide.saveOption($(this).data("option"), value);
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
            return (typeof(b_project.curr_project) !== "undefined" && b_project.curr_project !== "");
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
            b_ide.loadOptions();
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

        // get option from ide_data
        getOptions: function() {
            return b_ide.getData().options;
        },

        // refreshes setting in ide using current options
        saveOption: function(opt_string, opt_value, save_data=true) {
            var options = b_ide.getOptions();
            var opt_split = opt_string.split('.');

            // set option value
            obj_assign(options, opt_string, opt_value);

            // extra actions
            // theme
            if (opt_string === 'appearance.theme.ide') {
                $("#main_window").attr("theme", opt_value);
            }
            if (opt_string === 'appearance.theme.editor') {
                editor.setTheme("ace/theme/" + opt_value);
            }
            // font
            if (opt_string === 'appearance.font.family') {
                editor.setOption("fontFamily", opt_value);
            }
            if (opt_string === 'appearance.font.size') {
                b_editor.setZoom(opt_value);
            }
            // autocomplete
            if (opt_string === "editor.autocomplete.enabled") {
                editor.setOption('enableBasicAutocompletion', opt_value);
            }
            if (opt_string === "editor.autocomplete.live") {
                editor.setOption('enableLiveAutocompletion', opt_value);
            }

            if (save_data) {
                b_ide.saveData();
            }
        },

        // fill input boxes for option panel
        loadOptions: function() {
            // APPEARANCE
            var options = b_ide.getOptions();

            var set_appear = options.appearance;
            var set_editor = options.editor;

            // ide theme
            var curr_ide_theme = set_appear.theme.ide;
            fillSelect(".opt-input[data-option='appearance.theme.ide']", ide_themes, curr_ide_theme);
            b_ide.saveOption('appearance.theme.ide', curr_ide_theme, false);

            // editor theme
            var curr_editor_theme = set_appear.theme.editor;
            fillSelect(".opt-input[data-option='appearance.theme.editor']", editor_themes, curr_editor_theme);
            b_ide.saveOption('appearance.theme.editor', curr_editor_theme, false);

            // font size
            var curr_font_size = set_appear.font.size;
            $(".opt-input[data-option='appearance.font.size']").val(curr_font_size);
            b_ide.saveOption('appearance.font.size', curr_font_size, false);

            // font family
            var curr_font_family = set_appear.font.family;
            fillSelect(".opt-input[data-option='appearance.font.family']", font_families, curr_font_family);
            b_ide.saveOption('appearance.font.family', curr_font_family, false);

            // autocomplete enabled
            var auto_enabled = set_editor.autocomplete.enabled;
            $(".opt-input[data-option='editor.autocomplete.enabled']")[0].checked = auto_enabled;
            b_ide.saveOption('editor.autocomplete.enabled', auto_enabled, false);

            // live autocompletion
            var live_enabled = set_editor.autocomplete.live;
            $(".opt-input[data-option='editor.autocomplete.live']")[0].checked = live_enabled;
            b_ide.saveOption('editor.autocomplete.live', live_enabled, false);
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
                            b_editor.setZoom(b_ide.getOptions().appearance.font.size);
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
                //console.log("saving ide data: ");
                //console.log(JSON.stringify(b_ide.getData()))
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

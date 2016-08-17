var sugg_index = -1;
var el_searchbox;

$(function(){
    el_searchbox = document.getElementById("in-search");
    el_searchbox.oninput = newInput;
    el_searchbox.onpropertychange = el_searchbox.oninput;

    $(el_searchbox).on("keydown", function(evt) {
        var keyCode = evt.keyCode || evt.which;
        // ENTER key
        if (keyCode == 13) {
            evt.preventDefault();
            if (sugg_index != -1) {
                $(el_searchbox).val($(".suggestion")[sugg_index].dataset.value);
                $(".suggestions").removeClass("active");
                sugg_index = -1;
            }
            submitSearch();
        }
        // TAB key
        else if (keyCode == 9) {
            evt.preventDefault();
            var sugg_count = $(".suggestion").length;

            // go down
            if (!evt.shiftKey) {
                sugg_index++;
                if (sugg_index > sugg_count - 1) {
                    sugg_index = 0;
                    $($('.suggestion')[sugg_count - 1]).removeClass('highlighted');
                }
            }
            // go down
            else {
                sugg_index--;
                if (sugg_index < 0) {
                    sugg_index = sugg_count - 1;
                    $('.suggestion')[0].classList.remove('highlighted');
                }
            }

            // remove neighboring highlights
            if (sugg_index > 0) {
                $('.suggestion')[sugg_index - 1].classList.remove('highlighted');
            }
            if (sugg_index < sugg_count - 1) {
                $('.suggestion')[sugg_index + 1].classList.remove('highlighted');
            }

            // add highlight to selected
            if ($('.suggestion')[sugg_index] !== undefined) {
                $('.suggestion')[sugg_index].classList.add('highlighted');
                $('.suggestion')[sugg_index].scrollIntoView({behavior: "smooth"});
                $(el_searchbox).val($(".suggestion")[sugg_index].dataset.value);
            }

        }
        // ESCAPE key
        else if (keyCode == 27) {
            b_search.clear();
            $(".suggestions").removeClass("active");
            sugg_index = -1;
            b_editor.focus();
        } else {
            $(".suggestion").each(function() {
                $(this).remove('highlighted');
            })
        }
    });

    el_searchbox.addEventListener("blur", function(){
        //$(".suggestions").removeClass("active");
    });

    // on suggestion selection
    $(".suggestions").on('click', '.suggestion', function() {
        $(el_searchbox).val($(this)[0].dataset.value);
        $(".suggestions").removeClass("active");
        sugg_index = -1;
        submitSearch();
    });
});

function prevFileSuggest(input) {
    if (!b_ide.isProjectSet()) return '';

    // TODO: add option for case-sensitive searching
    input = input.toLowerCase();
    var input_parts = input.split('/');
    var html = '';

    var files = b_project.tree;
    // previous suggestion (higher priority)
    for (var r = 0; r < b_project.getSetting('recent_files').length; r++) {
        var full_path = normalizePath(b_project.getSetting('recent_files')[r]);
        var file_path = full_path.replace(b_project.curr_project,'');
        var prev_path = nwPATH.basename(file_path);
        console.log('its ' + full_path);
        var full_path_preview = nwPATH.dirname(shortenPath(full_path, 4));

        if (prev_path.toLowerCase().startsWith(input)) {
            var result_txt = prev_path.replace(input, "<b>" + input + "</b>");
            html += "<div class='suggestion high-priority' tabIndex='$1' data-value='" + file_path + "'>"
            + result_txt +  "<span class='full-path'>" + full_path_preview + "</span>" +
            "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + full_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>";
        }
    }
    return html;
}

function suggest(input) {
    if (!b_ide.isProjectSet()) return '';

    // TODO: add option for case-sensitive searching
    input = input.toLowerCase();
    var input_parts = input.split('/');
    var html = [];

    var files = b_project.tree;
    // iterate through already typed path dirs
    if (files && files.length) {
        for (var p = 0; p < input_parts.length; p++) {
            var part = input_parts[p];

            // find next directory to go down
            for (var f = 0; f < files.length; f++) {
                // TODO: if there is for example, '/.git' and '/.gitattributes', the first one gets priority (make this better)
                if (files[f].name.toLowerCase() === part && files[f].type === 'folder') {
                    files = files[f].children;
                }
            }
        }
    }

    // create html suggestion array
    for (var f = 0; f < files.length; f++) {
        var full_path = normalizePath(files[f].path)
        var file_path = full_path.replace(b_project.curr_project,'');

        if (file_path.toLowerCase().includes(input_parts[input_parts.length - 1])) {
            var result_txt = file_path.replace(input, "<b>" + input + "</b>");

            if (files[f].type === "folder") {
                result_txt += '/';
            }

            // normal priority suggestion
            if (!b_project.getSetting('recent_files').includes(file_path)) {
                html.push("<div class='suggestion' tabIndex='$1' data-value='" + file_path + "'>" + result_txt + "</div>");
            }
        }
    }
    // turn it into a string
    var html_str = '';
    for (var h = 0; h < html.length; h++) {
        html_str += html[h].replace('$1', h+1);
    }
    return html_str;
}

function newInput() {
    var input_text = this.value;
    var is_file_search = false;
    var commands = b_search.getCommands();

    // determine type of input
    if (input_text.startsWith('/')) {
        is_file_search = true;
    }

    // hide box if nothing is in the search box
    if (input_text.length < 1) {
        $(".suggestions").removeClass("active");
        sugg_index = -1;
    } else {
        for (var c = 0; c < commands.length; c++) {
            var final_html = "";

            final_html += prevFileSuggest(input_text);

            if (is_file_search) {
                final_html += suggest(input_text);

            } else {
                var input_parts = input_text.split(' ');
                var html = [];

                // previous suggestion (higher priority)
                for (var r = 0; r < b_project.getSetting('recent_ide_commands').length; r++) {
                    var command = b_project.getSetting('recent_ide_commands')[r];

                    if (command.startsWith(input_text)) {
                        var result_txt = command.replace(input_text, "<b>" + input_text + "</b>");
                        html.push("<div class='suggestion high-priority' tabIndex='$1' data-value='" + command + "'>" + result_txt + "<button class='remove-sugg' onclick='b_search.removeSuggestion(\"" + file_path + "\");$(this).parent().remove();'><i class='mdi mdi-close'></i></button></div>");
                    }
                }

                // create html suggestion array
                for (var c = 0; c < commands.length; c++) {
                    var command_start = commands[c][0];

                    if (command_start.includes(input_text)) {

                        var result_txt = command_start.replace(input_text, "<b>" + input_text + "</b>") + " <span class='options'>" + commands[c][1] + "</span>";

                        // normal priority suggestion
                        if (!b_project.getSetting('recent_ide_commands').includes(command_start)) {
                            html.push("<div class='suggestion' tabIndex='$1' data-value='" + command_start + "'>" + result_txt + "</div>");
                        }
                    }
                }

                // turn it into a string
                for (var h = 0; h < html.length; h++) {
                    final_html += html[h].replace('$1', h+1);
                }
            }

            $(".suggestions").html(final_html);
            if (final_html.length > 1) {
                $(".suggestions").addClass("active");
                sugg_index = -1;
            }
        }

        // hide suggestions if there are none
        if ($(".suggestions").html().length <= 1) {
            $(".suggestions").removeClass("active");
            sugg_index = -1;
        }
    }
}

function submitSearch() {
    var is_file_search = false;
    var input_text = $(el_searchbox).val();

    // determine type of input
    if (input_text.startsWith('/')) {
        is_file_search = true;
    }

    if (is_file_search && b_ide.isProjectSet()) {
        // open file
        b_editor.setFile(nwPATH.join(b_project.curr_project, input_text));
    } else {
        var commands = b_search.getCmdSubmits();

        for (var c = 0; c < commands.length; c++) {
            commands[c](input_text);
        }
    }
}

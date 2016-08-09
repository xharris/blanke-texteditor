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
            $("#in-search").val('');
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

function newInput() {
    var input_text = this.value;
    var search_type = b_search.getType();
    var commands = b_search.getCommands(search_type);

    // hide box if nothing is in the search box
    if (input_text.length < 1) {
        $(".suggestions").removeClass("active");
        sugg_index = -1;
    } else {
        for (var c = 0; c < commands.length; c++) {
            var final_html = "";

            if (search_type === "file") {
                final_html = commands[c].suggest(input_text);

            } else if (search_type === "ide") {
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
                    for (var d = 0; d < commands[c].length; d++) {
                        var command_start = commands[c][d][0];

                        if (command_start.includes(input_text)) {

                            var result_txt = command_start.replace(input_text, "<b>" + input_text + "</b>") + " <span class='options'>" + ideCommands[c][1] + "</span>";

                            // normal priority suggestion
                            if (!b_project.getSetting('recent_ide_commands').includes(command_start)) {
                                html.push("<div class='suggestion' tabIndex='$1' data-value='" + command_start + "'>" + result_txt + "</div>");
                            }
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
    var search_type = b_search.getType();
    var input_text = $(el_searchbox).val();

    if (search_type === 'file') {
        var commands = b_search.getCommands(b_search.getType());


        for (var c = 0; c < commands.length; c++) {
            commands[c].submit(input_text);
        }
    }
    else if (search_type === 'ide') {
        var commands = b_search.getIdeCmdSubmits();

        for (var c = 0; c < commands.length; c++) {
            commands[c](input_text);
        }
    }
}

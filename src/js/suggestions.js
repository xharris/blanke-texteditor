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
                submitSearch();
            }
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
            $('.suggestion')[sugg_index].classList.add('highlighted');
            $('.suggestion')[sugg_index].scrollIntoView({behavior: "smooth"});
            $(el_searchbox).val($(".suggestion")[sugg_index].dataset.value);

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
        console.log(this)
        console.log('hi')
        $(el_searchbox).val($(this)[0].dataset.value);
        $(".suggestions").removeClass("active");
        sugg_index = -1;
        submitSearch();
    });
});

function newInput() {
    var input_text = this.value;
    var search_type = getSearchType();
    
    // hide box if nothing is in the search box    
    if (input_text.length < 1) {
        $(".suggestions").removeClass("active");
        sugg_index = -1;
    } else {
        if (Object.keys(commands).includes(search_type)) {
            for (var c = 0; c < commands[search_type].length; c++) {
                var html = "";
                html = commands[search_type][c].suggest(input_text);
                $(".suggestions").html(html);
                if (html.length > 1) {
                    $(".suggestions").addClass("active");
                    sugg_index = -1;
                }
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
    var input_text = $(el_searchbox).val();
    var search_type = getSearchType();

    if (Object.keys(commands).includes(search_type)) {
        for (var c = 0; c < commands[search_type].length; c++) {
            commands[search_type][c].submit(input_text);
        }
    }
}

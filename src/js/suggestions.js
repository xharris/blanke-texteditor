$(function(){
    var el_searchbox = document.getElementById("in-search");
    el_searchbox.oninput = newInput;
    el_searchbox.onpropertychange = el_searchbox.oninput;

    el_searchbox.addEventListener("blur", function(){
        $(".suggestions").removeClass("active");
    });
});

function newInput() {
    $(".suggestions").addClass("active");

    var input_text = this.value;
    var search_type = getSearchType();

    // hide box if nothing is in the search box
    if (input_text === '') {
        $(".suggestions").removeClass("active");
    }

    var input_parts = input_text.split(' ');

    if (Object.keys(commands).includes(search_type)) {
        for (var c = 0; c < commands[search_type]; c++) {
            var command = commands[search_type][c];

            var suggestion = '';

            console.log(input_text);
            console.log(input_text.match(command[0]));

            // call 'suggest' function
            if (command[1] === 'match') {
                var result = input_text.match(command[0]);
                if (result) {
                    suggestion = command[2].suggest(result);
                }
            }
            else if (command[1] === 'grep') {
                nwGREP(input_text, curr_project['path'], function(list) {
                    suggestion = command[2].suggest(list);
                });
            }
        }

    }
}

/*

*/

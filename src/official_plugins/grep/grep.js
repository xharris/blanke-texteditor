var nwGREP;
var simplegrep_path;

$(function() {
    document.addEventListener("plugin_js_loaded", function(e) {
        if (e.detail.plugin.name === "Grep") {
            b_search.addCommands(grep);
            var plugin_path = e.detail.path;

            nwGREP = require(nwPATH.join(plugin_path,'node_modules','rx-text-search'));
        }
    });

})

// [command, arg hints]
var grep_command = [
    ['grep','[search-text] (May take a while. Pls be Patient.)']
];

var grep_action = function(input) {

    var input_parts = input.split(/[ ]+/);

    if (input_parts[0] === "grep") {
        b_ide.showProgressBar();
        // remove --options
        // ...
        
        var search_str = input_parts.slice(1,input_parts.length).join(' ');

        // do the grep
        var results = {};
        var found_files = [];
        var results_html = '';

        var exp = new RegExp(search_str);
        
        nwGREP.findAsPromise(exp, null ,{cwd: b_ide.getData().current_project})
        .then(function(list){
            for (var g = 0; g < list.length; g++) {
                if (nwPATH.extname(list[g].file) !== ".exe") {
                console.log(list[g])
                    // iterate through results
                    var result = list[g];
                    
                    if (!found_files.includes(result.file)) {
                        found_files.push(result.file);
                        results[normalizePath(result.file)] = [];
                    }
                    results[normalizePath(result.file)].push([result.line, result.text]);
                    
                }
            }

            // iterate through files
            var result_keys = Object.keys(results);
            results_html += '<div class="result-list">';
            for (var f = 0; f < result_keys.length; f++) {
                var lines = results[result_keys[f]];
                var js_filepath = normalizePath(nwPATH.join(b_ide.getData().current_project, result_keys[f]));

                results_html += '<div class="result">'+
                '<span class="file-path" onclick="toggleCollapsible(this.parentElement)" title="'+ js_filepath +'">' + js_filepath + "</span><br>";
                
                // iterate through line numbers
                for (var h = 0; h < lines.length; h++) {
                    var code = $("<div/>").text(lines[h][1]).html().replace(search_str, '<u>'+search_str+'</u>');
                    results_html += '<p class="line" onclick="b_editor.setFile(\'' + js_filepath + '\',false,false,function(){editor.gotoLine(' + lines[h][0] + ',0);});"><b>' + lines[h][0] + '</b> ' + code + '</p>';
                }

                results_html += '</div>';
            }
            results_html += '</div>';

            // show result panel
            var box = b_ui.dragBox(70,$(window).width() - 420,350,400);
            $(box).html(
                '<button class="btn-close" onclick="$(\'' + box + '\').remove();"><i class="mdi mdi-close"></i></button>'+
                '<p class="grep-input"><b>grep</b> ' + search_str + '</p>'+
                '<div class="grep-results no-drag">' + results_html + '</div>'
            );

            b_ide.hideProgressBar();
        });


    }

}

function toggleCollapsible(result) {
    $(result).toggleClass("open");
}

var grep = {
    commands: grep_command,
    action: grep_action
};

var nwGREP;
var simplegrep_path;

$(function() {
    document.addEventListener("plugin_js_loaded", function(e) {
        if (e.detail.plugin.name === "Grep") {
            b_search.addCommands(grep);
            var plugin_path = e.detail.path;

            simplegrep_path = nwPATH.join(plugin_path, 'node_modules', 'simple-grep');
            nwGREP = require(simplegrep_path);
        }
    });

})

// [command, arg hints]
var grep_command = [
    ['grep','[search-text] (May take a while. Pls be Patient.)']
];

var grep_action = function(input) {
    b_ide.showProgressBar();
    
    var input_parts = input.split(/[ ]+/);

    if (input_parts[0] === "grep") {
        // remove --options
        // ...
        var search_str = input_parts.slice(1,input_parts.length).join(' ');
        
        // do the grep
        var results = {};
        var found_files = [];
        var results_html = '';
        
        nwGREP = require(simplegrep_path);
        nwGREP(search_str, b_project.curr_project, function(list){
            for (var g = 0; g < list.length; g++) {
                if (list[g].file === "C") {
                    // iterate through results
                    for (var r = 0; r < list[g].results.length; r++) {
                        var result = list[g].results[r];
                        if (!found_files.includes(result.line_number)) {
                            found_files.push(result.line_number);
                            results[normalizePath(result.line_number)] = [];
                        }
                        results[normalizePath(result.line_number)].push(result.line);
                    }

                }

            }
            
            // iterate through files
            var result_keys = Object.keys(results);
            results_html += '<div class="result-list">';
            for (var f = 0; f < result_keys.length; f++) {
                var lines = results[result_keys[f]];
                var js_filepath = nwPATH.resolve(result_keys[f]).replace(/(\/|\\)/g, '/');
                
                results_html += '<div class="result">'+
                '<span class="file-path" onclick="toggleCollapsible(this.parentElement)">' + nwPATH.resolve(result_keys[f]) + "</span><br>";
                // iterate through line numbers
                for (var h = 0; h < lines.length; h++) {
                    results_html += '<p class="line" onclick="b_editor.setFile(\'' + js_filepath + '\',false,false,function(){editor.gotoLine(' + lines[h] + ',0);});">' + lines[h] + '</p>';
                }
                    
                results_html += '</div>';
            }
            results_html += '</div>';
            
            // show result panel
            var box = b_ui.dragBox(70,$(window).width - 270,250,300);
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

var b_fileview;
var tree;

$(function(){
    // file selected
    $(".file-view").on('click', '.file.container', function() {
        b_editor.setFile($(this).data("fullpath"));
    });
    
    // directory selected
    $(".file-view").on('click', '.folder.container > .filename', function() {
        var parent = $(this).parent();
        
        // has it already been opened?
        if (!parent.hasClass("loaded")) {
            parent.addClass("loaded");
            
            var full_path = parent.data("fullpath");
            nwFILE.readdir(parent.data("fullpath"), function(err, files) {
                for (var f = 0; f < files.length; f++) {
                    b_fileview.addPath(nwPATH.join(full_path, files[f]));
                }
            });            
        }
        
        parent.toggleClass("expanded");
    });
    
    // project selected
    $(".file-view > .projects").on("click", ".project", function() {
        b_project.setFolder($(this).data('path'));
    });
    
    b_fileview = {
        refreshProjects: function() {
            // refresh project list
            $(".file-view > .projects").empty();
            $(".file-view > .files").empty();
            
            var projects = b_ide.getData().project_paths;
            for (var p = 0; p < projects.length; p++) {
                var short_path = shortenPath(projects[p], 1);
                $(".file-view > .projects").append(
                    "<a class='project' title='"+projects[p]+"' data-path='"+projects[p]+"'>"+
                        "<i class='mdi mdi-star'></i>"+
                        "<p class='file-path'>"+short_path+"</p>"+
                    "</a>"
                );
            }
            
            // refresh first level file list
            nwFILE.readdir(b_project.curr_project, function(err, files) {
                for (var f = 0; f < files.length; f++) {
                    b_fileview.addPath(nwPATH.join(b_project.curr_project, files[f]));
                }
            });
        },
        
        addPath: function(file) {
            var folder_path = nwPATH.dirname(file).replace(/\\/g, '/');
            var filename = nwPATH.basename(file);
            var full_path = file;
            
            // is it a dir or file
            var is_dir = nwFILE.lstatSync(full_path).isDirectory();
                  
            var location_selector = ".file-view > .files"; 
            var file_hash = file.replace(/\\/g, '/').hashCode();
            var folder_hash = folder_path.hashCode();
                  
            // is it in a subdirectory?
            if (folder_path !== b_project.curr_project) {
                location_selector = ".file-view > .files .folder[data-uuid='"+folder_hash+"'] > .children";
            } 
            
            if (is_dir) {
                $(location_selector).append(
                    "<div class='folder container' title='"+full_path+"' data-fullpath='"+full_path+"' data-uuid='"+file_hash+"'>"+
                        "<p class='filename'>"+
                            "<i class='mdi mdi-plus'></i>"+
                            "<i class='mdi mdi-minus'></i>"+
                            filename+"/"+
                        "</p>"+
                        "<div class='children'></div>"+
                    "</div>"  
                );
            } else {
                $(location_selector).append(
                    "<div class='file container' title='"+full_path+"' data-fullpath='"+full_path+"' data-uuid='"+file_hash+"'>"+
                        "<p class='filename'>"+
                            filename+
                        "</p>"+
                    "</div>"  
                );
            }
            
        }
    }
});
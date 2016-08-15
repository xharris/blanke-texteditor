var converter,
    is_ready = false,
    is_markdown = false,
    sync_scroll = false; // add this feature

function isMarkdown () {
    return (nwPATH.extname(b_project.getSetting('curr_file')) === '.md');
}

function updateMarkdown() {
    var editor_txt = editor.getValue();

    // update live preview
    $(".side-content").html(converter.makeHtml(editor_txt));
}

$(function() {
    document.addEventListener("plugin_js_loaded", function(e) {
        if (e.detail.plugin.name === "Markdown Preview") {
            $(".side-content").addClass("markdown-body");

            // initialize showdown
            converter = new showdown.Converter();
            is_ready = true;

            // get current file. is it markdown
            if (isMarkdown()) {
                is_markdown = true;
                b_ide.showSideContent();
                updateMarkdown();
            }

            document.addEventListener("editor_set_file", function(e) {
                var file_path = e.detail.file;
                console.log("file_edited " + file_path);

                // is it a markdown file?
                if (isMarkdown()) {
                    is_markdown = true;
                    b_ide.showSideContent();
                    updateMarkdown();
                } else {
                    b_ide.hideSideContent();
                }

            });

            editor.on("change", function(e) {
                if (is_ready && is_markdown) {
                    updateMarkdown();
                }
            });
        }
    });

})

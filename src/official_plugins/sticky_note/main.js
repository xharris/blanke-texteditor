document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "Sticky Note") {
        $("#main_window").append("<div id='sticky-note-container'></div>");
        
        // Plugin has loaded
        b_search.addCommands(note_plugin);
        
        // load previous notes
        // // if save.json exists read it
        // // for each key, call loadNote(key_value)
    }
});

var note_plugin = {
    commands: [
        ['note add', '(Create a sticky note)']
    ],
    
    action: function(input) {
        var input_parts = input.split(/[ ]+/);

        if (input_parts[0] === 'note') {
            if (input_parts[1] === 'add') {
                createNote();
            }
        }
    }
}

function createNote() {
    var new_guid = guid();
    
    var new_offset = {top:230, left:50};
    
    var note_html = 
        "<div class='sticky-note' data-guid='"+ new_guid +"'><textarea id='textarea'></textarea>"+
            "<button class='btn-close no-drag' onclick='$(this).parent().remove();'><i class='mdi mdi-close'></i></button>"+
        "</div>";
    
    $(note_html)
    .width(200)
   	.height(150)
    .draggable({
        scroll: false,
        cancel: "textarea",
        start: function (){
            $('.sticky-note[data-guid="'+ $(this).data('guid') +'"] > textarea').focus();
         },
        stop: function (){
            $('.sticky-note[data-guid="'+ $(this).data('guid') +'"] > textarea').focus();
         } 
     })
    .css({
     })
    .resizable()
   	.offset(new_offset)
    .appendTo('#main_window > #sticky-note-container');
    
    
    $('.sticky-note[data-guid="'+ new_guid +'"] > textarea')      
    .css({

    });
}

// note_info = {text, left, top}
function loadNote(note_info) {
    
}

function saveNotes() {
    // iterate through .sticky-note
    // ...
    // get its value and position (top, left);
}
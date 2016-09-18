var b_ui;

var mouse_x = 0, mouse_y = 0;

document.onmousemove = function(e) {
    mouse_x = e.clientX;
    mouse_y = e.clientY;
}

$(function(){
    b_ui = {
        dragBox: function(x, y, w, h) {
            var dragID = "dragBox" + guid();
            $("#main_window").append("<div id='" + dragID + "' class='ui-widget-content dragBox'></div>");
            dragID = "#" + dragID;
            
            $(dragID).draggable({
                cancel:'.no-drag',
                containment: "#main_window"
            });
            $(dragID).css({position: 'absolute', top: x, left: y, width: w, height: h})
            return dragID;
        },
        
        /*
        values = [
            {'text', 'onclick'}
        ]
        */
        contextMenu: function(values) {
            // clear menu
            el_menu = $(".context-menu");
            el_menu.empty();
            
            for (var v = 0; v < values.length; v++) {
                var new_choice = el_menu.append("<p class='choice"+v+"'>"+values[v].text+"</p>");
                $(new_choice).on("click", values[v].onclick);
            }
            
            var menu_pos_x = mouse_x;
            var menu_pos_y = mouse_y;
            // is the menu vertically outside the window border?
            if (menu_pos_y + el_menu.height() > window.innerHeight) {
                menu_pos_y -= el_menu.height();
            }
            // is the menu horizontally outside the window border?
            if (menu_pos_x + el_menu.width() > window.innerWidth) {
                menu_pos_x -= el_menu.width();
            }
            
            el_menu.css("left", menu_pos_x);
            el_menu.css("top", menu_pos_y);
            
            // activate the menu
            el_menu.addClass("active");
        }
    };
    
    $(".context-menu").on('click', "p", function(){
        $(".context-menu").removeClass("active");
    });

    $(".files").on('click', '.container', function(){
        /*b_ui.contextMenu([
           {'text':'new folder', 'onclick': function(){console.log("new folder!")}},
           {'text':'new file', 'onclick': function(){console.log("new file!")}},
        ]);*/
    });
});
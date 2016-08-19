var b_ui;

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
        }
    };
});
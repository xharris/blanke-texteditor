var b_ui;

$(function(){
    b_ui = {
        dragBox: function() {
            var dragID = "draggable" + guid();
            var thebox = $("#main_window").append("<div id='" + dragID + "' class='ui-widget-content draggable'><div class='handle'></div></div>");
            $("#main_window > #" + dragID).draggable({
                cancel:'.no-drag',
                containment: "#main_window"
            });
            return thebox;
        }
    }
})
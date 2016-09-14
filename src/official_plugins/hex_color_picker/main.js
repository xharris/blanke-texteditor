var material_colors = [
    "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff", "ffffff",

    "ffebee", "fce4ec", "f3e5f5", "ede7f6", "e8eaf6", "e3f2fd", "e1f5fe", "e0f7fa", "e0f2f1", "e8f5e9", "f1f8e9", "f9fbe7", "fffde7", "fff8e1", "fff3e0", "fbe9e7", "efebe9", "fafafa", "eceff1",
    "ffcdd2", "f8bbd0", "e1bee7", "d1c4e9", "c5cae9", "bbdefb", "b3e5fc", "b2ebf2", "b2dfdb", "c8e6c9", "dcedc8", "f0f4c3", "fff9c4", "ffecb3", "ffe0b2", "ffccbc", "d7ccc8", "f5f5f5", "cfd8dc",
    "ef9a9a", "f48fb1", "ce93d8", "b39ddb", "9fa8da", "90caf9", "81d4fa", "80deea", "80cbc4", "a5d6a7", "c5e1a5", "e6ee9c", "fff59d", "ffe082", "ffcc80", "ffab91", "bcaaa4", "eeeeee", "b0bec5",
    "e57373", "f06292", "ba68c8", "9575cd", "7986cb", "64b5f6", "4fc3f7", "4dd0e1", "4db6ac", "81c784", "aed581", "dce775", "fff176", "ffd54f", "ffb74d", "ff8a65", "a1887f", "e0e0e0", "90a4ae",

    "ef5350", "ec407a", "ab47bc", "7e57c2", "5c6bc0", "42a5f5", "29b6f6", "26c6da", "26a69a", "66bb6a", "9ccc65", "d4e157", "ffee58", "ffca28", "ffa726", "ff7043", "8d6e63", "bdbdbd", "78909c",
    "f44336", "e91e63", "9c27b0", "673ab7", "3f51b5", "2196f3", "03a9f4", "00bcd4", "009688", "4caf50", "8bc34a", "cddc39", "ffeb3b", "ffc107", "ff9800", "ff5722", "795548", "9e9e9e", "607d8b",
    "e53935", "d81b60", "8e24aa", "5e35b1", "3949ab", "1e88e5", "039be5", "00acc1", "00897b", "43a047", "7cb342", "c0ca33", "fdd835", "ffb300", "fb8c00", "f4511e", "6d4c41", "757575", "546e7a",
    "d32f2f", "c2185b", "7b1fa2", "512da8", "303f9f", "1976d2", "0288d1", "0097a7", "00796b", "388e3c", "689f38", "afb42b", "fbc02d", "ffa000", "f57c00", "e64a19", "5d4037", "616161", "455a64",

    "c62828", "ad1457", "6a1b9a", "4527a0", "283593", "1565c0", "0277bd", "00838f", "00695c", "2e7d32", "558b2f", "9e9d24", "f9a825", "ff8f00", "ef6c00", "d84315", "4e342e", "424242", "37474f",
    "b71c1c", "880e4f", "4a148c", "311b92", "1a237e", "0d47a1", "01579b", "006064", "004d40", "1b5e20", "33691e", "827717", "f57f17", "ff6f00", "e65100", "bf360c", "3e2723", "212121", "263238",

    "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"
];

var bar_random_color = ["ef5350", "ec407a", "ab47bc", "7e57c2", "5c6bc0", "42a5f5", "29b6f6", "26c6da", "26a69a", "66bb6a", "9ccc65", "d4e157", "ffee58", "ffca28", "ffa726", "ff7043", "8d6e63", "bdbdbd", "78909c"];

var selected_color = '';
var selected_pos = '';
var range, sel_range, sel_range2;

document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "Hex Color Picker") {
        range = ace.require("ace/range").Range;

        b_ide.setTitleColor("#"+bar_random_color[Math.floor(Math.random()*bar_random_color.length)]);

        // Plugin has loaded
        var dialog_html = '';

        // iterate through colors
        dialog_html += 
        "<div class='color-picker'>"+
            "<div class='curr-color'>"+
                "<div class='color'></div>"+
                "<span class='value'></span>"+
            "</div>"+
            "<div class='material-colors'>"
        for (var c = 0; c < material_colors.length; c++) {
            dialog_html += "<span class='color' onclick='selectColor(\"" + material_colors[c] + "\");' style='background-color:#" + material_colors[c] + ";'></span>";
        }
        dialog_html += 
            "</div>"+
        "</div>";

        $("#main_window").append(dialog_html);

        var cursor_pos = $("#editor .ace_cursor").position();
        $(".color-picker").position(cursor_pos);

        editor.on("changeSelection", function(){
            sel_range = editor.selection.getRange();

            // check if a hash precedes the string
            var checkHash = new range(sel_range.start.row, sel_range.start.column - 1, sel_range.end.row, sel_range.end.column);

            var selection = editor.getSession().doc.getTextRange(checkHash);
            var sel_color = selection.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
            $(".color-picker").removeClass("active");
            
            if (sel_color && sel_color[0].length === sel_color.input.length && sel_color !== selected_color) {
                sel_range2 = sel_range;
                $(".color-picker").addClass("active");
                selected_color = sel_color;
                
                // show selected color 
                $(".curr-color .color").css("background-color", selected_color[0]);
                console.log(selected_color);
                $(".curr-color .value").html(selected_color[0]);
            } // #333
        });
    }
});

function selectColor(color_val) {
    editor.getSession().doc.replace(sel_range, color_val);
    if (sel_range2.end.column - sel_range2.end.column < 6) {
        sel_range2.setEnd(sel_range2.start.row, sel_range2.start.column + 6);
    }
    editor.selection.setSelectionRange(sel_range2);
    $(".color-picker").addClass("active");
}

/*
values = {
    value: {
        icon:
        action: onclickfunction(value);
    }
}
-- first value is default selection
*/

$.fn.comboBox = function(in_values) {
    var el_main = this;
    $(this).addClass("combo-box");

    var values = Object.keys(in_values);
    var sel_index = 0;

    // selected option div
    var el_selected = document.createElement("div");
    el_selected.classList.add("combo-box-option-selected");
    $(el_selected).mousedown(function(ev){
        switch (event.which) {
            case 1:
                cb_moveOption(1);
                break;

            case 3:
                cb_moveOption(-1);
                break;
        }


    });

    $(el_main).on("nextOption", function() {
        cb_moveOption(1);
    });
    $(el_main).on("prevOption", function() {
        cb_moveOption(-1);
    });

    function cb_moveOption(amt) {
        sel_index += amt;

        if (sel_index < 0) {
            sel_index = values.length - 1;
        } else if (sel_index > values.length - 1) {
            sel_index = 0;
        }

        cb_selectOption(values[sel_index]);

        try {
            in_values[values[sel_index]]['action'](values[sel_index]);
        } catch (e) {
            console.log(e);
        }
    }

    function cb_selectOption(val) {
        var icon = in_values[val]['icon'];
        var back_color = in_values[val]['color'];
        var text_color = in_values[val]['text'];
        el_selected.innerHTML = '<i class="' + icon + '" aria-hidden="true"></i><span>' + values[sel_index] + '</span>';
        $(el_selected).addClass(text_color);

        $(el_main).css("background-color", back_color);
        $(el_main).append(el_selected);
    }

    cb_selectOption(values[sel_index]);
};

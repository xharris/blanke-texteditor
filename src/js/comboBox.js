/*
values = {
    value: {
        html: (ex. icon, text, etc)
        action: onclickfunction(value);
    }
}
-- first value is default selection
*/

$.fn.comboBox = function(in_values) {
    $(this).addClass("combo-box");

    var values = Object.keys(in_values);
    var sel_index = 0;

    // selected option div
    var el_selected = document.createElement("div");
    el_selected.classList.add("combo-box-option-selected");
    $(el_selected).mousedown(function(ev){
        switch (event.which) {
            case 1:
                sel_index++;
                break;

            case 3:
                sel_index--;
                break;
        }

        if (sel_index < 0) {
            sel_index = values.length - 1;
        } else if (sel_index > values.length - 1) {
            sel_index = 0;
        }

        cb_selectOption(values[sel_index]);
        try {
            values[sel_index]['action'](values[sel_index]);
        } catch (e) {
            
        }
    });

    el_selected.innerHTML = in_values[values[0]]['html'];
    $(this).append(el_selected);

    function cb_selectOption(val) {
        el_selected.innerHTML = in_values[val]['html'];
    }
};

/*
options = {
    message     [html string]
    can_dismiss [boolean]
    timeout     [int]           : milliseconds
}
*/

function addToast(options) {
    var el_toast_container = $(".toast-container");
    var el_toast = document.createElement("div");
    $(el_toast).addClass('toast');

    var el_message = document.createElement("span");
    $(el_message).html(options['message']);
    $(el_toast).append(el_message);

    var el_newline = document.createElement("br");

    if (options['can_dismiss']) {
        var el_btn_dismiss = document.createElement("button");
        $(el_btn_dismiss).addClass('btn-close');
        $(el_btn_dismiss).html('<i class="fa fa-times" aria-hidden="true"></i>');
        el_btn_dismiss.addEventListener("click", function(){
            $(this).parent(".toast").next('br').remove();
            $(this).parent(".toast").fadeOut(300, function() { $(this).remove(); })
        });
        $(el_toast).hide();
        $(el_toast).append(el_btn_dismiss);
    }

    if (options['timeout']) {
        $(el_toast).delay(options['timeout'] + 300).fadeOut(300, function() { $(this).remove(); });
    }

    // add toast
    $(el_toast_container).append(el_toast);
    $(el_toast_container).append(el_newline);

    $(el_toast).show();


}

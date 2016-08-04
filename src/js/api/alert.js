var b_alert;

$(function(){
    b_alert = {
        showYesNo: function(options) {
            $(".alert").addClass("active");
            
            // MESSAGE
            if (options.message) {
                $(".alert > .message").html(options.message);
            }
            
            // BUTTONS
            if (typeof(options.onYes) === "function") {
                $(".alert > .btn-container > .btn-yes").addClass('active');
                $(".alert > .btn-container > .btn-yes").on("click", function() {
                    options.onYes('yes');
                    $(".alert").removeClass("active");
                    $(".alert button").removeClass('active');
                });
                $(".alert > .btn-container > .btn-yes").addClass("active");
            }
            if (typeof(options.onNo) === "function") {
                $(".alert > .btn-container > .btn-no").addClass('active');
                $(".alert > .btn-container > .btn-no").on("click", function() {
                    options.onNo('no');
                    $(".alert").removeClass("active");
                    $(".alert button").removeClass('active');
                });
                $(".alert > .btn-container > .btn-no").addClass("active");
            }
        }
    }
});

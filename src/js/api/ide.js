var b_ide;

$(function(){
    b_ide = {
        showDevTools: function() {
            eIPC.send("show-dev-tools");
        },

        isProjectSet: function() {
            return (typeof(curr_project) != "undefined" && curr_project !== "");
        },

        showProgressBar: function() {
            $(".loading-bar").addClass("active");
        },

        hideProgressBar: function() {
            $(".loading-bar").removeClass("active");
        },

        addDataValue: function(category, value) {
            if (!Object.keys(ide_data).includes(category)) {
                ide_data[category] = value;
            }
        }
    }
});

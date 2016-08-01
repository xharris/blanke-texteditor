var b_ide;

$(function(){

    b_ide = {
        showDevTools: function() {
            eIPC.send("show-dev-tools");
        },

        isProjectSet: function() {
            return (typeof(curr_project) != "undefined" && curr_project !== "");
        }
    }
});

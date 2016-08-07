var b_ide;

$(function(){
    $(".option-tabs").on("click", ".option", function() {
        console.log('did it ' + $(this).attr("for"))
        b_ide.selectIdeOptionTab($(this).attr("for"));
    });

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
        },

        showSideContent: function() {
            $(".side-content").empty();
            $("#editor").addClass("side-content-open");
            $(".side-content").addClass("active");
        },

        hideSideContent: function() {
            $("#editor").removeClass("side-content-open");
            $(".side-content").removeClass("active");
        },

        showIdeOptions: function() {
            if ($(".option-tabs > .option.selected").length == 0) {
                $($(".option-tabs > .option")[0]).trigger("click");
            }
            $(".ide-options").addClass("active");
        },

        hideIdeOptions: function() {
            $(".ide-options").removeClass("active");
        },

        selectIdeOptionTab: function(tab_name) {
            // tab selection
            $(".option-tabs > .option").removeClass("selected");
            $(".option-tabs > ." + tab_name).addClass("selected");

            // show panel
            $(".option-viewer > .panel").removeClass("active");
            $(".option-viewer > ." + tab_name).addClass("active");
        },

        // set option that will be saved in ide_data
        setOption: function(name, value) {
            ide_data.options[name] = value;
        },

        // get option from ide_data
        getOption: function(name) {
            return ide_data.options[name];
        }
    }
});

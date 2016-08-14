document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "Hex Color Picker") {
        // Plugin has loaded
        addToast({message: "ERR: cannot rename",});
    }
});

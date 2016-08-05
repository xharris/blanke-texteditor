var b_plugin;

$(function(){
    b_plugin = {
        load: function(plugins) {
            var plugin_names = ide_data['plugins'];
            
            for (var p = 0; p < plugin_names.length; p++) {
                var p_name = plugin_names[p];
                var p_path = nwPATH.join(nwPROC.cwd(),'data','plugins',p_name);
                var p_info = nwPATH.join(p_path,'plugin.json');
                
            }
        },
        
        update: function(name) {
            // TODO: implement in the far, post-release future?
        },
        
        install: function(path) {
            // --- encapsulate everything in try/catch
            // --- in catch, show toast saying 'error installing plugin'
            
            // create plugin directory using (zip name + random uuid)
            // ...
            // add to ide_data as dir_name
            // ...
            // unzip into plugin directory
            // ...
            // look at plugin.json (contains info about plugin)
            // ...
            // load [optional] css files
            // ...
            // load [optional] less files
            // ...
            // load js includes?
            // ...
            // load main js file
            // ...
        }
    }
});
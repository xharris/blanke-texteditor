var b_search;

$(function(){
    b_search = {
        removeSuggestion: function(sugg_val) {
            if (ide_data['recent_files'].includes(sugg_val)) {
                ide_data['recent_files'].splice(ide_data['recent_files'].indexOf(sugg_val), 1);
            }
        },

        addSuggestion: function(sugg_val) {
            ide_data['recent_files'].unshift(sugg_val);
        }
    }
});

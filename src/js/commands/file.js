/*
    [
        regex,
        'match'/'grep',
        'callbacks'
    ]
*/

$(function(){
    addCommands(file_commands);
})

var setPJFolder = {
    suggest: function(result) {
        console.log('suggest');
        console.log(result);
    },

    select: function(result) {
        console.log('select');
        console.log(result);
    }
}

var file_commands = {
    file: [
        [/(set)[ ](.+)/, 'match', setPJFolder]
    ]
}

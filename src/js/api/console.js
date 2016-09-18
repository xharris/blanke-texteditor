var b_console;

$(function(){
    $(".console > .input").keyup(function(event){
        // ENTER key
        if(event.keyCode == 13){
            console.log($(this).value());
        }
    });
    
    b_console = {
        toggleVisibility: function() {
            $(".console").toggleClass("open");
        },
        
        runCommand: function(cmd) {
            
        }
    }
})
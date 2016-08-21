var cmd_path;

var selected_script = '';
var scripts = {};

document.addEventListener("plugin_js_loaded", function(e) {
    if (e.detail.plugin.name === "Command Palette") {
        // Plugin has loaded
        b_search.addCommands(cmd);
        
        $("#main_window").append(
            '<div class="cmd-palette">'+
                '<button class="btn-close" onclick="$(this).parent().removeClass(\'active\');"><i class="mdi mdi-close"></i></button>'+
                '<div class="list-container">'+
                    '<div class="list"></div>'+
                    '<button class="btn-add" onclick="cmd_addScript()"><i class="mdi mdi-plus"></i></button>'+
                    '<button class="btn-remove" onclick="cmd_removeScript(selected_script);"><i class="mdi mdi-minus"></i></button>'+
                '</div>'+
                '<div class="editor-container">'+
                    '<div class="input-group">'+
                        '<span>Name:</span>'+
                        '<input class="cmd-title" type="text">'+
                        '<button class="btn-test" onclick="cmd_runScript(selected_script)"><i class="mdi mdi-play"></i></button>'+
                    '</div>'+
                    '<textarea class="editor"></textarea>'+
                '</div>'+
            '</div>'+
            '<div class="cmd-buttons">'+
            '</div>'
        );
        
        document.addEventListener("post_set_project", function() {
            if (!Object.keys(scripts).includes(b_ide.getData().current_project)) {
                scripts[b_ide.getData().current_project] = {};
            }
        });
        
        $(".cmd-palette textarea").change(function(){
            cmd_saveScript(); 
        });
        $(".cmd-palette .cmd-title").change(function(){
            cmd_saveScript(); 
        });
        
        cmd_loadScripts();
    }
});

// [command, arg hints]
var cmd_commands = [
    ['cmd add','(create runnable script)'],
    ['cmd view','(view scripts)'],
    ['cmd run', '[script name]']
];

var cmd = {
    commands: cmd_commands,
    action: cmd_action
};

function cmd_action(input) {
    var input_parts = input.split(/[ ]+/);
    
    if (b_ide.isProjectSet()) {
        if (input_parts[0] === 'cmd') {
            if (input_parts[1] === 'add') {
                cmd_loadScripts();
                cmd_refreshList();
                $(".cmd-palette .btn-add").trigger('click');
            }
            
            if (input_parts[1] === 'view') {
                cmd_refreshList();
                $(".cmd-palette").addClass("active");
            }
        }
    } else {
        b_ide.addToast({
            message: labels.plugin + ' a project must be open',
            can_dismiss: true,
            timeout: 1000
        });
    }
}

function cmd_clearList() {
    $(".cmd-palette .list").empty();
    $(".cmd-buttons").empty();
}

function cmd_refreshList() {
    cmd_clearList();
    
    var keys = [];
    
    // add project if it doesn't exist
    if (!Object.keys(scripts).includes(b_project.curr_project)) {
        scripts[b_ide.getData().current_project] = {};
    }
    
    if (b_ide.isProjectSet()){
        keys = Object.keys(scripts[b_project.curr_project]);
    }
    
    if (keys.length === 0) {
        $(".cmd-palette .list-container > .list").append(
            "<p class='none'>no commands saved</p>"
        );
    }
    
    for (var k = 0; k < keys.length; k++) {
        cmd_addToList(keys[k], scripts[b_project.curr_project][keys[k]]);
    }
    
    if (selected_script !== '') {
        $(".editor-container").addClass("active");
    } else {
        $(".editor-container").removeClass("active");
    }
}

// saves currently opened script
function cmd_saveScript() {
    if (selected_script !== '') {
        scripts[b_project.curr_project][selected_script].name = $(".editor-container .cmd-title").val();
        scripts[b_project.curr_project][selected_script].text = $(".editor-container textarea").val();
        
        cmd_refreshList();
        cmd_saveData();
    }
}

function cmd_loadScripts() {
    b_plugin.loadData("Command Palette", "data.json", 'utf-8', function(err, data) {
        if (!err) {
            scripts = JSON.parse(data);
            cmd_refreshList();
        } else {
            console.log('ERR: cmd_palette - no scripts saved.');
        }
    });
}

function cmd_saveData() {
    b_plugin.saveData("Command Palette", "data.json", JSON.stringify(scripts), {flag: 'w+'});
}

function cmd_selectScript(guid) {
    $(".editor-container").addClass("active");
    
    $(".editor-container .cmd-title").val(scripts[b_project.curr_project][guid].name);
    $(".editor-container textarea").val(scripts[b_project.curr_project][guid].text);
    
    $(".cmd-palette .list-container .command").removeClass('selected');
    $(".cmd-palette .list-container .command[data-guid='"+guid+"'").addClass('selected');
    
    selected_script = guid;
}

function cmd_addToList(guid, info) {
    if (Object.keys(scripts[b_project.curr_project]).length === 0) {
        cmd_clearList();
    }
    $(".editor-container").addClass("active");
    
    scripts[b_project.curr_project][guid] = info;
    
    var selected = '';
    if (guid === selected_script) {
        selected = ' selected';
    }
    $(".cmd-palette .list-container > .list").append(
        "<div class='command"+selected+"' data-guid='"+guid+"' onclick='cmd_selectScript(\""+guid+"\")'>"+ info.name +"</div>"
    );
    
    if (info.icon !== '') {
        $(".cmd-buttons").append(
            "<button><i class='mdi mdi-"+info.icon+"' title='"+info.name+"' onclick='cmd_runScript(\""+guid+"\");'></i></button>"    
        );
    }
}

function cmd_runScript(guid) {
    var code = scripts[b_project.curr_project][guid].text;
    
    if (nwOS.type() === "Windows_NT") {
        code = "start cmd /k \"" + code + "\"";
    }
    
    console.log(code)
    
    nwCHILD.exec(code, {cwd: b_project.curr_project}, function(err, stdout, stderr){
        console.log(stdout)
    })
}

function cmd_addScript() {
    var new_script = {
        'name': 'new script',
        'path': '',
        'text': '',
        'icon': 'play',
    }
    var new_guid = guid();
    
    cmd_addToList(new_guid, new_script);
    cmd_selectScript(new_guid);
    
    $(".cmd-palette").addClass("active");
}

function cmd_removeScript(guid) {
    delete scripts[b_ide.getData().current_project][guid];
    $(".editor-container").removeClass("active");
    selected_script = '';
    cmd_refreshList();
}
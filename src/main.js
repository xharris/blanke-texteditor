const DEV_MODE = true; // show dev tools

/* electron start */
const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const {ipcMain} = require('electron');
const {ipcRenderer} = require('electron');
const {globalShortcut} = require('electron');
const dialog = require('electron').dialog;
const {Menu} = require("electron");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {

    // get data from init.json
    var path = require("path");
    var fs = require("fs");
    var initPath = path.join(app.getPath('userData'), "init.json");
    var data;
    try {
        data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
    }
    catch(e) {
    }
    // Create the browser window.
    mainWindow = new BrowserWindow({
        // default window settings
        title: data.title ? data.title : "BlankE",
        center: data.x ? false : true,
        autoHideMenuBar: true,
        width: data.width ? data.width : 800,
        height: data.height ? data.height : 600,
        frame: false,
    });

    mainWindow.on("close", function() {
        var win_bounds = mainWindow.getBounds();

        var data = {
            title: "BlankE",
            x: win_bounds.x,
            y: win_bounds.y,
            width: win_bounds.width,
            height: win_bounds.height
        };
        fs.writeFileSync(initPath, JSON.stringify(data));
    })

  global.shareVars = {args: process.argv};

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (DEV_MODE) {
      mainWindow.webContents.openDevTools();
      mainWindow.webContents.send("set-devmode-true");
  }

  mainWindow.setMenu(null);

  globalShortcut.register('Control+R', () => {
      mainWindow.webContents.send("focus-search");
  });

    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));


}

// Emitted when the window is closed.
app.on('closed', function () {
  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.

});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  mainWindow.webContents.send('window-close');
  ipcMain.on('confirm-window-close', function(event) {
      mainWindow = null;
  });
  app.quit();
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function (files) {
    if (files) event.sender.send('selected-directory', files);
  });
});

ipcMain.on('show-dev-tools', function(event) {
    mainWindow.webContents.openDevTools();
});

ipcMain.on('set-win-title', function(event, title) {
    mainWindow.setTitle(title);
});

ipcMain.on('close', function(event) {
    console.log('close');
    mainWindow.close();
});

ipcMain.on('maximize', function(event) {
    console.log('max');
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('minimize', function(event) {
    console.log('min');
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    } else {
        mainWindow.minimize();
    }
});

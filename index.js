const electron = require('electron')
const { app, BrowserWindow, Menu, Tray, ipcMain } = electron
let child = require('child_process').execFile
let fs = require('fs')

let files = undefined
parseJSON()
let tray = undefined
let mainWindow = undefined
let editor = undefined
let contextMenu = undefined
function createWindow() {
    let display = electron.screen.getPrimaryDisplay()
    let displayWidth = display.bounds.width
    let displayHeight = display.bounds.height
    mainWindow = new BrowserWindow({
        width: 250,
        height: 400,
        x: displayWidth - 250,
        y: displayHeight - 440,
        movable: false,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
    windowOutside()
}

function createTray() {
    tray = new Tray('icon.png')
    contextMenu = Menu.buildFromTemplate([
        {label: 'Run on Startup', type: 'checkbox', checked: true},
        {type: 'separator'},
        {label: 'Quit', type: 'normal'}
    ])
    tray.setContextMenu(contextMenu)
    tray.setToolTip('Quick Start')
    tray.on('click', event => {
        toggleWindow()
    })
}

function createEditor() {
    editor = new BrowserWindow({
        width: 800,
        height: 600,
        movable: true,
        show: true,
        frame: false,
        fullscreenable: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    editor.loadFile('editor.html')
}

function toggleWindow() {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
}

function windowOutside() {
    mainWindow.on('blur', () => {
        mainWindow.hide()
    })
}

function parseJSON() {
    fs.readFile('files.json', (err, data) => {
        if (data) {
            files = JSON.parse(data)
        } else {
            console.log('No files.json file!')
        }
    })
}

ipcMain.on('requestJSON', (event) => {
    event.reply('responseJSON', files)
})

ipcMain.on('launchEXE', (event, arg) => {
    let keys = Object.keys(files)
    keys.forEach(key => {
        if (key === arg) {
            let executables = files[key].exe
            executables.forEach(exe => {
                child(exe, (err, data) => {
                    console.log(err)
                    console.log(data)
                })
            })
        } else {
            
        }
    })
})

ipcMain.on('createGroup', (event) => {
    createEditor()
})

ipcMain.on('closeEditor', (event) => {
    editor.close()
    editor = undefined
    toggleWindow()
})

ipcMain.on('addGroup', (event, arg) => {
    // console.log(arg)
    files[`${arg.name}`] = arg
    console.log(files)
    let appendJSON = JSON.stringify(files)
    fs.writeFile('files.json', appendJSON, (err) => {
        if (!err) {
            mainWindow.webContents.send('responseJSON', files)
        }
    })
})

app.on('ready', () => {
    createTray()
    createWindow()
})


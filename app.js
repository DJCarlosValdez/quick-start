const { ipcRenderer } = require('electron')

ipcRenderer.send('requestJSON')

ipcRenderer.on('responseJSON', (event, arg) => {
    let keys = Object.keys(arg)
    console.log(keys)
    $('.buttons-wrapper').html('')
    keys.forEach(key => {
        const keyName = arg[key].name
        appendHTML(keyName)
        // console.log(keyName)
    })
})

function appendHTML (key) {
    $('.buttons-wrapper').append(`<div class="button button-block" id="exe${key}"><p>${key}</p></div>`).off().on('click', function (e) {
        ipcRenderer.send('launchEXE', e.target.textContent)
    })
}

$('#new').on('click', () => {
    ipcRenderer.send('createGroup')
})
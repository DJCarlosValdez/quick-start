const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote
let apps = []

$('#exit').on('click', () => {
    ipcRenderer.send('closeEditor')
})

$('#addEXE i').on('click', () => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: "Apps", extensions: ['exe'] }
        ]
    }).then(result => {
        console.log(result.canceled)
        if (!result.canceled) {
            const exePath = result.filePaths[0]
            const arr = exePath.split('\\')
            const exeFile = arr[arr.length - 1].split('.')[0]
            if (!apps.includes(exeFile)) {
                console.log(exeFile)
                $('.links-title').after(`<tr id="${exeFile}"><td>${result.filePaths}<i id="exeDelete" class="fas fa-trash-alt"></i><i id="exeEdit" class="fas fa-pen"></i></td></tr>)`)
                apps.push(exeFile)
                $(`#${exeFile} i`).on('click', e => {
                    editEXE(e)
                })
            } else {
                let tag = generateTag(exeFile, 1)
                console.log(tag)
                $('.links-title').after(`<tr id="${tag}"><td>${result.filePaths}<i id="exeDelete" class="fas fa-trash-alt"></i><i id="exeEdit" class="fas fa-pen"></i></td></tr>)`)
                apps.push(tag)
                $(`#${tag} i`).on('click', e => {
                    editEXE(e)
                })
            }
        } else {
            console.log('No selecciono un programa')
        }
    })
})

$('#submit').on('click', () => {
    let name = $('#editorGroupName').val()
    let exes = {
        name: name,
        exe: []
    }
    apps.forEach(key => {
        let value = $(`#${key} td`)[0].innerText
        let splitValue = value.split('\\')
        let regexValue = ''
        splitValue.forEach(val => {
            if (!val.includes('.exe')) {
                regexValue += val + "\\"
            } else {
                regexValue += val
            }
        })
        console.log(regexValue)
        exes.exe.push(regexValue)
    })
    console.log(exes)
    ipcRenderer.send('addGroup', exes)
    ipcRenderer.send('closeEditor')
})

const editEXE = (event) => {
    const parent = event.target.parentNode.parentNode
    const id = event.target.id
    if (id === "exeDelete") {
        console.log(parent)
        $(parent).remove()
        apps = apps.filter(key => key !== parent.id)
        console.log(apps)
    } else if (id === "exeEdit") {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: "Apps", extensions: ['exe'] }
            ]
        }).then(result => {
            console.log(result.canceled)
            if (!result.canceled) {
                apps = apps.filter(key => key !== parent.id)
                const exePath = result.filePaths[0]
                const arr = exePath.split('\\')
                const exeFile = arr[arr.length - 1].split('.')[0]
                if (!apps.includes(exeFile)) {
                    apps.push(exeFile)
                    console.log(apps)
                    $(parent).attr('id', exeFile)
                    $(parent).html(`<td>${result.filePaths}<i id="exeDelete" class="fas fa-trash-alt"></i><i id="exeEdit" class="fas fa-pen"></i></td>)`)
                    $(`#${exeFile} i`).on('click', e => {
                        editEXE(e)
                    })
                } else {
                    let tag = generateTag(exeFile, 1)
                    apps.push(tag)
                    console.log(apps)
                    $(parent).attr('id', tag)
                    $(parent).html(`<td>${result.filePaths}<i id="exeDelete" class="fas fa-trash-alt"></i><i id="exeEdit" class="fas fa-pen"></i></td>)`)
                    $(`#${tag} i`).on('click', e => {
                        editEXE(e)
                    })
                }
            } else {
                console.log('No selecciono un programa')
            }
        })
    }
}

const generateTag = (name, i) => {
    let tag = name + "---" + i

    if (apps.includes(tag)) {
        let iTag = parseInt(tag.split("---")[1]) + 1
        return name + "---" + iTag
    } else {
        return tag
    }
}

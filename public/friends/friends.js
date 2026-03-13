
var mfs = document.getElementById('my-friends-side')
var ffs = document.getElementById('find-friends-side')
var mrs = document.getElementById('my-requests-side')
var bs = document.getElementById('blacklist-side')
var req_picker = document.getElementById('req-picker')

var ffs_list = document.getElementsByClassName('findfriends')
var mfs_list = document.getElementsByClassName('myfriends')
var mrs_list = document.getElementsByClassName("myrequests")
var bs_list = document.getElementsByClassName('blacklist')

var addfr_buttons = document.getElementsByClassName('buttons-addfriend')
var profile_picture = document.getElementsByClassName('profile-picture')
var thelist = document.getElementsByClassName('ff-event-placeholder')
var thereqtomelist = document.getElementsByClassName('request-holder-tome')
var thereqfrommelist = document.getElementsByClassName('request-holder-fromme')

var reqtome = document.getElementsByClassName('reqtome')
var reqfromme = document.getElementsByClassName('reqfromme')



var listff_name = document.getElementById('listff-name')

var list_array = [mfs, ffs, mrs, bs]

loadFriends()

function target_sided(target){
    mfs.classList.remove('slide-active')
    ffs.classList.remove('slide-active')
    mrs.classList.remove('slide-active')
    bs.classList.remove('slide-active')

    target.classList.add('slide-active')
}

reqtome[0].addEventListener('click', () => {
    thereqtomelist[0].classList.remove('hidden')
    thereqfrommelist[0].classList.add('hidden')

    reqtome[0].classList.add('request-button-picked')
    reqfromme[0].classList.remove('request-button-picked')
})

reqfromme[0].addEventListener('click', () => {
    thereqtomelist[0].classList.add('hidden')
    thereqfrommelist[0].classList.remove('hidden')

    reqtome[0].classList.remove('request-button-picked')
    reqfromme[0].classList.add('request-button-picked')
})

thereqfrommelist[0].addEventListener('click', async (event) => {
    if (event.target.classList.contains('fromme-cancel')){
        let x = event.target.parentElement
        let c = x.parentElement
        let y = c.querySelector('a').textContent
        deletefriend(y)
        loadreqfromme(document.cookie)
    }
})

async function createchat(towho) {
    let x = await fetch ('/chat/createchat', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            id: towho
        })
    })

    let res = await x.json()
    window.location.href = `/active/${towho}`
}

mfs_list[0].addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-friend')){
        let x = event.target.parentElement
        let c = x.parentElement
        let y = c.querySelector('a').textContent
        if (confirm("Удалить этого друга?")){
            deletefriend(y)
        }
        
    }
    if (event.target.classList.contains('message-friend')){
        let x = event.target.parentElement
        let c = x.parentElement
        let y = c.querySelector('a').textContent
        createchat(y)
    }
})

async function deletefriend(id) {
    
    let x = await fetch ('/changeapi/deletefriend', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            id: id
        })
    })

    let res = await x.json()
    mfs_list[0].replaceChildren()
    await loadFriends()

}

thelist[0].addEventListener('click', async function(event) {
    if (event.target.classList.contains('profile-picture')){
        let x = event.target.parentElement
        let y = x.querySelector('a').textContent
        window.location.href = `/user/${y}`
    }
    if (event.target.classList.contains('buttons-addfriend')){
        let x = event.target.parentElement
        let y = x.parentElement
        let c = y.querySelector('a').textContent
        let r = await sendfriendreq(c, document.cookie)
        updatedata()
    }
})

async function acceptcancelreq(data, Type){
    let x = await fetch ('/changeapi/acreq', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            id: data,
            type: Type
        })
    })

    let responce = await x.json()
    thereqtomelist[0].replaceChildren()
    loadreqtome(document.cookie)
}

thereqtomelist[0].addEventListener('click', (element) => {
     if (element.target.classList.contains('req-accept')){
            let buttons = document.getElementsByClassName('req-accept')
            let tables = thereqtomelist[0].children
            let index = Array.from(buttons).indexOf(element.target)
            let side_index = document.getElementById('new_friends_request')
            side_index.textContent = Number(side_index.textContent) - 1
            if (side_index.textContent < 1){ side_index.textContent = "" }

            let target_id = tables[index].querySelector('a').textContent

            acceptcancelreq(target_id, 'accept')

        }
        if (element.target.classList.contains('req-cancel')){
            let buttons = document.getElementsByClassName('req-cancel')
            let tables = thereqtomelist[0].children
            let index = Array.from(buttons).indexOf(element.target)

            let target_id = tables[index].querySelector('a').textContent

            console.log("tryin to cancel")
            acceptcancelreq(target_id, 'cancel')
        }
})

list_array.forEach(element => {
    element.addEventListener('click', async function(){
        target_sided(element)

        mfs_list[0].classList.add('hidden')
        ffs_list[0].classList.add('hidden')
        mrs_list[0].classList.add('hidden')
        bs_list[0].classList.add('hidden')

        if (element.id == "my-friends-side"){
            mfs_list[0].classList.remove('hidden')
            await loadFriends()
        }
        if (element.id == "find-friends-side"){
            ffs_list[0].classList.remove('hidden')
        }
        if (element.id == "my-requests-side"){
            mrs_list[0].classList.remove('hidden')
            loadreqtome(document.cookie)
            loadreqfromme(document.cookie)

        }
        if (element.id == "blacklist-side"){
            bs_list[0].classList.remove('hidden')
        }
    })
});

async function getnameandbd(id) {
    return (await fetch (`/profileapi/${id}`)).json();
}

async function createdatareq(data){
    for (let n in data){
        let x = await getnameandbd(data[n].friendId)

        let user_data = {
            name: x.name,
            age: x.bd,
            id: data[n].friendId
        }

        createdatareqtome(user_data)
    }
}

async function loadreqtome(token) {
    thereqtomelist[0].replaceChildren()
    let x = await fetch ('/sendreq/readfriendreq', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token
        })
    })

    if (!x.ok) {
        console.log("Ошибка сервера:", x.status)
        return
    }
    let response = await x.json()
    createdatareq(response)
}

listff_name.addEventListener('input', async function(){
    updatedata()
})

async function updatedata() {
    let x = await finduserid(listff_name.value)
    if (x == "no one found"){
        thelist[0].replaceChildren()
    } else {
        thelist[0].replaceChildren()
        createdata(x)
    }
}

async function sendfriendreq(userid, token) {
    let x = await fetch ('/sendreq/sendfriendreq', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userid,
            token: token
        })
    })

    let responce = await x.json()
}

async function finduserid(userdata) {
    let x = await fetch('/changeapi/finduser', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            name: userdata,
            id: userdata
        })
    })

    let response = await x.json()
    if (response.error){
        return "no one found"
    }
    let data = {
        id: response.id,
        name: response.name,
        age: response.age,
        status: response.status
    }
    return data
}

async function loadFriends() {
    mfs_list[0].replaceChildren()
    let x = await fetch('/changeapi/Myfriendlist', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie
        })
    })

    let response = await x.json()
    for (let i = 0; i < response.length; i++){
        let user = response[i]
        let data = {
            name: user.name,
            age: user.age,
            status: user.status,
            id: user.id
        }
        createdatatoFL(data)
    }
}

async function loadreqfromme(token) {
    thereqfrommelist[0].replaceChildren()
    let x = await fetch ('/changeapi/frommereq', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token
        })
    })
    let res = await x.json()
    for (let i = 0; i < res.length; i++){
        let user = res[i]
        let data = {
            name: user.name,
            age: user.age,
            status: user.status,
            id: user.id
        }
        ReqFrommeData(data)
    }
}

function ReqFrommeData(data){

    let box = document.createElement('div')
    let img = document.createElement('img')
    let fd = document.createElement('nav')
    let h3 = document.createElement('h3')
    let p = document.createElement('p')
    let lync = document.createElement('a')
    let sd = document.createElement('div')
    let button = document.createElement('button')

    box.append(img)
    box.append(fd)
    fd.append(h3)
    fd.append(p)
    box.append(lync)
    box.append(sd)
    sd.append(button)

    h3.textContent  = data.name
    p.textContent  = findYO(data.age)
    lync.textContent  = data.id
    button.textContent = "❌"

    
    thereqfrommelist[0].append(box)

    box.classList.add('profile')
    lync.classList.add('id')
    sd.classList.add('buttonholder')
    img.classList.add('profile-picture')
    button.classList.add('fromme-cancel')
}

function createdatatoFL(data){
    let box = document.createElement('div')
    let img = document.createElement('img')
    let fd = document.createElement('nav')
    let h3 = document.createElement('h3')
    let p = document.createElement('p')
    let lync = document.createElement('a')
    let sd = document.createElement('div')
    let button = document.createElement('button')
    let button2 = document.createElement('button')

    box.append(img)
    box.append(fd)
    fd.append(h3)
    fd.append(p)
    box.append(lync)
    box.append(sd)
    sd.append(button)
    sd.append(button2)

    h3.textContent  = data.name
    p.textContent  = findYO(data.age)
    lync.textContent  = data.id
    button.textContent  = "✉️"
    button2.textContent  = "🗑️"
    
    mfs_list[0].append(box)

    box.classList.add('profile')
    lync.classList.add('id')
    sd.classList.add('buttonholder')
    img.classList.add('profile-picture')
    button.classList.add('message-friend')
    button2.classList.add('delete-friend')
}

function createdatareqtome(data){

    let box = document.createElement('div')
    let img = document.createElement('img')
    let fd = document.createElement('div')
    let h3 = document.createElement('h3')
    let p = document.createElement('p')
    let lync = document.createElement('a')
    let sd = document.createElement('div')
    let button = document.createElement('button')
    let button2 = document.createElement('button')

    box.append(img)
    box.append(fd)
    fd.append(h3)
    fd.append(p)
    box.append(lync)
    box.append(sd)
    sd.append(button)
    sd.append(button2)

    h3.textContent  = data.name
    p.textContent  = findYO(data.age)
    lync.textContent  = data.id
    button.textContent  = "✔️"
    button2.textContent  = "❌"
    
    thereqtomelist[0].append(box)

    box.classList.add('profile')
    lync.classList.add('id')
    sd.classList.add('buttonholder')
    img.classList.add('profile-picture')
    button.classList.add('req-accept')
    button2.classList.add('req-cancel')
}

function createdata(data){
    let box = document.createElement('div')
    let img = document.createElement('img')
    let fd = document.createElement('div')
    let h3 = document.createElement('h3')
    let p = document.createElement('p')
    let lync = document.createElement('a')
    let sd = document.createElement('div')
    let button = document.createElement('button')

    box.append(img)
    box.append(fd)
    fd.append(h3)
    fd.append(p)
    box.append(lync)
    box.append(sd)
    sd.append(button)

    h3.textContent  = data.name
    p.textContent  = findYO(data.age)
    lync.textContent  = data.id

    
    thelist[0].append(box)

    box.classList.add('profile')
    lync.classList.add('id')
    sd.classList.add('buttonholder')
    img.classList.add('profile-picture')
    if (data.status == "none" || data.status == "request"){
        button.classList.add('buttons-addfriend')
        button.textContent = "➕"
    } else if (data.status == "sender"){
        button.textContent = "⏰"
        button.classList.add('buttons-none')
    } else if (data.status == "friended"){
        button.textContent = "👥"
        button.classList.add('buttons-none')
    }
}

function findYO(data){
    let today = new Date().toISOString().split('T')[0];
    today = today.split('-')
    let arr = data.split('-')
    let age = today[0] - arr[0]
    if (today[1] < arr[1]){
        age = age - 1
    }
    if (today[1] == arr[1]){
        if(Number(today[2]) < Number(arr[2])){
            age = age - 1
        }
    }
    return `${age} Years old`
}


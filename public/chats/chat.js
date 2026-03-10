
var thechat = document.getElementsByClassName('chat')
var titlename = document.getElementById('user-username')
var inner_text = document.getElementById('inner-text')
var send_button = document.getElementById('send-button')
var user_lync = document.getElementsByClassName('user')
var edit_buttons = document.getElementsByClassName('message-side-buttons')
var input_wearer = document.getElementsByClassName('input-side')

thechat[0].addEventListener('click', async (event) => {
    if (event.target.classList.contains('edit_message')){
        let x = event.target.closest('.mymes')
        context = x.querySelector('p')
        inner_text.value = context.textContent
        send_button.textContent = "Edit"
        input_wearer[0].id = x.id
        inner_text.classList.add('editmode')
    }
    if (event.target.classList.contains('delete_message')){
        let id = event.target.closest('.mymes')
        if (!confirm("Удалить сообщение?")){return}
        if (input_wearer[0].id != ""){
            input_wearer[0].id = ""
            inner_text.value = ""
            send_button.textContent = "Send"
            inner_text.classList.remove('editmode')
        }
        let x = await fetch('/chat/deletemessage', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            Towhoid: window.location.pathname.split('/')[2],
            id: id.id
        })})
        let respone = await x.json()

        thechat[0].replaceChildren()
        firstLoad()
    }

})

async function sendtry(){
    let now = new Date()
    let text = inner_text.value
    let now_hour = now.getHours() 
    let now_minute = now.getMinutes()
    let date = `${String(now_hour).padStart(2,'0')}:${String(now_minute).padStart(2,'0')}`

    inner_text.value = ""

    let x = await fetch('/chat/sendmessage', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            Towhoid: window.location.pathname.split('/')[2],
            text: text,
            send_date: date,
        })
    })
    let res = await x.json()
    if (res.error){ console.log(res.error) }
    loaddata()
}

user_lync[0].addEventListener('click', () => {
    let x = window.location.pathname.split('/')[2]
    window.location.href = `/user/${x}`
})

send_button.addEventListener('click', async() => {
    if (!inner_text.classList.contains('editmode')){
        sendtry()
    } else { sendedittry()
        inner_text.classList.remove('editmode')
        send_button.textContent = "Send"
    }
})

async function sendedittry() {
    let x = await fetch('/chat/sendedittry', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            Towhoid: window.location.pathname.split('/')[2],
            id: input_wearer[0].id,
            text: inner_text.value
        })
    })
    let responce = await x.json()
    if (responce.error) { console.log(responce.error) }
    input_wearer[0].id = ""
    inner_text.value = ""
    thechat[0].replaceChildren()
    firstLoad()
}

inner_text.addEventListener('keydown', async(event) => {
    if (event.key === "Enter"){
        event.preventDefault()
        if (!inner_text.classList.contains('editmode')){
        sendtry()
        } else { sendedittry()
            inner_text.classList.remove('editmode')
            send_button.textContent = "Send"
        }
    }
})

async function firstLoad(){
    let x = await fetch('/chat/loadalldata', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            Towhoid: window.location.pathname.split('/')[2]
        })
    })
    let res = await x.json()
    titlename.textContent = res.name

    for (let y of res.messages){
        if (y.author == window.location.pathname.split('/')[2]){
            createHismes(y)
        } else { createMymes(y) }
    }
    if (res.error != "notfriended"){
        send_button.classList.remove('hidden')
    }
} firstLoad()

function createHismes(data){
    let box = document.createElement('div')
    let h3 = document.createElement('h3')
    let inner = document.createElement('p')
    let subholder = document.createElement('div')
    let time = document.createElement('p')

    inner.textContent = data.text
    time.textContent = data.send_date

    box.append(h3)
    box.append(inner)
    box.append(subholder)
    subholder.append(time)

    thechat[0].prepend(box)

    box.id = data._id
    box.classList.add('hismes')
    subholder.classList.add('downsigns')
    time.classList.add('time')
}

function createMymes(data){
    let box = document.createElement('div')
    let inner = document.createElement('p')
    let subholder = document.createElement('div')
    let time = document.createElement('p')
    let status = document.createElement('p')

    let sidebutton_holder = document.createElement('div')
    let first_side = document.createElement('button')
    let second_side = document.createElement('button')

    first_side.textContent = "✍️"
    second_side.textContent = "🗑️"
    inner.textContent = data.text
    time.textContent = data.send_date
    status.textContent = data.status

    sidebutton_holder.append(first_side)
    sidebutton_holder.append(second_side)

    subholder.append(sidebutton_holder)
    box.append(inner)
    box.append(subholder)
    subholder.append(time)
    subholder.append(status)
    

    thechat[0].prepend(box)

    box.id = data._id
    box.classList.add('mymes')
    subholder.classList.add('downsigns')
    time.classList.add('time')
    status.classList.add('status')
    sidebutton_holder.classList.add('message-side-buttons')
    first_side.classList.add('edit_message')
    second_side.classList.add('delete_message')

    edit_buttons = document.getElementsByClassName('message-side-buttons')
}

async function loaddata() {
    let ml = Array.from(thechat[0].children)
    if (!ml[0]){ theid = null } else { theid = ml[0].id }
    let x = await fetch('/chat/loaddata', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            Towhoid: window.location.pathname.split('/')[2],
            lastmesid: theid
        })
    })
    let res = await x.json()
    if (!res.message){
        for(let y of res){
            if (y.author == window.location.pathname.split('/')[2]){
            createHismes(y)
        } else { createMymes(y) }
        }
    }
}

setInterval(loaddata, 3000)
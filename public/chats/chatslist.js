var lync_friend = document.getElementById('lync-friends')
var chats = document.getElementsByClassName('chats')

lync_friend.addEventListener('click', () => {
    window.location.href = "/friends/friends.html"
})

chats[0].addEventListener('click', (event) => {
    if (event.target.closest('.delete-chat')){
        if (confirm("Удалить этот чат?")){
        let x = event.target.parentElement
        let c = x.parentElement
        let chatid = c.id
        deletechat(chatid)
        }
    } else if (event.target.closest('.chat')){
    let chat = event.target.closest('.chat')
    let chatid = chat.id
    let nav = chat.querySelector('nav').id
    window.location.href = `/active/${nav}`
    }     
})

async function deletechat(chatid) {
    let x = await fetch('/chat/deletechat', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            chatid: chatid
        })
    })

    res = await x.json()
    chats[0].replaceChildren()
    updateMyChats(document.cookie)
}

async function updateMyChats(token) {
    
    let x = await fetch('/chat/mylists', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
        })
    })

    let res = await x.json()
    createChatsdata(res)
} updateMyChats(document.cookie)

async function createChatsdata(data){
    for (let x of data){

        let t = await fetch('/chat/getlast', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            Towhoid: x.towhosId
        })
        })
        let response = await t.json()


        let chat = document.createElement('div')
        let img = document.createElement('img')
        let box = document.createElement('div')
        let nav = document.createElement('nav')
        let h3 = document.createElement('h3')
        let date = document.createElement('div')
        let lastmes = document.createElement('p')
        let buttonholder = document.createElement('div')
        let button = document.createElement('button') 

        chat.append(img)
        chat.append(box)
        chat.append(buttonholder)
        box.append(nav)
        box.append(lastmes)
        nav.append(h3)
        nav.append(date)
        buttonholder.append(button)

        chat.id = x.chatid
        nav.id = x.towhosId
        h3.textContent = x.towho
        date.textContent = x.lu
        if (response.text){
            let add = ""
            if (response.text.text.length > 20){ add = "..." }
            lastmes.textContent = response.text.text.slice(0, 20) + add
        } else { lastmes.textContent = "У вас еще нет сообщений" }
        
        button.textContent = "🗑️"

        chats[0].append(chat)

        chat.classList.add('chat')
        box.classList.add('box')
        date.classList.add('chat-data')
        buttonholder.classList.add('buttonholder')
        button.classList.add('delete-chat')
    }
}
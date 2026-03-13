var homelink = document.getElementById('home-link')
var friendslink = document.getElementById('friends-link')
var grouplink = document.getElementById('groups-link')
var settinglink = document.getElementById('settings-link')
var quitlink = document.getElementById('quit-link')
var chatlink = document.getElementById('message-link')
var logged = null

grouplink.addEventListener('click', () => {
    window.location.href = "/posts/create_post.html"
})

chatlink.addEventListener('click', () => {
    window.location.href = "/chats/chatslist.html"
})

friendslink.addEventListener('click', () => {
    window.location.href = "/friends/friends.html"
})

homelink.addEventListener('click', () => {
    if (logged){
        window.location.href = `/user/${logged}`
    } else {
        window.location.href = "/reg&log/login.html"
    }
})

settinglink.addEventListener('click', () => {
    window.location.href = '/settings/settings.html'
})

quitlink.addEventListener('click', () => {
    let result = confirm("Выйти из аккаунта?");
    if (result){
        document.cookie = `${logged}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "other=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        window.location.href = "/reg&log/login.html"
    }
})

async function tologcheck(token){
    let x = await fetch('/main_info', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token
        })
    })

    if(x.ok){
        let response = await x.json()
        logged = response.id
    } else {
        logged = null
        homelink.innerHTML = ""
        friendslink.innerHTML = ""
        grouplink.innerHTML = ""
        settinglink.innerHTML = ""
        quitlink.innerHTML = ""
        chatlink.innerHTML = ""
    }
    
}

async function AccountCheck() {
    tologcheck(document.cookie)
}

AccountCheck()
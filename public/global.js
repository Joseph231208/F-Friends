const tomain = document.getElementById('ToMain-href')
var tolog = document.getElementById('Login-href')
var torules = document.getElementById('ToRules-href')
var togropes = document.getElementById('ToGroups-href')
var logged = null

torules.addEventListener('click', () => {
    window.location.href = "/posts/create_post.html"
})

togropes.addEventListener('click', () => {
    window.location.href = "/chats/chatslist.html"
})

tomain.addEventListener('click', () => {
    window.location.href = "/"
})

tolog.addEventListener('click', () =>{
    if (logged){
        window.location.href = `/user/${logged}`
    } else {
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
        tolog.innerHTML = response.name
        tomain.innerHTML = "главная страница"
        togropes.innerHTML = "мои чаты"
        torules.innerHTML = "Создать пост"
    } else {
        logged = null
        tolog.innerHTML = "Войти в аккаунт"
    }
}

async function AccountCheck() {
    tologcheck(document.cookie)
}

AccountCheck()
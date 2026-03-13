var thechat = document.getElementsByClassName("event-side")
var bottom_trigger = document.getElementById('bottom-trigger')

thechat[0].addEventListener("click", async (e) => {
    if (e.target.classList.contains("likes")){
        reactpost(e.target.closest(".post-block").id, "liked")
    }
    if (e.target.classList.contains("dislikes")){
        reactpost(e.target.closest(".post-block").id, "disliked")
    }
    if (e.target.classList.contains("comments")){
        window.location.href = `/post/${e.target.closest(".post-block").id}`
    }
    if (e.target.classList.contains('deletepost_trigger')){
        if (confirm("Удалить этот пост?")){
            clear_edit()
            edit_mode = false
            await delete_post(e.target.closest('.post-block').id)
        }
    }
    if (e.target.classList.contains('editpost_trigger')){
        if (!edit_mode){
            edit_post(e.target.closest('.post-block').id)
            edit_mode = true 
        } else {
            let check = e.target.closest('.post-block')
            let button_context = check.querySelector('.editpost_trigger').textContent
            if (button_context == "✅"){
                let thetitle = check.querySelector('.body input').value
                let thetext = check.querySelector('.body textarea').value
                let cancel = (await server_edit_post(check.id, thetitle, thetext))
                clear_edit()
                if (cancel){
                    check.querySelector('.body h3').textContent = thetitle
                    check.querySelector('.body p').textContent = thetext
                }
            } else if ( button_context != "✅") {
                clear_edit()
                edit_post(e.target.closest('.post-block').id)
                edit_mode = true
            } else {
                clear_edit()
            }
        }
        
    }
})

var edit_mode = false
var comment_beforeedit = null
var comment_edittext = null
var comment_tonew = null

function clear_edit(){
    let target = thechat[0].querySelector('textarea')
    let root = target.closest('.post-block')

    let title = root.querySelector('.body input')
    let text = root.querySelector('.body textarea')
    let the_button = root.querySelector('.editpost_trigger')

    let title_to_change = document.createElement('h3')
    let text_to_change = document.createElement('p')

    title.replaceWith(title_to_change)
    text.replaceWith(text_to_change)

    title_to_change.textContent = comment_beforeedit.title
    text_to_change.textContent = comment_beforeedit.text 

    comment_beforeedit = null

    the_button.textContent = "✏️"
    
    edit_mode = false
}

async function server_edit_post(id, title, text) {
    let x = await fetch('/posts_user/edit_post_text', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            post_id: id,
            token: document.cookie,
            title: title,
            text: text
        })
    })
    let res = await x.json()
    if (!res.error){
        return true
    } else { return false }
}

async function edit_post(id) {
    let array = Array.from(thechat[0].children)
    let root = array.find( j => j.id == id)

    let title = root.querySelector(".body h3")
    let text = root.querySelector(".body p")
    let the_button = root.querySelector('.editpost_trigger')

    let title_to_change = document.createElement('input')
    let text_to_change = document.createElement('textarea')

    comment_beforeedit = {
        title: title.textContent,
        text: text.textContent
    }

    title.replaceWith(title_to_change)
    text.replaceWith(text_to_change)

    title_to_change.value = comment_beforeedit.title
    text_to_change.value = comment_beforeedit.text    

    the_button.textContent = "✅"
}

async function delete_post(id) {
    let x = await fetch('/posts_user/delete_post', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            post_id: id,
            token: document.cookie
        })
    })
    let res = await x.json()
    let target = document.getElementById(id)
    target.remove()
}

async function reactpost(id, type){
    try {
    let x = await fetch('/posts_user/react', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            post_id: id,
            type: type,
        })
    })
    res = await x.json()

    changereactcolor(id, res.type)

    getUpdatedpost(id)
    } catch {
        console.log("Нет аккаунта. Невозможно поставить лайк.")
    }
}

function changereactcolor(id, type){
    let all = document.getElementsByClassName("post-block")
    let theall = Array.from(all)
    let theone = theall.find(element => element.id === id)

    if (type == "liked"){
        theone.querySelector(".likes").classList.add('liked')
        theone.querySelector(".dislikes").classList.remove('disliked')
    } else if (type == "disliked"){
        theone.querySelector(".dislikes").classList.add('disliked')
        theone.querySelector(".likes").classList.remove('liked')
    } else if (type == "unliked"){
        theone.querySelector(".likes").classList.remove('liked')
        theone.querySelector(".dislikes").classList.remove('disliked')
    } else if (type == "undisliked"){
        theone.querySelector(".dislikes").classList.remove('disliked')
        theone.querySelector(".likes").classList.remove('liked')
    }
}

var postsloaded = 0

async function getPosts(){
    let iam = null
    try {
    if(!document.cookie == ''){
        let x = await fetch('/main_info', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
        })
    })
    let response = await x.json()
    iam = response.id
    }
    }catch (error) {
        iam = null
    }

    let x = await fetch('/posts_user/get_posts', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            skip: postsloaded
        })
    })
    let res = await x.json()
    
    if (res.x.length == 0){
        // let emptyness = document.createElement('div')
        // thechat[0].append(emptyness)
        // emptyness.classList.add('emptyness')
        // emptyness.textContent = ""
    }

    for (let x of res.x){
        createPost(x, iam)
            if (iam) {
                if (x.liked.includes(iam)){
                changereactcolor(x._id, "liked")
            } else if (x.dislikes.includes(iam)){
                changereactcolor(x._id, "disliked")
            }}  
        }     
}
    
async function getUpdatedpost(id){
    let x = await fetch('/posts_user/update_one', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            post_id: id
        })
    })
    let res = await x.json()
    updateonepost(res.post)
}

async function loadnew_posts() {
    await getPosts()
    postsloaded = postsloaded + 5
}

let observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        loadnew_posts()
    }
})

observer.observe(bottom_trigger)

function updateonepost(data){
    let all = document.getElementsByClassName("post-block")
    let theall = Array.from(all)
    let theone = theall.find(element => element.id === data._id) 
    
    if (!data.liked)
        data.liked = []
    if (!data.dislikes)
        data.dislikes = []
    if (!data.comments)
        data.comments = []

    
    theone.querySelector(".likes").textContent = `❤️ ${data.liked.length}`
    theone.querySelector(".dislikes").textContent = `👎 ${data.dislikes.length}`
    theone.querySelector(".comments").textContent = `💬 ${data.comments.length}`
}

function createPost(x, iam){
    let section = document.createElement("section")
    let box = document.createElement("div")
    let us_box = document.createElement("div")
    let img = document.createElement("img")
    let nav = document.createElement("nav")
    let first_h3 = document.createElement("h3")
    let date = document.createElement("p")
    let button_holder = document.createElement("div")
    let delete_button = document.createElement("button")
    let edit_button = document.createElement("button")
    let sub_line = document.createElement("div")
    let body_box = document.createElement("div")
    let second_h3 = document.createElement("h3")
    let post_text = document.createElement("p")

    let react_box = document.createElement("div")
    let comments = document.createElement("button")
    let likes_box = document.createElement("div")
    let likes = document.createElement("button")
    let dislikes = document.createElement("button")

    section.append(box)
    box.append(us_box)
    box.append(sub_line)
    box.append(body_box)
    us_box.append(img)
    us_box.append(nav)
    us_box.append(button_holder)
    nav.append(first_h3)
    nav.append(date)
    button_holder.append(delete_button)
    button_holder.append(edit_button)
    body_box.append(second_h3)
    body_box.append(post_text)

    box.append(react_box)
    react_box.append(comments)
    react_box.append(likes_box)
    likes_box.append(likes)
    likes_box.append(dislikes)

    thechat[0].insertBefore(section, bottom_trigger)

    first_h3.textContent = x.authorname
    date.textContent = x.bd
    second_h3.textContent = x.title
    post_text.textContent = x.text

    if (!x.liked)
        x.liked = []
    if (!x.dislikes)
        x.dislikes = []
    if (!x.comments)
        x.comments = []

    likes.textContent = `❤️ ${x.liked.length}`
    dislikes.textContent = `👎 ${x.dislikes.length}`
    comments.textContent = `💬 ${x.comments.length}`


    if (x.authorid === iam){
        delete_button.textContent = "🗑️"
        edit_button.textContent = "✏️"
        delete_button.classList.add('deletepost_trigger')
        edit_button.classList.add('editpost_trigger')
    }

    section.classList.add("post-block")
    box.classList.add("post")
    us_box.classList.add("user-block")
    button_holder.classList.add("button-holder")
    sub_line.classList.add("sub-line")
    body_box.classList.add("body")

    react_box.classList.add("reacts")
    comments.classList.add("comments")
    likes.classList.add("likes")
    dislikes.classList.add("dislikes")
    likes_box.classList.add("likes-box")
    section.id = x._id
}
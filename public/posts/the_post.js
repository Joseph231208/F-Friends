
var post_author_holder = document.getElementsByClassName('user-profile')
var create_holder = document.getElementsByClassName('make-own')
var comments_holder = document.getElementsByClassName('comments')
var comment_button = document.getElementById('comment-button')
var my_comment_text = document.getElementById('own-comment-text')
var error = document.getElementsByClassName('error')

var post_like = document.getElementById('like_post')
var post_dislike = document.getElementById('dislike_post')

var the_post = document.getElementsByClassName('the-post')

comments_holder[0].addEventListener('click', async (e) => {
    if (e.target.classList.contains('like')){
        await react_comment(e.target.closest('.the_comment').id, "like")
    }
    if (e.target.classList.contains('dislike')){
        await react_comment(e.target.closest('.the_comment').id, "dislike")
    }
})

async function react_comment(id, type) {

    let x = await fetch('/posts_user/react_to_comment', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            comment_id: id,
            post_id: window.location.pathname.split('/')[2],
            type: type,
        })
    })

    res = await x.json()
    colored_comments(id, res.type)

}

comment_button.addEventListener('click', () => {
    createcomment(my_comment_text.value)
    my_comment_text.value = ""
    comments_holder[0].replaceChildren()
    loadComments()
})

my_comment_text.addEventListener('keydown', async(x) => {
    if (x.key === "Enter"){
        x.preventDefault()
        createcomment(my_comment_text.value)
        my_comment_text.value = ""
        comments_holder[0].replaceChildren()
        loadComments()
    }
})

var edit_mode = false
var comment_beforeedit = null
var comment_edittext = null
var comment_tonew = null

function edit_comment(id){
    let array = Array.from(comments_holder[0].children)   
    let root = array.find( j => j.id == id)
    let input = root.querySelector('.comment-inner p')
    let input_tochange = document.createElement('textarea')
    let the_button = root.querySelector('.edit-comment')

    comment_beforeedit = input.textContent
    comment_edittext = input.textContent
    input.replaceWith(input_tochange)
    input_tochange.value = comment_edittext
    the_button.textContent = "✅"
}

function clear_edit(){
    let target = comments_holder[0].querySelector('textarea')
    let root = target.closest('.the_comment')

    let input = root.querySelector('.comment-inner textarea')
    let input_tochange = document.createElement('p')
    let the_button = root.querySelector('.edit-comment')

    comment_edittext = ''
    input.replaceWith(input_tochange)
    input_tochange.textContent = comment_beforeedit
    comment_beforeedit = ''
    the_button.textContent = "✍️"
    edit_mode = false
}

comments_holder[0].addEventListener('click', async (x) => {
    if (x.target.classList.contains('delete-comment')){
        let c = x.target.closest('.the_comment')
        if(confirm("Удалить коментарий?")){
            if(edit_mode){
                clear_edit()
                edit_mode = false
            }
            console.log(c.id)
            await deletecomment(c.id)
            let del = document.getElementById(c.id)
            del.remove()
        }   
    }
    if (x.target.classList.contains('edit-comment')){
        if (!edit_mode){
        edit_comment(x.target.closest('.the_comment').id)
        edit_mode = true
        } else {
            let check = x.target.closest('.the_comment')
            let button_context = check.querySelector('.edit-comment').textContent
            if ( button_context == "✅"){
                let text_tosend = check.querySelector('textarea').value
                await server_redact_comment(check.id, text_tosend)
                clear_edit()
                check.querySelector('.comment-inner p').textContent = comment_tonew
            } else if (button_context != "✅") {
                clear_edit()
                edit_comment(x.target.closest('.the_comment').id)
                edit_mode = true
            } else {
                clear_edit()
            }
        }
    }
})

async function server_redact_comment(id, text){
    console.log(text)
    let x = await fetch('/posts_user/comment_edit', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
            comment_id: id,
            post_id: window.location.pathname.split('/')[2],
            text: text
        })
    })
    let res = await x.json()
    comment_tonew = text
    
}

async function deletecomment(id) {
    let x = await fetch('/posts_user/delete_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id: window.location.pathname.split('/')[2],
            token: document.cookie,
            comment_id: id
        })
    })
    let res = await x.json()
}


the_post[0].addEventListener('click', async (e) => {
    if (e.target.id == "like_post"){
        reactpost(window.location.pathname.split('/')[2], "liked")
    }
    if (e.target.id == "dislike_post"){
        reactpost(window.location.pathname.split('/')[2], "disliked")
    }
})


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

    changereactcolor(res.type)
    getUpdatedpost(window.location.pathname.split('/')[2])

    } catch(error) {
        console.log(error)
        console.log("Нет аккаунта. Невозможно поставить лайк.")
    }
}

async function getUpdatedpost(id) {
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
    let responce = await x.json()
    post_like.textContent = "❤️ " + responce.post.liked.length
    post_dislike.textContent = "👎 " + responce.post.dislikes.length
}

function changereactcolor(type){
    if (type == "liked"){
        post_like.classList.add('liked')
        post_dislike.classList.remove('disliked')
    } else if (type == "disliked"){
        post_dislike.classList.add('disliked')
        post_like.classList.remove('liked')
    } else if (type == "unliked"){
        post_like.classList.remove('liked')
        post_dislike.classList.remove('disliked')
    } else if (type == "undisliked"){
        post_dislike.classList.remove('disliked')
        post_like.classList.remove('liked')
    }
}

async function deletecomment(id) {
    let x = await fetch('/posts_user/delete_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id: window.location.pathname.split('/')[2],
            token: document.cookie,
            comment_id: id
        })
    })
    let res = await x.json()
    let j = the_post[0].querySelector('.reacts h3')
    j.textContent = `Total comments: ${res.long}`
}

async function createcomment(text){
    error[0].textContent = ""
    let x = await fetch('/posts_user/create_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id: window.location.pathname.split('/')[2],
            token: document.cookie,
            text: text
        })
    })
    let res = await x.json()
    if (res.error){
        error[0].textContent = res.error
    }
}

async function colored_comments(id, type){
    let x = await fetch('/posts_user/comment_info', {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        token: document.cookie,
        post_id: window.location.pathname.split('/')[2], 
        comment_id: id
    })})

    let res = await x.json()

    let thecomm = Array.from(comments_holder[0].children).find(x => x.id == id)
    let like_but = thecomm.querySelector('.like')
    let dislike_but = thecomm.querySelector('.dislike')

    like_but.textContent = `👍 ${res.c.likes.length}`
    dislike_but.textContent = `👎 ${res.c.dislikes.length}`

    if (type == 'unlike' || type == 'undislike'){
        like_but.classList.remove('liked')
        dislike_but.classList.remove('disliked')
    } else if (type == "like"){
        dislike_but.classList.remove('disliked')
        like_but.classList.add('liked')
    } else if (type == "dislike"){
        dislike_but.classList.add('disliked')
        like_but.classList.remove('liked')
    }

}

async function loadComments(){
    let iam = null
    try {
    if(document.cookie != ''){
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

    try{
    let x = await fetch('/posts_user/load_the_post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id: window.location.pathname.split('/')[2],
        })
    })
    let response = await x.json()

    the_post[0].querySelector('.reacts h3').textContent = "Total comments: " + response.x.comments.length

    let y = response.x.comments.reverse()
    for (let x of y){

        let box = document.createElement('div')
        let body = document.createElement('div')
        let img = document.createElement('img')
        let cominner = document.createElement('div')
        let name = document.createElement('h3')
        let text = document.createElement('p')

        let buttonholder = document.createElement('div')
        let like = document.createElement('button')
        let dislike = document.createElement('button')

        let delete_comment = document.createElement('button')
        let edit_comment = document.createElement('button')

        box.append(body)
        box.append(buttonholder)
        body.append(img)
        body.append(cominner)
        cominner.append(name)
        cominner.append(text)
        buttonholder.append(delete_comment)
        buttonholder.append(edit_comment)
        buttonholder.append(like)
        buttonholder.append(dislike)


        comments_holder[0].append(box)

        name.textContent = x.authorname
        text.textContent = x.text

        box.id = x._id
        box.classList.add('the_comment')
        body.classList.add('body')
        cominner.classList.add('comment-inner')
        buttonholder.classList.add('comment-buttonholder')
        delete_comment.classList.add('delete-comment')
        edit_comment.classList.add('edit-comment')
        like.classList.add('like')
        dislike.classList.add('dislike')

        if (x.likes.find( u => u == iam)){
            like.classList.add('liked')
        } else if (x.dislikes.find( u => u == iam)){
            dislike.classList.add('disliked')
        }

        if (x.authorid == iam){
            delete_comment.textContent = "🗑️"
            edit_comment.textContent = "✍️"
        }
        like.textContent = "👍 " + x.likes.length
        dislike.textContent = "👎 " + x.dislikes.length
        }
    } catch (error) {
        console.log(error)
    }
    }

async function loadheader(){
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

    console.log(iam)
    if (iam == null){
        create_holder[0].style.display = "none"
    }

    let x = await fetch('/posts_user/load_the_post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id: window.location.pathname.split('/')[2],
            token: document.cookie
        })
    })
    let response = await x.json()

    if (response.x.liked.find( y => y == iam)){ changereactcolor("liked") }
    else if (response.x.dislikes.find( y => y == iam)){ changereactcolor("disliked") }

    post_author_holder[0].querySelector('h3').textContent = response.x.authorname
    post_author_holder[0].querySelector('p').textContent = response.x.bd
    post_author_holder[0].querySelector('.id').textContent = response.x.authorid

    the_post[0].querySelector('.post-inner h3').textContent = response.x.title
    the_post[0].querySelector('.post-text').textContent = response.x.text

    post_like.textContent = "❤️ " + response.x.liked.length
    post_dislike.textContent = "👎 " + response.x.dislikes.length
    the_post[0].querySelector('.reacts h3').textContent = "Total comments: " + response.x.comments.length
}
loadheader()
loadComments()
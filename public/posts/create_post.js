var the_title = document.getElementById('the_title')
var post_inner_text = document.getElementById('post-inner-text')
var error_list = document.getElementsByClassName('error')

var save_button = document.getElementById('save-button')
var logged = null
post_inner_text.addEventListener('input', () => {
    post_inner_text.style.height = "auto";
    post_inner_text.style.height = post_inner_text.scrollHeight + "px";
});

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
    }
} tologcheck(document.cookie)

save_button.addEventListener('click', async () => {
    error_list[0].textContent = "";
    error_list[1].textContent = "";

    try {
        let x = await fetch('/posts_user/create_post', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: document.cookie, // Пока оставляем как у тебя, чтобы увидеть ошибку
                title: the_title.value,
                text: post_inner_text.value
            })
        });

        console.log(`[ФРОНТЕНД] Получен ответ от сервера. Статус: ${x.status}`);

        const contentType = x.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("[ФРОНТЕНД] ОШИБКА: Сервер вернул не JSON. Скорее всего, 404 или падение сервера.");
            return;
        }

        let response = await x.json();
        console.log("[ФРОНТЕНД] Распакованный JSON ответа:", response);

        if (response.success === true) {
            the_title.value = "";
            post_inner_text.value = "";
            window.location.href = `/user/${logged}`;
        } else {
            if (response.title_error) error_list[0].textContent = response.title_error;
            if (response.text_error) error_list[1].textContent = response.text_error;
        }
    } catch (err) {
        console.error("[ФРОНТЕНД] Критическая ошибка сети или fetch:", err);
    }
});
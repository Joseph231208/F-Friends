
class UserProfile extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <div class="user-side">
                <ul>
                    <li id="home-link" style="cursor:pointer;">Моя Страница</li>
                    <li id="friends-link" style="cursor:pointer;">Друзья<div id="new_friends_request"></div></li>
                    <li id="message-link" style="cursor:pointer;">Сообщения<div id="new_messages"></div></li>
                    <li id="groups-link" style="cursor:pointer;">Создать пост</li>
                    <li id="settings-link" style="cursor:pointer;">Настройки аккаунта</li>
                    <li id="quit-link" style="cursor:pointer;">Выйти из аккаунта</li>
                </ul>
            </div>
        `;

        this.homelink = this.querySelector('#home-link');
        this.friendslink = this.querySelector('#friends-link');
        this.grouplink = this.querySelector('#groups-link');
        this.settinglink = this.querySelector('#settings-link');
        this.quitlink = this.querySelector('#quit-link');
        this.chatlink = this.querySelector('#message-link');
        
        this.logged = null;

        this.addEventListeners();
        this.accountCheck();
    }

    addEventListeners() {
        this.grouplink.addEventListener('click', () => {
            window.location.href = "/posts/create_post.html";
        });

        this.chatlink.addEventListener('click', () => {
            window.location.href = "/chats/chatslist.html";
        });

        this.friendslink.addEventListener('click', () => {
            window.location.href = "/friends/friends.html";
        });

        this.homelink.addEventListener('click', () => {
            if (this.logged) {
                window.location.href = `/user/${this.logged}`;
            } else {
                window.location.href = "/reg&log/login.html";
            }
        });

        this.settinglink.addEventListener('click', () => {
            window.location.href = '/settings/settings.html';
        });

        this.quitlink.addEventListener('click', () => {
            let result = confirm("Выйти из аккаунта?");
            if (result) {
                document.cookie = `${this.logged}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "other=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/reg&log/login.html";
            }
        });
    }

    clearMenu() {
        this.homelink.style.display = "none";
        this.friendslink.style.display = "none";
        this.grouplink.style.display = "none";
        this.settinglink.style.display = "none";
        this.quitlink.style.display = "none";
        this.chatlink.style.display = "none";
    }

    accountCheck() {
        this.toLogCheck(document.cookie);
    }

    async toLogCheck(token) {
        try {
            let x = await fetch('/main_info', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token: token })
            });

            if (x.ok) {
                let response = await x.json();
                this.logged = response.id;
            } else {
                this.clearMenu();
            }
        } catch (error) {
            console.error("Ошибка при проверке токена:", error);
            this.clearMenu();
        }
    }
}

async function check_new_messages() {
    let x = await fetch('/chat/any_new', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: document.cookie,
        })
    })
    let res = await x.json()
    let h = document.getElementById('new_messages')
    h.textContent = res.result
} check_new_messages()

async function FriendReqList(){
        let x = await fetch('/sendreq/readfriendreq', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token: document.cookie })
            })
        let res = await x.json()
        let allout = 0
        for (x of res){
            allout ++
        }
        if (allout == 0){ allout = ""}
        let h = document.getElementById('new_friends_request')
        h.textContent = allout
    } FriendReqList()

customElements.define('user-profile', UserProfile);
class TopHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                <div class="container">
                    <h1 id="logo">F&Friends</h1>
                    <nav>
                        <ul>
                            <li id="ToMain-href" style="cursor:pointer;"></li>
                            <li id="ToRules-href" style="cursor:pointer;"></li>
                            <li id="ToGroups-href" style="cursor:pointer;"></li>
                            <li id="Login-href" style="cursor:pointer;"></li>
                        </ul>
                    </nav>
                </div>
            </header>
        `;

        this.logo = this.querySelector('#logo');
        this.tomain = this.querySelector('#ToMain-href');
        this.tolog = this.querySelector('#Login-href');
        this.torules = this.querySelector('#ToRules-href');
        this.togropes = this.querySelector('#ToGroups-href');
        
        this.logged = null;

        this.addEventListeners();
        this.accountCheck();
    }

    addEventListeners() {
        this.logo.addEventListener('click', () => {
            window.location.href = "/";
        });

        this.torules.addEventListener('click', () => {
            window.location.href = "/posts/create_post.html";
        });

        this.togropes.addEventListener('click', () => {
            window.location.href = "/chats/chatslist.html";
        });

        this.tomain.addEventListener('click', () => {
            window.location.href = "/";
        });

        this.tolog.addEventListener('click', () => {
            if (this.logged) {
                window.location.href = `/user/${this.logged}`;
            } else {
                window.location.href = "/reg&log/login.html";
            }
        });
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
                
                this.tolog.innerHTML = response.name;
                this.tomain.innerHTML = "Главная страница";
                this.togropes.innerHTML = "Мои чаты";
                this.torules.innerHTML = "Создать пост";
            } else {
                this.logged = null;
                this.tolog.innerHTML = "Войти в аккаунт";
                this.tomain.innerHTML = "";
                this.togropes.innerHTML = "";
                this.torules.innerHTML = "";
            }
        } catch (error) {
            console.error("Ошибка проверки токена в хедере:", error);
            this.logged = null;
            this.tolog.innerHTML = "Войти в аккаунт";
        }
    }

    accountCheck() {
        this.toLogCheck(document.cookie);
    }
}

customElements.define('top-header', TopHeader);
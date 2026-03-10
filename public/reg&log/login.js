var ToRegButton = document.getElementById('send-to-regpage')

ToRegButton.addEventListener('click', () => {
    window.location.href = '/reg&log/reg.html'
})

var Email = document.getElementById('email')
var Password = document.getElementById('password')
var login_try = document.getElementById('login-try')
var error_place = document.getElementsByClassName('error')

async function senddata(email, password) {
    const res = await fetch('/enterapi/log', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })

    const data = await res.json()
    if (data.error) {
        console.log( data.error )
        return false
    }
    if (data.valid){
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "other=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `${data.token}; path=/; max-age=3600`
        console.log(document.cookie)
        window.location.href = `/user/${data.id}`
    } 
    return data.table
}

login_try.addEventListener('click', async () => {
    let error = await senddata(Email.value, Password.value)
    if (data.table){
    error_place[0].innerHTML = error.error1
    error_place[1].innerHTML = error.error2
    }
})
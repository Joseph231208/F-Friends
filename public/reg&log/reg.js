var ToLogPage = document.getElementById("send-to-logpage")
var errorplace = document.getElementsByClassName('error')
var Name = document.getElementById('first-name')
var Email = document.getElementById('email')
var birthdate = document.getElementById('birth-date')
const today = new Date().toISOString().split("T")[0];
birthdate.max = today;
var password_one = document.getElementById('password-one')
var password_two = document.getElementById('password-two')
var license = document.getElementById('checkbox')
var create_button = document.getElementById('try-to-create')
var eye = document.getElementById('eye')

eye.addEventListener('click', () => {
    if (password_one.type == 'password'){
    password_one.type = 'text'
    password_two.type = 'text'
    } else {
        password_one.type = 'password'
        password_two.type = 'password'
    }
})

ToLogPage.addEventListener('click', () => {
    window.location.href = '/reg&log/login.html'
})

async function senddata(name, email, bd, p1, p2, l){
    const res = await fetch('/enterapi/reg', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            bd: bd,
            p1: p1,
            p2: p2,
            l: l
        })
        
    })

    const data = await res.json()
    if (data.message){
        console.log('не в этот раз.')
        return false
    }
    if (data.valid){
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "other=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `${data.token}; path=/; max-age=10800`

        window.location.href = `/user/${data.id}`
    } 
    return data.table

}

create_button.addEventListener('click', async () => {
    let error = await senddata(Name.value, Email.value, birthdate.value, password_one.value, password_two.value, license.checked)
    if (error){
    errorplace[0].innerHTML = error.error1
    errorplace[1].innerHTML = error.error2
    errorplace[2].innerHTML = error.error3
    errorplace[3].innerHTML = error.error4
    errorplace[4].innerHTML = error.error5
    errorplace[5].innerHTML = error.error6
    }
})
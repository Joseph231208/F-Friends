

var Name = document.getElementById('name')
var NameTr = document.getElementById('name-trigger')
var uDate = document.getElementById('date')
var uDateTr = document.getElementById('date-trigger')

var RealName = document.getElementById('Login-href')
var nerror = document.getElementById('nameerror')
var nsuccess = document.getElementById('namesuccess')

var derror = document.getElementById('dataerror')
var dsuccess = document.getElementById('datasuccess')

const today = new Date().toISOString().split("T")[0];
uDate.max = today;


NameTr.addEventListener('click', async () => {
    await changeName(document.cookie, Name.value)
})

uDateTr.addEventListener('click', async () => {
    await changeData(document.cookie, uDate.value)
})

async function changeName(cookie, Uname) {
    nsuccess.innerHTML = ""
    nerror.innerHTML = ""

    let x = await fetch('/changeapi/name', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: cookie,
            name: Uname
        })
    })
    let response = await x.json()
    if (x.ok){
        RealName.innerHTML = Uname
        nsuccess.innerHTML = "Success"
    } else {
        nerror.innerHTML = response.error
        console.log(response.error)
    }
}

async function changeData(cookie, data) {
    derror.innerHTML = ""
    dsuccess.innerHTML = ""

    let x = await fetch('/changeapi/data', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: cookie,
            data: data
        })
    })
    let response = await x.json()
    if (x.ok){
        dsuccess.innerHTML = "Success"
    } else {
        derror.innerHTML = response.error
        console.log(response.error)
    }
}
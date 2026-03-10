
var Name = document.getElementById('name')
var Bdate = document.getElementById('Bdate')
var Yo = document.getElementById('Yo')

month_list = ["January", "February", "March" , "April" ,"May", "June", "July", "August", "September", "October", "November", "December"]

function findBirthDay(data){
    let arr = data.split('-')
    let month = (month_list[Number(arr[1])-1])
    let result = `Birth Day: ${arr[2]} ${month}`
    return result
}

function findYO(data){
    let today = new Date().toISOString().split('T')[0];
    today = today.split('-')
    let arr = data.split('-')
    let age = today[0] - arr[0]
    if (today[1] < arr[1]){
        age = age + 1
    }
    if (today[1] == arr[1]){
        if(today[2] < arr[2]){
            age = age + 1
        }
    }
    return `${age} Years old`
}

const userid = window.location.pathname.split('/')[2]

async function loadProfile() {
    const response = await fetch(`/profileapi/${userid}`)
    const data = await response.json()

    let UserName = data.name
    let UserYo = findYO(data.bd)
    let Userbd = findBirthDay(data.bd)

    Name.innerHTML = UserName
    Bdate.innerHTML = Userbd
    Yo.innerHTML = UserYo
}

console.log(userid)
loadProfile()

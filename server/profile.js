function updateProfile() {
    const username = document.getElementById('updateUser').value
    const password = document.getElementById('updatePass').value
    const email = document.getElementById('updateEmail').value
    let data = {}
    if (username.length > 0) {
        data.username = username
    }
    if (password.length > 0) {
        data.password = password
    }
    if (email.length > 0) {
        data.email = email
    }

    fetch('/api/change-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => {

    })
}

document.getElementById('img').addEventListener("change", function() {
    const img = URL.createObjectURL(document.getElementById('img').files[0])
    document.getElementById('profilePic').src = img
    fetch('/api/change-profile-picture', {
        method: 'POST',
        body: document.getElementById('img').files[0]
    })
})

window.onload = function() {
    fetch('/user', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.profilepicture) {
            console.log('a')
            document.getElementById('profilePic').src = URL.createObjectURL(data.profilepicture.ProfilePicture)
        }
        console.log(typeof(data.profilepicture.ProfilePicture))
    })
}
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
        body: JSON.stringify(data)
    }).then(response => {
        if (response.status(200)) {
            // TODO: do stuff on screen to indicate success
        }
    })
}
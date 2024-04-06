// LOGIN //
const passwordField = document.getElementById('passwordInput');
function submitUserLogin() {
    const username = document.getElementById('usernameInput').value;
    const password = passwordField.value;
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
    })
    .then(response => {
        if (response.redirected) {
            // TODO: Fix this redirect on server side
            window.location.href = '/';
        } else {
            response.json()
        }
    })
    .then (data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error: ', error);
    })
}
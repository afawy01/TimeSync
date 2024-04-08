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
    .then(response => response.json())
    .then(data => {
        if (data['redirect']) {
            // TODO: Fix this redirect on server side
            window.location.href = data['redirect'];
        } else if (data['error']) {
            alert('Login Incorrect');
        }
    })
    .catch(error => {
        console.error('Error: ', error);
    })
}
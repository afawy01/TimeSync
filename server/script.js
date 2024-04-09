/*document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;

    fetch('/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('User added:', data);
        alert('User added successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});*/

//const { log } = require("npmlog");

document.getElementById('meetingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const user_id = document.getElementById('user_id').value;

    fetch('/meeting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, user_id }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Meeting added:', data);
        alert('Meeting added successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

function openGroupJoinForm() {
    document.getElementById("groupJoinForm").style.display = "block";
}

function closeGroupJoinForm() {
    document.getElementById("groupJoinForm").style.display = "none";
}

function openGroupForm() {
    document.getElementById('groupSubmitButton').style.display = 'block'
    document.getElementById("groupForm").style.display = "block";
}

function closeGroupForm() {
    document.getElementById("groupForm").style.display = "none";
}

function submitGroupForm() {
    const groupName = document.getElementById('groupNameInput').value;
    const groupDescription = document.getElementById('groupDescriptionInput').value;
    //const groupIcon = document.getElementById('teamIconInput').value;
    fetch('/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: groupName, description: groupDescription }),
    })
    .then(response => response.json())
    .then (data => {
        console.log(data)
        const successText = document.createElement('p')
        successText.textContent = "Successfully created team!"
        const teamCodeText = document.createElement('p')
        teamCodeText.textContent = `Team Join Code: ${data.joincode}`
        const popup = document.getElementById('teamCreationPopup')
        popup.appendChild(successText)
        popup.appendChild(teamCodeText)
        document.getElementById('groupSubmitButton').style.display = 'none'
        //closeGroupForm()
    })
    .catch(error => {
        console.error('Error: ', error);
    })
}

function joinGroup() {
    const groupCode = document.getElementById('groupCodeInput').value;
    console.log('ok')
    fetch('/joingroup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joincode: groupCode })
    }).then(response => {

    }).catch(error => {
        console.error('Error: ', error);
    })
}

function logout() {
    fetch('/logout', {
        method: 'POST',
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = '/';
        }
    })
    .then(data => {
        closeGroupJoinForm()
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

window.onload = function() {
    const userData = fetch('/user', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        const teamListButton = document.getElementById("teamListButton");
        const loginButton = document.getElementById("loginButton");
        const logoutButton = document.getElementById("logoutButton");
        const groupButton = document.getElementById("groupButton");
        const joinGroupButton = document.getElementById("joinGroupButton");
        const calendarButton = document.getElementById("calendarButton");
        const profileButton = document.getElementById("profileButton");
        if (data["username"]) {
            loginButton.style.display = "none";
            teamListButton.style.display = "block";
            logoutButton.style.display = "block";
            groupButton.style.display = "block";
            joinGroupButton.style.display = "block";
            calendarButton.style.display = "block";
            profileButton.style.display = "block";
        } else {
            loginButton.style.display = "block";
            teamListButton.style.display = "none";
            logoutButton.style.display = "none";
            groupButton.style.display = "none";
            joinGroupButton.style.display = "none";
            calendarButton.style.display = "none";
            profileButton.style.display = "none";
        }
    })
}
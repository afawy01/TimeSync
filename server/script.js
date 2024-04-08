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
    document.getElementById("groupForm").style.display = "block";
}

function closeGroupForm() {
    document.getElementById("groupForm").style.display = "none";
}

function openMeetingForm() {
    document.getElementById("meetingForm").style.display = "block";
}

function closeMeetingForm() {
    document.getElementById("meetingForm").style.display = "none";
}

function submitGroupForm() {
    const groupName = document.getElementById('groupNameInput').value;
    const groupDescription = document.getElementById('groupDescriptionInput').value;
    fetch('/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: groupName, description: groupDescription }),
    })
    .then(response => response.json())
    .then (data => {
        console.log(data);
        //alert('Created group "' + groupName + '"')
        closeGroupForm()
    })
    .catch(error => {
        console.error('Error: ', error);
    })
}

function submitMeetingForm() {
    const meetingName = document.getElementById('meetingTimeInput').value;
    const meetingDescription = document.getElementById('meetingDescriptionInput').value;
    const meetingDate = document.getElementById('meetingDateInput').value;
    const meetingTime = document.getElementById('meetingTimeInput').value;
    /*fetch('/meeting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: meetingName, description: meetingDescription }),
    })
    .then(response => response.json())
    .then (data => {
        console.log(data);
        alert('Created group "' + groupName + '"')
        closeGroupCreationForm()
    })
    .catch(error => {
        console.error('Error: ', error);
    })*/
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
        const meetingButton = document.getElementById("meetingButton");
        const groupButton = document.getElementById("groupButton");
        const joinGroupButton = document.getElementById("joinGroupButton");
        const calendarButton = document.getElementById("calendarButton");
        if (data["username"]) {
            loginButton.style.display = "none";
            teamListButton.style.display = "block";
            logoutButton.style.display = "block";
            meetingButton.style.display = "block";
            groupButton.style.display = "block";
            joinGroupButton.style.display = "block";
            calendarButton.style.display = "block";
        } else {
            loginButton.style.display = "block";
            teamListButton.style.display = "none";
            logoutButton.style.display = "none";
            meetingButton.style.display = "none";
            groupButton.style.display = "none";
            joinGroupButton.style.display = "none";
            calendarButton.style.display = "none";
        }
    })
}
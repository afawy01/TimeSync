document.getElementById('userForm').addEventListener('submit', function(e) {
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
});

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

function openGroupCreationForm() {
    document.getElementById("groupForm").style.display = "block";
}

function submitForm() {
    const groupName = document.getElementById('groupNameInput').value;
    fetch('/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: groupName, user_id: 1 }),
    })
    .then(response => response.json())
    .then (data => {
        console.log(data);
        alert('Created group "' + groupName + '"')
        closeGroupCreationForm()
    })
    .catch(error => {
        console.error('Error: ', error);
    })
}

function closeGroupCreationForm() {
    document.getElementById("groupForm").style.display = "none";
}
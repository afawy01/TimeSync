window.onload = async function() {
    const teamID = new URLSearchParams(window.location.search).get('id');
    let userData;
    await fetch(`/user`, {
        method: 'GET'
    }).then(response => response.json())
    .then(data => {
        userData = data;
    })
    fetch(`/getteam?id=${teamID}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (data["error"]) {
            return
        }

        // Get teamcode for teamcode display button
        document.getElementById("teamCode").textContent = data["teaminfo"][0]["JoinCode"]

        // TODO: This is probably not safe security wise but oh well
        // Check if user is team owner
        // User data for this specific team
        const team = userData["teamlist"].find((team) => team["ChannelID"] == teamID)
        console.log(team)
        if (team["Role"] == "Owner") {

        } else {
            document.getElementById('disbandTeam').style.display = 'none'
        }

        // List team members on page
        let memberList = document.querySelector('.members-table')
        for (let i = 0; i < data["teammembers"].length; i++) {
            let member = data["memberinfo"].find((member) => member["UserID"] == data["teammembers"][i]["UserID"])
            // Construct member table
            let row = document.createElement("tr");
            let username = document.createElement("td");
            let role = document.createElement("td");
            let actions = document.createElement("td");

            row.classList.add('row-item')

            username.textContent = member["Username"]
            // Check if referring to current user
            if (member["Username"] == userData["username"]) {
                username.textContent = username.textContent + " (You)"
                let leaveButton = document.createElement("button")
                leaveButton.textContent = "Leave"
                leaveButton.value = data["teammembers"][i]["UserID"]
                leaveButton.onclick = function() {
                    fetch(`/api/remove-member`), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ channelID: teamID, userID: leaveButton.value})
                    }
                    .then(response => {
                        if (response.status == 200) {
                            window.location.href = '/'
                        }
                    })
                }
                actions.appendChild(leaveButton);
            } else {
                // If not referring to current user, add role buttons
                if (team["Role"] == "Owner") {
                    // Admin exclusive actions
                    let changeRoleButton = document.createElement("button")
                    if (data["teammembers"][i]["Role"] == "Member") {
                        changeRoleButton.textContent = "Promote to Admin"
                        changeRoleButton.value = `${data["teammembers"][i]["UserID"]},Admin`
                    } else {
                        changeRoleButton.textContent = "Demote to Member"
                        changeRoleButton.value = `${data["teammembers"][i]["UserID"]},Member`
                    }
                    changeRoleButton.onclick = function() {
                        document.getElementById('roleConfirmation').style.display = 'block';
                        document.getElementById('roleConfirmation').value = changeRoleButton.value;
                    }
                    actions.appendChild(changeRoleButton);
                }
                if (team["Role"] == "Owner" || team["Role"] == "Admin") {
                    // If user is owner, can't kick
                    if (data["teammembers"][i]["Role"] != "Owner") {
                        let kickButton = document.createElement("button")
                        kickButton.textContent = "Kick"
                        kickButton.value = data["teammembers"][i]["UserID"]
                        kickButton.onclick = function() {
                            document.getElementById('kickConfirmation').style.display = 'block';
                            document.getElementById('kickConfirmation').value = kickButton.value;
                        }
                        actions.appendChild(kickButton);
                    }
                }
            }
            role.textContent = data["teammembers"][i]["Role"]
            memberList.appendChild(row);
            row.appendChild(username);
            row.appendChild(role);
            row.appendChild(actions);
        }

        console.log(data)
    })
}

function confirmKick() {
    const teamID = new URLSearchParams(window.location.search).get('id');
    fetch(`/api/remove-member`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelID: teamID, userID: document.getElementById('kickConfirmation').value})
    })
    .then(response => {
        if (response.status == 200) {
            window.location.reload()
        }
    })
}

function confirmTeamDelete() {
    const teamID = new URLSearchParams(window.location.search).get('id');

    fetch('/api/delete-team', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelID: teamID })
    })
    .then(response => {
        if (response.status == 200) {
            window.location.href = '/teamlist'
        }
    })
}

function closeKickConfirmation() {
    document.getElementById('kickConfirmation').style.display = 'none';
    document.getElementById('kickConfirmation').value = null;
}

function confirmRoleChange() {
    const teamID = new URLSearchParams(window.location.search).get('id');
    const valueSplit = document.getElementById('roleConfirmation').value.split(',')
    fetch(`/api/change-member-role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelID: teamID, userID: valueSplit[0], role: valueSplit[1] })
    })
    .then(response => {
        if (response.status == 200) {
            window.location.reload()
        }
    })
}

function closeRoleConfirmation() {
    document.getElementById('roleConfirmation').style.display = 'none';
    document.getElementById('roleConfirmation').value = null;
}

// Show/hide team code
$ = function(id) {
    return document.getElementById(id);
}
  
var show = function(id) {
    $(id).style.display ='block';
}
var hide = function(id) {
    $(id).style.display ='none';
}

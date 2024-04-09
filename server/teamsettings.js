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

        // TODO: This is probably not safe security wise but oh well
        // Check if user is team owner
        // User data for this specific team
        const team = userData["teamlist"].find((team) => team["ChannelID"] == teamID)
        console.log(team)
        if (team["Role"] == "Owner") {
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
                    let kickButton = document.createElement("button")
                    kickButton.textContent = "Kick"
                    kickButton.value = data["teammembers"][i]["UserID"]
                    kickButton.onclick = function() {
                        fetch(`/api/remove-member`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ channelID: teamID, userID: kickButton.value})
                        })
                        .then(response => {
                            if (response.status == 200) {
                                window.location.reload()
                            }
                        })
                    }
                    actions.appendChild(kickButton);
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
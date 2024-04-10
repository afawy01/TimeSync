$ = function(id) {
  return document.getElementById(id);
}

var show = function(id) {
	$(id).style.display ='block';
}
var hide = function(id) {
	$(id).style.display ='none';
}

window.onload = function() {
    fetch(`/api/get-polls?id=${new URLSearchParams(window.location.search).get('id')}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        displayPolls(data)
    })
    document.getElementById('availabilityPoll').style.display = 'none'
}

let dates = [];

function addDate() {
	let date = document.getElementById('addDate').value;
	if (date){
		dates.push(date);
	}
	document.getElementById('addDate').value = "";
    displayDates();
}

function displayDates() {
    let list = document.querySelector('.showDates');
    list.innerHTML="";
    for (i=0; i<dates.length; i++){
        let li = document.createElement('li');
        li.innerText = new Date(dates[i]).toLocaleString();
        list.appendChild(li);
    }
}

function createPoll() {
    let type = document.querySelector('input[name="poll-type"]:checked').value
    fetch('/api/create-poll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: document.getElementById('pollTitle').value, description: document.getElementById('pollDescription').value, dates: dates, channelID: new URLSearchParams(window.location.search).get('id'), type: type })
    })
}

async function displayPolls(data) {
    // Fetch userid to check if voted already
    let userID;
    await fetch(`/user`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        userID = data.userid
    })

    for (let i = 0; i < data.polls.length; i++) {
        let poll = document.createElement('div')
        let dateTable = document.getElementById('dateTable')

        let titleRow = document.createElement('tr')
        dateTable.appendChild(titleRow)
        // Title of availability poll
        let titleText = document.createElement('td')
        titleText.colSpan = 2
        titleText.style.fontSize = "35px"
        titleText.textContent = data.polls[i].Title
        titleRow.appendChild(titleText)

        let descriptionRow = document.createElement('tr')
        dateTable.append(descriptionRow)
        let descriptionText = document.createElement('td')
        descriptionText.colSpan = 2
        descriptionText.textContent = data.polls[i].Description
        descriptionRow.appendChild(descriptionText)

        if (data.polls[i].PollType == "yesNo") {
            let hasVoted = data.yesnovotes.find((vote) => data.polls[i].PollID == vote.PollID && userID == vote.UserID)
            let yesnoRow = document.createElement('tr')

            if (!hasVoted) {
                let yesButton = document.createElement('button')
                yesButton.value = data.polls[i].PollID
                yesButton.textContent = "Yes"
                yesButton.onclick = function() {
                    fetch('/api/vote-poll', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ channelID: new URLSearchParams(window.location.search).get('id'), pollID: yesButton.value, vote: "Yes", type: "yesno" })
                    })
                    location.reload()
                }
                yesnoRow.appendChild(document.createElement('td').appendChild(yesButton))
    
                let noButton = document.createElement('button')
                noButton.value = data.polls[i].PollID
                noButton.textContent = "No"
                noButton.onclick = function() {
                    fetch('/api/vote-poll', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ channelID: new URLSearchParams(window.location.search).get('id'), pollID: noButton.value, vote: "No", type: "yesno" })
                    })
                    location.reload()
                }
                yesnoRow.appendChild(document.createElement('td').appendChild(noButton))
            } else {
                let voteButton = document.createElement('button')
                voteButton.value = data.polls[i].PollID

                voteButton.onclick = function() {
                    fetch('/api/remove-vote', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ channelID: new URLSearchParams(window.location.search).get('id'), pollID: voteButton.value, type: "yesno" })
                    })
                    location.reload()
                }
                voteButton.textContent = "Remove Vote"
                yesnoRow.appendChild(document.createElement('td').appendChild(voteButton))
            }

            dateTable.appendChild(yesnoRow)
        }


        let dateItems = data.dates.filter((date) => data.polls[i].PollID == date.PollID)
        for (let j = 0; j < dateItems.length; j++) {
            // Create row for listing date and button for voting on date
            let dateTableRow = document.createElement('tr')
            let dateItem = document.createElement('td')
            dateItem.textContent = new Date(dateItems[j].Date).toLocaleString()
            dateTableRow.appendChild(dateItem)
            dateTable.appendChild(dateTableRow)

            // Check if current date has already been voted on by user
            let hasVoted = data.availabilityvotes.find((vote) => dateItems[j].PollID == vote.PollID && dateItems[j].Date == vote.Date && userID == vote.UserID)

            let voteButton = document.createElement('button')
            voteButton.value = data.polls[i].PollID
            // If not voted, display vote button
            if (!hasVoted) {
                voteButton.onclick = function() {
                    fetch('/api/vote-poll', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ channelID: new URLSearchParams(window.location.search).get('id'), pollID: voteButton.value, date: dateItems[j].Date, type: "availability" })
                    })
                    location.reload()
                }
                voteButton.textContent = "Vote"
            } else {
                voteButton.onclick = function() {
                    fetch('/api/remove-vote', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ channelID: new URLSearchParams(window.location.search).get('id'), pollID: voteButton.value, date: dateItems[j].Date, type: "availability" })
                    })
                    location.reload()
                }
                voteButton.textContent = "Remove Vote"
            }
            
            dateTableRow.appendChild(voteButton)
        }

        document.getElementById("polls").appendChild(poll)
    }


}

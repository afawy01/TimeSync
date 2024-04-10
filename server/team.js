window.onload = function() {
    const teamID = new URLSearchParams(window.location.search).get('id');
    console.log(teamID)
    const teamData = fetch(`/getteam?id=${teamID}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (data["error"]) {
            return
        }

        loadChatroom(data)
    })
}

function loadChatroom(data) {
    const teamID = new URLSearchParams(window.location.search).get('id');
    fetch(`/api/chat-logs?id=${teamID}`)
    .then(response => response.json())
    .then(chatLogs => {
        if(chatLogs["error"]) {return}
        const chatMessages = document.getElementById("chat-messages")

        for (let i = 0; i < chatLogs.length; i++) {
            const messageElement = document.createElement('div');
            if (i%2 == 0) {
                messageElement.className = "container"
            } else {
                messageElement.className = "container darker"
            }
            const messageText = document.createElement('p')
            messageText.textContent = chatLogs[i].MessageText;
            messageElement.appendChild(messageText)

            const usernameText = document.createElement('span')
            usernameText.className = "time-left"
            // Find user who sent message
            usernameText.textContent = data.memberinfo.find((member) => member.UserID == chatLogs[i].UserID).Username
            messageElement.appendChild(usernameText)
            // TODO: Check if user is the one who sent message
            if (chatLogs[i].UserID)
            chatMessages.appendChild(messageElement);
        }
    })
    .catch(error => console.error('Error loading chat logs:', error));
}

// Update chatroom view with fetched logs
function updateChatroomLogs(chatLogs) {
    const chatroom = document.querySelector('.chat-messages');
    chatroom.innerHTML = '';

    chatLogs.forEach(log => {
        const messageElement = document.createElement('li');
        messageElement.textContent = log.message;
        chatroom.appendChild(messageElement);
    });
}

document.getElementById('send-message').addEventListener('click', () => {
    const messageContent = document.getElementById('message-content').value;
    const teamID = new URLSearchParams(window.location.search).get('id');

    if (messageContent.trim() && teamID) {
        fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId: teamID, message: messageContent.trim() }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to send message');
            return response.json();
        })
        .then(data => {
            console.log(data.success);
            document.getElementById('message-content').value = '';
            location.reload()
        })
        .catch(error => console.error('Error sending message:', error));
    }
});
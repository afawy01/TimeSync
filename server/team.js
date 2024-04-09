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

        console.log(data)

        loadChatroom()
    })
}

function loadChatroom() {
    const teamID = new URLSearchParams(window.location.search).get('id');
    fetch(`/api/chat-logs?id=${teamID}`)
    .then(response => response.json())
    .then(chatLogs => {
        if(chatLogs["error"]) {return}
        const chatroom = document.querySelector('.chat-messages');
        chatroom.innerHTML = '';
        chatLogs.forEach(log => {
            const messageElement = document.createElement('li');
            messageElement.textContent = log.MessageText;
            // TODO: Check if user is the one who sent message
            if (log.UserID)
            chatroom.appendChild(messageElement);
        });
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
        })
        .catch(error => console.error('Error sending message:', error));
    }
});
let selectedChannelID = null

window.onload = function() {
    fetch('/user', { method: 'GET' })
    .then(response => response.json())
    .then(data => {
        let list = document.querySelector('.teams-list');
        data.teamlist.forEach(team => {
            let item = document.createElement("li");
            item.classList.add('list-item');

            let teamInfo = data.teaminfo.find(info => info.ChannelID === team.ChannelID);
            let teamName = teamInfo ? teamInfo.ChannelName : 'Unknown Team';

            item.textContent = teamName;

            let itemButton = document.createElement("button");
            itemButton.textContent = '>';
            console.log(teamInfo)
            itemButton.onclick = () => loadChatroomForTeam(teamInfo["ChannelID"]); // WIP Load chatroom for team
            item.appendChild(itemButton);

            list.appendChild(item);
        });
    })
    .catch(error => console.error('Error loading teams:', error));
};

function loadChatroomForTeam(channelId) {
    selectedChannelID = channelId
    fetch(`/api/chat-logs?id=${channelId}`)
    .then(response => response.json())
    .then(chatLogs => {
        if(chatLogs["error"]) {return}
        const chatroom = document.querySelector('.chat-messages');
        chatroom.innerHTML = '';
        chatLogs.forEach(log => {
            const messageElement = document.createElement('li');
            messageElement.textContent = log.message;
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
    console.log(selectedChannelID)

    if (messageContent.trim() && selectedChannelID) {
        fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId: selectedChannelID, message: messageContent.trim() }),
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
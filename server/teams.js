window.onload = function() {
    const userData = fetch('/user', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        let list = document.querySelector('.teams-list');
        for (let i = 0; i < data["teamlist"].length; i++) {
            let item = document.createElement("li");
            item.classList.add('list-item')
            let itemButton = document.createElement("button");
            itemButton.onclick = function() {
                hello()
            }
            let teamName = null
            // TODO: Clean up nested for loop
            for (let j = 0; j < data["teaminfo"].length; j++) {
                if (data["teaminfo"][j]["ChannelID"] == data["teamlist"][i]["ChannelID"]) {
                    teamName = data["teaminfo"][j]["ChannelName"];
                }
            }
            item.textContent = teamName;
            itemButton.textContent = '>';
            list.appendChild(item);
            item.appendChild(itemButton);
        }
    })
}

function hello(){
    console.log('hello');
}
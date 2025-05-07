const sendChatButton = document.getElementById('send-chat-button');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const userList = document.getElementById('user-list');

const socket = io();

sendChatButton.onclick = () => {
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('send-chat-message', { user: currentUser, message });
        chatInput.value = '';
    }
};

socket.on('update-users', (users) => {
    console.log('Utenti online:', users);
    if (userList) {
        userList.innerHTML = users
            .map(user => {
                if (user === currentUser) {
                    return `<li>${user} (Tu)</li>`;
                } else {
                    return `
                        <li>
                            ${user} 
                            <button onclick="sendInvite('${user}')">Invita</button>
                        </li>
                    `;
                }
            })
            .join('');
    }
});

socket.on('receive-chat-message', ({ user, message }) => {
    if (chatBox) {
        chatBox.innerHTML += `<div>${user}: ${message}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

function sendInvite(to) {
    socket.emit('send-invite', { from: currentUser, to });
}

socket.on('receive-invite', ({ from }) => {
    const accept = confirm(`${from} ti ha invitato a giocare. Accetti?`);
    if (accept) {
        socket.emit('accept-invite', { from, to: currentUser });
    }
});

socket.on('invite-error', ({ message }) => {
    alert(message);
});

socket.on('start-game', ({ opponent }) => {
    alert(`La partita contro ${opponent} sta per iniziare!`);
    showSection(gameSection);
});
const socket = io();

// Gestione dell'invio del nome
document.getElementById('setName').onclick = () => {
    const name = document.getElementById('playerName').value;
    socket.emit('setName', name);
};

// Visualizzazione della lista utenti online
socket.on('list', (userList) => {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = ''; 

    userList.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.online ? 'Online' : 'Offline'})`;

        if (user.online) {
            li.onclick = () => sendInvite(user.socketId);
        }

        userListElement.innerHTML += li.outerHTML;
    });
});

// Funzione per inviare inviti
function sendInvite(invitedUserId) {
    socket.emit('sendInvite', invitedUserId);
}

// Gestione dell'invito ricevuto
socket.on('inviteReceived', (data) => {
    const inviteListElement = document.getElementById('inviteList');
    inviteListElement.innerHTML = '';

    const li = document.createElement('li');
    li.textContent = `Invito da ${data.from}`;

    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accetta';
    acceptButton.onclick = () => acceptInvite(data.from, li);

    const declineButton = document.createElement('button');
    declineButton.textContent = 'Rifiuta';
    declineButton.onclick = () => declineInvite(data.from, li);

    li.innerHTML += acceptButton.outerHTML + declineButton.outerHTML;
    inviteListElement.innerHTML += li.outerHTML;
});

// Funzione per accettare l'invito
function acceptInvite(inviterId, inviteElement) {
    const gameId = `${socket.id}-${inviterId}`;
    socket.emit('acceptInvite', { gameId, invitedUserId: inviterId });
    inviteElement.remove();
}

// Funzione per rifiutare l'invito
function declineInvite(inviterId, inviteElement) {
    socket.emit('declineInvite', inviterId);
    inviteElement.remove();
}

// Gestione dell'inizio della partita
socket.on('gameStarted', (data) => {
    alert(`La partita è iniziata! ID partita: ${data.gameId}`);
});

// Funzione per inviare messaggi in chat
document.getElementById('sendMessage').onclick = () => {
    const message = document.getElementById('message').value;
    socket.emit('message', message);
    displayMessage(message, 'Me');
};

// Visualizzazione dei messaggi in chat
socket.on('chat', (message) => {
    displayMessage(message, 'L\'altro giocatore');
});

// Funzione per aggiungere i messaggi alla chat
function displayMessage(message, sender) {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<p><strong>${sender}:</strong> ${message}</p>`;
    document.getElementById('message').value = '';
}

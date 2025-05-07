const socket = io();

socket.on('connect', () => {
    console.log(`Connesso al server con ID: ${socket.id}`);
});

socket.on('update-users', (users) => {
    console.log('Utenti online:', users);
});

socket.on('receive-chat-message', ({ user, message }) => {
    console.log(`${user}: ${message}`);
});

socket.on('receive-invite', ({ from }) => {
    const accept = confirm(`${from} ti ha invitato a giocare. Accetti?`);
    if (accept) {
        socket.emit('accept-invite', { from, to: currentUser });
        alert('Invito accettato! Inizia la partita.');
    }
});

socket.on('invite-error', ({ message }) => {
    alert(message);
});
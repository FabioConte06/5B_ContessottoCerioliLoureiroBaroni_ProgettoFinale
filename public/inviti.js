socket = io();

function sendInvite(to) {
    socket.emit('send-invite', { from: currentUser, to });
}

socket.on('receive-invite', ({ from }) => {
    const accept = confirm(`${from} ti ha invitato a giocare. Accetti?`);
    if (accept) {
        socket.emit('accept-invite', { from, to: currentUser });
        alert('Invito accettato! Inizia la partita.');
        showSection(gameSection);
    }
});

socket.on('invite-error', ({ message }) => {
    alert(message);
});
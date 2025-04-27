const socket = io();

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const gameContainer = document.getElementById("game-container");
const loginRegisterContainer = document.getElementById("login-register-container");
const userListElement = document.getElementById("userList");
const messageInput = document.getElementById("message");
const sendMessageButton = document.getElementById("sendMessage");
const inviteListElement = document.getElementById("inviteList");

const register = (username, password) => {
    fetch("https://ws.cipiaceinfo.it/credential/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", key: "3819207b-2545-44f5-9bce-560b484b2f0f" },
        body: JSON.stringify({ username, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "Ok") {
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            socket.emit('register', { username });
            alert("Registrazione completata!");
        } else alert("Registrazione fallita.");
    }).catch(() => alert("Errore di rete."));
};

const login = (email, password) => {
    fetch("https://ws.cipiaceinfo.it/credential/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", key: "3819207b-2545-44f5-9bce-560b484b2f0f" },
        body: JSON.stringify({ email, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === true) {
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            const username = email.split('@')[0];
            socket.emit('register', { username });
            alert("Login effettuato!");
        } else alert("Login fallito.");
    }).catch(() => alert("Errore di rete."));
};

loginButton.onclick = () => {
    if (loginEmail.value && loginPassword.value) login(loginEmail.value, loginPassword.value);
    else alert("Compila tutti i campi.");
};

registerButton.onclick = () => {
    if (registerUsername.value && registerPassword.value) register(registerUsername.value, registerPassword.value);
    else alert("Compila tutti i campi.");
};

sendMessageButton.onclick = () => {
    if (messageInput.value) {
        socket.emit('chatMessage', messageInput.value);
        messageInput.value = '';
    }
};

socket.on('chatMessage', (message) => {
    const chatContainer = document.getElementById("chatContainer");
    const msg = document.createElement('div');
    msg.textContent = message;
    chatContainer.appendChild(msg);
});

socket.on('userList', (users) => {
    userListElement.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        const btn = document.createElement('button');
        btn.textContent = 'Invita';
        btn.onclick = () => sendInvite(user.socketId);
        li.appendChild(btn);
        userListElement.appendChild(li);
    });
});

const sendInvite = (socketId) => {
    socket.emit('sendInvite', socketId);
};

socket.on('inviteReceived', ({ from, inviterId }) => {
    const inviteElement = document.createElement('div');
    inviteElement.textContent = `Hai ricevuto un invito da ${from}`;

    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accetta';
    acceptButton.onclick = () => {
        socket.emit('acceptInvite', { inviterId });
        inviteElement.remove();
    };

    const declineButton = document.createElement('button');
    declineButton.textContent = 'Rifiuta';
    declineButton.onclick = () => {
        socket.emit('declineInvite', inviterId);
        inviteElement.remove();
    };

    inviteElement.appendChild(acceptButton);
    inviteElement.appendChild(declineButton);
    inviteListElement.appendChild(inviteElement);
});

socket.on('inviteDeclined', ({ by }) => {
    alert(`${by} ha rifiutato il tuo invito.`);
});

socket.on('gameStarted', ({ gameId }) => {
    alert(`Partita iniziata! ID partita: ${gameId}`);
});

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

const isLogged = sessionStorage.getItem("Logged") === "true";

const register = (username, password) => {
    fetch("https://ws.cipiaceinfo.it/credential/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            key: "3819207b-2545-44f5-9bce-560b484b2f0f",
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.result === "Ok") {
            alert("Registrazione completata!");
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            socket.emit('register', { username });
        } else {
            alert("Registrazione fallita.");
        }
    })
    .catch(() => alert("Registrazione fallita."));
};

const login = (email, password) => {
    fetch("https://ws.cipiaceinfo.it/credential/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            key: "3819207b-2545-44f5-9bce-560b484b2f0f",
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.result === true) {
            alert("Login effettuato!");
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            const username = email.split('@')[0];
            socket.emit('register', { username });
        } else {
            alert("Login fallito.");
        }
    })
    .catch(() => alert("Login fallito."));
};

loginButton.onclick = () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    if (email && password) {
        login(email, password);
    } else {
        alert("Compila tutti i campi.");
    }
};

registerButton.onclick = () => {
    const username = registerUsername.value;
    const password = registerPassword.value;
    if (username && password) {
        register(username, password);
    } else {
        alert("Compila tutti i campi.");
    }
};

sendMessageButton.onclick = () => {
    const message = messageInput.value;
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
    }
};

socket.on('chatMessage', (message) => {
    const chatContainer = document.getElementById("chatContainer");
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
});

socket.on('userList', (users) => {
    userListElement.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        const inviteButton = document.createElement('button');
        inviteButton.textContent = 'Invita';
        inviteButton.onclick = () => sendInvite(user.socketId);
        li.appendChild(inviteButton);
        userListElement.appendChild(li);
    });
});

const sendInvite = (socketId) => {
    socket.emit('sendInvite', socketId);
};

socket.on('inviteReceived', (fromData) => {
    const inviteElement = document.createElement('div');
    inviteElement.textContent = `Hai ricevuto un invito da ${fromData.from}`;
    inviteListElement.appendChild(inviteElement);
});


// --- server.js (server side, fix solo chatMessage) ---

socket.on('chatMessage', (message) => {
    const userName = onlineUsers[socket.id];
    const response = `${userName}: ${message}`;
    io.emit('chatMessage', response);
});

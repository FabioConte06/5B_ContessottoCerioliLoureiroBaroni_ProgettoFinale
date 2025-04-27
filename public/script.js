const socket = io();

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const gameContainer = document.getElementById("game-container");
const loginRegisterContainer = document.getElementById("login-register-container");

const isLogged = sessionStorage.getItem("Logged") === "true";

// Funzione per gestire la registrazione
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
            alert("Registrazione completata con successo!");
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
        } else {
            alert("Registrazione fallita.");
        }
    })
    .catch(() => alert("Registrazione fallita."));
};

// Funzione per gestire il login
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
            alert("Login effettuato con successo!");
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
        } else {
            alert("Credenziali errate.");
        }
    })
    .catch(() => alert("Login fallito."));
};

// Gestione click per la registrazione
registerButton.onclick = () => {
    const username = registerUsername.value;
    const password = registerPassword.value;
    if (username && password) {
        register(username, password);
    } else {
        alert("Compila tutti i campi.");
    }
};

// Gestione click per il login
loginButton.onclick = () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    if (email && password) {
        login(email, password);
    } else {
        alert("Compila tutti i campi.");
    }
};

// Funzione per inviare invito
function sendInvite(invitedUserId) {
    socket.emit('sendInvite', invitedUserId);
}

// Gestione della lista degli utenti
socket.on('list', (userList) => {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = '';  // Svuota la lista prima di aggiornare
    userList.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;

        // Crea un pulsante per inviare invito
        const inviteButton = document.createElement('button');
        inviteButton.textContent = 'Invita';
        inviteButton.onclick = () => sendInvite(user.socketId);

        li.appendChild(inviteButton);
        userListElement.appendChild(li);
    });
});

// Gestione degli inviti ricevuti
socket.on('inviteReceived', (data) => {
    const inviteListElement = document.getElementById('inviteList');
    const li = document.createElement('li');
    li.textContent = `Invito da ${data.from}`;

    // Pulsante per accettare l'invito
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accetta';
    acceptButton.onclick = () => acceptInvite(data.from);

    li.appendChild(acceptButton);
    inviteListElement.appendChild(li);
});

// Funzione per accettare un invito
function acceptInvite(inviterId) {
    const gameId = `${socket.id}-${inviterId}`;
    socket.emit('acceptInvite', { gameId, invitedUserId: inviterId });
}

// Quando una partita inizia
socket.on('gameStarted', (data) => {
    alert(`La partita è iniziata! ID partita: ${data.gameId}`);
});

// Gestione della chat
document.getElementById('sendMessage').onclick = () => {
    const message = document.getElementById('message').value;
    socket.emit('message', message);
};

// Gestione dei messaggi di chat
socket.on('chat', (response) => {
    console.log(response);
});

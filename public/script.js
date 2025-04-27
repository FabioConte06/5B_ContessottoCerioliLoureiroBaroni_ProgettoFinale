// Connessione al server WebSocket
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
const battleContainer = document.getElementById("battle-container");
const playerGrid = document.getElementById("player-grid");
const battleChatMessages = document.getElementById("battle-chat-messages");
const battleMessageInput = document.getElementById("battle-message");
const battleSendButton = document.getElementById("battle-send");

let currentUsername = "";

// Funzione per registrarsi
const register = function(username, password) {
    fetch("https://ws.cipiaceinfo.it/credential/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", key: "3819207b-2545-44f5-9bce-560b484b2f0f" },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.result === "Ok") {
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            currentUsername = username;
            socket.emit('register', { username: username });
            alert("Registrazione completata!");
        } else {
            alert("Registrazione fallita.");
        }
    })
    .catch(function() {
        alert("Errore di rete.");
    });
};

// Funzione per il login
const login = function(email, password) {
    fetch("https://ws.cipiaceinfo.it/credential/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", key: "3819207b-2545-44f5-9bce-560b484b2f0f" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.result === true) {
            sessionStorage.setItem("Logged", "true");
            loginRegisterContainer.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            const username = email.split('@')[0];
            currentUsername = username;
            socket.emit('register', { username: username });
            alert("Login effettuato!");
        } else {
            alert("Login fallito.");
        }
    })
    .catch(function() {
        alert("Errore di rete.");
    });
};

// Bottoni login e registrazione
loginButton.onclick = function() {
    if (loginEmail.value && loginPassword.value) {
        login(loginEmail.value, loginPassword.value);
    } else {
        alert("Compila tutti i campi.");
    }
};

registerButton.onclick = function() {
    if (registerUsername.value && registerPassword.value) {
        register(registerUsername.value, registerPassword.value);
    } else {
        alert("Compila tutti i campi.");
    }
};

// Invio messaggio chat globale
sendMessageButton.onclick = function() {
    if (messageInput.value) {
        socket.emit('chatMessage', { username: currentUsername, message: messageInput.value });
        messageInput.value = '';
    }
};

// Invio messaggio chat battaglia
battleSendButton.onclick = function() {
    if (battleMessageInput.value) {
        socket.emit('chatMessage', { username: currentUsername, message: battleMessageInput.value });
        battleMessageInput.value = '';
    }
};

// Ricezione messaggi chat
socket.on('chatMessage', function(data) {
    let container;
    if (battleContainer.classList.contains('hidden')) {
        container = document.getElementById("chatContainer");
    } else {
        container = battleChatMessages;
    }
    const msg = document.createElement('div');
    msg.textContent = data.username + ": " + data.message;
    container.append(msg);
});

// Aggiornamento lista utenti
socket.on('userList', function(users) {
    userListElement.innerHTML = '';
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const li = document.createElement('li');
        li.textContent = user.name;
        const btn = document.createElement('button');
        btn.textContent = 'Invita';
        btn.onclick = function() { sendInvite(user.socketId); };
        li.append(btn);
        userListElement.append(li);
    }
});

// Funzione invio invito
const sendInvite = function(socketId) {
    socket.emit('sendInvite', socketId);
};

// Ricezione invito
socket.on('inviteReceived', function(data) {
    const div = document.createElement('div');
    div.textContent = "Hai ricevuto un invito da " + data.from;

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accetta';
    acceptBtn.onclick = function() {
        socket.emit('acceptInvite', { inviterId: data.inviterId });
        div.remove();
    };

    const declineBtn = document.createElement('button');
    declineBtn.textContent = 'Rifiuta';
    declineBtn.onclick = function() {
        socket.emit('declineInvite', data.inviterId);
        div.remove();
    };

    div.append(acceptBtn);
    div.append(declineBtn);
    inviteListElement.append(div);
});

// Ricezione rifiuto invito
socket.on('inviteDeclined', function(data) {
    alert(data.by + " ha rifiutato il tuo invito.");
});

// Inizio partita
socket.on('gameStarted', function(data) {
    alert("Partita iniziata! ID partita: " + data.gameId);
    gameContainer.classList.add('hidden');
    battleContainer.classList.remove('hidden');
    generateGrid();
});

// Generazione griglia del giocatore
function generateGrid() {
    playerGrid.innerHTML = '';
    const grid = [];
    for (let i = 0; i < 10; i++) {
        grid.push(new Array(10).fill(0));
    }
    const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    for (let s = 0; s < ships.length; s++) {
        const size = ships[s];
        let placed = false;
        while (!placed) {
            let orientation = 'H';
            if (Math.random() < 0.5) {
                orientation = 'V';
            }
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            if (canPlaceShip(grid, row, col, size, orientation)) {
                placeShip(grid, row, col, size, orientation);
                placed = true;
            }
        }
    }

    for (let i = 0; i < 10; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let j = 0; j < 10; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            if (grid[i][j] === 1) {
                cellDiv.classList.add('ship');
            }
            rowDiv.append(cellDiv);
        }
        playerGrid.append(rowDiv);
    }
}

// Controlla se si può piazzare la nave
function canPlaceShip(grid, row, col, size, orientation) {
    if (orientation === 'H') {
        if (col + size > 10) return false;
        for (let i = 0; i < size; i++) {
            if (grid[row][col + i] !== 0) return false;
        }
    } else {
        if (row + size > 10) return false;
        for (let i = 0; i < size; i++) {
            if (grid[row + i][col] !== 0) return false;
        }
    }
    return true;
}

// Piazzamento nave sulla griglia
function placeShip(grid, row, col, size, orientation) {
    if (orientation === 'H') {
        for (let i = 0; i < size; i++) {
            grid[row][col + i] = 1;
        }
    } else {
        for (let i = 0; i < size; i++) {
            grid[row + i][col] = 1;
        }
    }
}
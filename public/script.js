// public/script.js
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

const battleContainer = document.createElement('div');
battleContainer.id = 'battle-container';
battleContainer.className = 'hidden';
battleContainer.innerHTML = `
  <div id="player-grid"></div>
  <div id="battle-chat">
    <div id="battle-chat-messages"></div>
    <input type="text" id="battle-message" placeholder="Scrivi un messaggio">
    <button id="battle-send">Invia</button>
  </div>
`;
document.body.append(battleContainer);

const playerGrid = document.getElementById("player-grid");
const battleChatMessages = document.getElementById("battle-chat-messages");
const battleMessageInput = document.getElementById("battle-message");
const battleSendButton = document.getElementById("battle-send");

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

battleSendButton.onclick = () => {
    if (battleMessageInput.value) {
        socket.emit('chatMessage', battleMessageInput.value);
        battleMessageInput.value = '';
    }
};

socket.on('chatMessage', (message) => {
    const container = battleContainer.classList.contains('hidden') ? document.getElementById("chatContainer") : battleChatMessages;
    const msg = document.createElement('div');
    msg.textContent = message;
    container.append(msg);
});

socket.on('userList', (users) => {
    userListElement.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        const btn = document.createElement('button');
        btn.textContent = 'Invita';
        btn.onclick = () => sendInvite(user.socketId);
        li.append(btn);
        userListElement.append(li);
    });
});

const sendInvite = (socketId) => {
    socket.emit('sendInvite', socketId);
};

socket.on('inviteReceived', ({ from, inviterId }) => {
    const div = document.createElement('div');
    div.textContent = `Hai ricevuto un invito da ${from}`;

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accetta';
    acceptBtn.onclick = () => {
        socket.emit('acceptInvite', { inviterId });
        div.remove();
    };

    const declineBtn = document.createElement('button');
    declineBtn.textContent = 'Rifiuta';
    declineBtn.onclick = () => {
        socket.emit('declineInvite', inviterId);
        div.remove();
    };

    div.append(acceptBtn, declineBtn);
    inviteListElement.append(div);
});

socket.on('inviteDeclined', ({ by }) => {
    alert(`${by} ha rifiutato il tuo invito.`);
});

socket.on('gameStarted', ({ gameId }) => {
    alert(`Partita iniziata! ID partita: ${gameId}`);
    gameContainer.classList.add('hidden');
    battleContainer.classList.remove('hidden');
    generateGrid();
});

function generateGrid() {
    playerGrid.innerHTML = '';
    const grid = Array.from({ length: 10 }, () => Array(10).fill(0));
    const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    ships.forEach(size => {
        let placed = false;
        while (!placed) {
            const orientation = Math.random() < 0.5 ? 'H' : 'V';
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            if (canPlaceShip(grid, row, col, size, orientation)) {
                placeShip(grid, row, col, size, orientation);
                placed = true;
            }
        }
    });

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

function canPlaceShip(grid, row, col, size, orientation) {
    if (orientation === 'H') {
        if (col + size > 10) return false;
        for (let i = 0; i < size; i++) if (grid[row][col + i] !== 0) return false;
    } else {
        if (row + size > 10) return false;
        for (let i = 0; i < size; i++) if (grid[row + i][col] !== 0) return false;
    }
    return true;
}

function placeShip(grid, row, col, size, orientation) {
    if (orientation === 'H') {
        for (let i = 0; i < size; i++) grid[row][col + i] = 1;
    } else {
        for (let i = 0; i < size; i++) grid[row + i][col] = 1;
    }
}

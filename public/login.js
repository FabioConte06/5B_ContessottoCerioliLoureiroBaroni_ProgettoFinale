const loginSection = document.getElementById("login-section");
const inviteSection = document.getElementById("invite-section");
const gameSection = document.getElementById("game-section");
const loginButton = document.getElementById("login-button");
const goToLogin = document.getElementById("go-to-login");
const loginUsername = document.getElementById("username");
const loginPassword = document.getElementById("password");
const registerSection = document.getElementById("register-section");
const socket = io();

function showSection(section) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    inviteSection.classList.add("hidden");
    gameSection.classList.add("hidden");
    section.classList.remove("hidden");
}

goToLogin.onclick = () => {
    showSection(loginSection);
};

const login = function(username, password) {
    return fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Login effettuato con successo!');
            showSection(inviteSection);
        } else {
            alert(data.message || 'Login fallito.');
        }
    })
    .catch(() => {
        alert('Errore di rete.');
    });
};

loginButton.onclick = async () => {
    const username = loginUsername.value;
    const password = loginPassword.value;
    if (username && password) {
        try {
            await login(username, password);
            currentUser = username;
            console.log('Utente loggato:', currentUser);
            socket.emit('user-login', username);
        } catch (error) {
            console.error('Errore durante il login:', error);
        }
    } else {
        alert('Riempi tutti i campi.');
    }
};
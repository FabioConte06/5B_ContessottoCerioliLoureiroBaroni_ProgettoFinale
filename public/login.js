const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const inviteSection = document.getElementById("invite-section");
const gameSection = document.getElementById("game-section");
const registerButton = document.getElementById("register-button");
const loginButton = document.getElementById("login-button");
const goToRegister = document.getElementById("go-to-register");
const goToLogin = document.getElementById("go-to-login");
const loginUsername = document.getElementById("username");
const loginPassword = document.getElementById("password");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");

function showSection(section) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    inviteSection.classList.add("hidden");
    gameSection.classList.add("hidden");
    section.classList.remove("hidden");
}

goToRegister.onclick = () => {
    showSection(registerSection);
}

goToLogin.onclick = () => {
    showSection(loginSection);
};

const login = function(username, password) {
    fetch('/login', {
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

const register = function(username, email) {
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Registrazione completata! Controlla la tua email.');
            showSection(loginSection);
        } else {
            alert(data.message || 'Errore nella registrazione.');
        }
    })
    .catch(() => {
        alert('Errore di rete.');
    });
};

registerButton.onclick = () => {
    const username = registerUsername.value;
    const email = registerEmail.value;
    if (username && email) {
        register(username, email);
    } else {
        alert('Riempi tutti i campi.');
    }
};

loginButton.onclick = () => {
    const username = loginUsername.value;
    const password = loginPassword.value;
    if (username && password) {
        login(username, password);
    } else {
        alert("Riempi tutti i campi.");
    }
};
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const loginUsername = document.getElementById("username");
const loginPassword = document.getElementById("password");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");

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
        } else {
            alert(data.message || 'Errore nella registrazione.');
        }
    })
    .catch(() => {
        alert('Errore di rete.');
    });
};

if (registerButton) {
    registerButton.onclick = () => {
        const username = registerUsername.value;
        const email = registerEmail.value;
        if (username && email) {
            register(username, email);
        } else {
            alert('Riempi tutti i campi.');
        }
    };
}

if (loginButton) {
    loginButton.onclick = () => {
        const username = loginUsername.value;
        const password = loginPassword.value;
        if (username && password) {
            login(username, password);
        } else {
            alert("Riempi tutti i campi.");
        }
    };
}
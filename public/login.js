const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const loginUsername = document.getElementById("username");
const loginPassword = document.getElementById("password");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");

const login = function(username, password) {
    fetch("https://ws.cipiaceinfo.it/credential/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            sessionStorage.setItem("Logged", "true");
            alert("Login effettuato!");
        } else {
            alert("Login fallito.");
        }
    })
    .catch(function() {
        alert("Errore di rete.");
    });
};

const register = function(username, email) {
    const inviaEmail = async (body) =>{
        const transporter = await createTrasporter()
        const mailOptions = {
            from: '"Battleship.site" ${conf.mailFrom}',
            to: email,
            subject: "La tua nuova password",
            text: "Ciao ${body.username}!\n\nEcco la tua nuova password: ${body.password}"
          };
          
          // Invio
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.error("Errore invio:", error);
            }
            console.log("Email inviata:", info.response);
          });
    }
};

if (loginButton) {
    loginButton.onclick = () => {
        const username = loginUsername.value;
        const password = loginPassword.value;
        if (username && password) {
            login(username, password);
        } else {
            alert("Please fill in all fields.");
        }
    };
}

if (registerButton) {
    registerButton.onclick = () => {
        const username = registerUsername.value;
        const email = registerEmail.value;
        if (username && email) {
            register(username, email);
        } else {
            alert("Please fill in all fields.");
        }
    };
}
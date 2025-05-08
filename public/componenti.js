const socket = io();
let currentUser = null;

const websocket = () => {
    return {
        connect: () => {
            socket.on('connect', () => {
                console.log(`Connesso al server con ID: ${socket.id}`);
            });
        },
        updateUsers: () => {
            socket.on('update-users', (users) => {
                console.log('Utenti online:', users);
            });
        },
        receiveChatMessage: () => {
            socket.on('receive-chat-message', ({ user, message }) => {
                console.log(`${user}: ${message}`);
            });
        },
        receiveInvite: () => {
            socket.on('receive-invite', ({ from }) => {
                console.log("socket invito")
                const accept = confirm(`${from} ti ha invitato a giocare. Accetti?`);
                if (accept) {
                    socket.emit('accept-invite', { from, to: currentUser });
                    alert('Invito accettato! Inizia la partita.');
                }
            });
        },
        inviteError: () => {
            socket.on('invite-error', ({ message }) => {
                alert(message);
            });
        }
    };
};

const inviti = () => {
    return {
        sendChatMessage: () => {
            const sendChatButton = document.getElementById('send-chat-button');
            const chatInput = document.getElementById('chat-input');

            sendChatButton.onclick = () => {
                const message = chatInput.value.trim();
                if (message) {
                    socket.emit('send-chat-message', { user: currentUser, message });
                    chatInput.value = '';
                } else {
                    alert('Il messaggio non può essere vuoto.');
                }
            };

            chatInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const message = chatInput.value.trim();
                    if (message) {
                        socket.emit('send-chat-message', { user: currentUser, message });
                        chatInput.value = '';
                    } else {
                        alert('Il messaggio non può essere vuoto.');
                    }
                }
            };
        },
        receiveChatMessage: () => {
            const chatBox = document.getElementById('chat-box');
            socket.on('receive-chat-message', ({ user, message }) => {
                chatBox.innerHTML+=`<div>${user}: ${message}</div>`
            }) 
        },
        updateUsers: () => {
            const userList = document.getElementById('user-list');
            socket.on('update-users', (users) => {
                if (userList) {
                    userList.innerHTML = users.map(user => {
                        if (user === currentUser) {
                            return `<li>${user} (Tu)</li>`;
                        } else {
                            return `<li>${user} <button class="invite-button" data-user="${user}">Invita</button></li>`;
                        }
                    }).join('');

                    const inviteButtons = document.querySelectorAll('.invite-button');
                    inviteButtons.forEach(button => {
                        button.onclick = () => {
                            const to = button.getAttribute('data-user');
                            invite.sendInvite(to);
                        };
                    });
                }
            });
        },
        sendInvite: (to) => {
            console.log(currentUser, to);
            if (!currentUser) {
                alert('Devi effettuare il login per inviare un invito.');
                return;
            }
            socket.emit('send-invite', { from: currentUser, to });
        },
        receiveInvite: () => {
            socket.on('receive-invite', ({ from }) => {
                console.log("compnenti:", from)
                const accept = confirm(`${from} ti ha invitato a giocare. Accetti?`);
                if (accept) {
                    console.log("accetta:", from)
                    socket.emit('accept-invite', { from, to: currentUser });
                }
            });
        },
        inviteError: () => {
            socket.on('invite-error', ({ message }) => {
                alert(message);
            });
        },
        startGame: () => {}
    };
};

const login = () => {
    return {
        login: async (username, password) => {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (data.success) {
                    currentUser = username;
                    alert('Login effettuato con successo!');
                    const inviteSection = document.getElementById('invite-section');
                    const loginForm = document.getElementById('login-form');
                    loginForm.classList.add('hidden');
                    inviteSection.classList.remove('hidden');
                    socket.emit('user-login', username);
                } else {
                    alert(data.message || 'Login fallito.');
                }
            } catch (error) {
                alert('Errore di rete.');
            }
        },
        setup: () => {
            const loginButton = document.getElementById('login-button');
            const goRegister = document.getElementById('go-to-register');
            const loginForm = document.getElementById('login-form');

            loginForm.onsubmit = (event) => {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                if (username && password) {
                    userLogin.login(username, password);
                } else {
                    alert('Riempi tutti i campi.');
                }
            };

            loginButton.onclick = () => {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                if (username && password) {
                    userLogin.login(username, password);
                } else {
                    alert('Riempi tutti i campi.');
                }
            };

            goRegister.onclick = () => {
                const loginForm = document.getElementById('login-form');
                const registerForm = document.getElementById('register-form');
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        }
    };
};

const register = () => {
    return {
        register: async (username, email) => {
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Registrazione completata! Controlla la tua email.');
                    const loginForm = document.getElementById('login-form');
                    const registerForm = document.getElementById('register-form');
                    registerForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                } else {
                    alert(data.message || 'Errore nella registrazione.');
                }
            } catch (error) {
                alert('Errore di rete.');
            }
        },
        setup: () => {
            const registerButton = document.getElementById('register-button');
            const registerForm = document.getElementById('register-form');

            registerForm.onsubmit = (event) => {
                event.preventDefault();
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                if (username && email) {
                    userRegister.register(username, email);
                } else {
                    alert('Riempi tutti i campi.');
                }
            };

            registerButton.onclick = () => {
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                if (username && email) {
                    userRegister.register(username, email);
                } else {
                    alert('Riempi tutti i campi.');
                }
            };

            const backLogin = document.getElementById('back-login');
            backLogin.onclick = () => {
                const loginForm = document.getElementById('login-form');
                const registerForm = document.getElementById('register-form');
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
            }
        }
    };
};

const partita = () => {
    return {
        setup: () => {
            const canvas1 = document.getElementById('canvas1');
            const canvas2 = document.getElementById('canvas2');
            const ctx1 = canvas1.getContext('2d');
            const ctx2 = canvas2.getContext('2d');
            const turnoText = document.getElementById('turno');
            const nextTurn = document.getElementById('nextTurn');
            const form = document.getElementById('form');
            const overlay = document.getElementById('overlay');

            let grid1 = Array.from({ length: 10 }, () => Array(10).fill(0));
            let grid2 = Array.from({ length: 10 }, () => Array(10).fill(0));
            let turno = 1;

            const aggiorna = () => {
                // Aggiorna la griglia
            };

            nextTurn.onclick = () => {
                aggiorna();
                form.style.display = "none";
                overlay.style.display = "none";
            };

            // Altre funzioni per gestire la partita
        }
    };
};

const ws = websocket();
ws.connect();

const userLogin = login();
userLogin.setup();

const userRegister = register();
userRegister.setup();

const invite = inviti();
invite.updateUsers();
invite.sendChatMessage();
invite.receiveChatMessage();
invite.receiveInvite();

const game = partita();
game.setup();

export { websocket, inviti, login, register, partita };

socket.on('start-game', ({ opponent }) => {
    alert(`La partita contro ${opponent} sta per iniziare!`);
    const inviteSection = document.getElementById('invite-section');
    const gameSection = document.getElementById('game-section');
    inviteSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
});
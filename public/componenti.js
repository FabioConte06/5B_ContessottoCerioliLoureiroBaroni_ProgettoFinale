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
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Invito accettato! Inizia la partita.';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                    notifica.classList.remove('show');
                    setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
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
                    const notifica = document.getElementById('notifica');
                        notifica.textContent = 'Il messaggio non può essere vuoto.';
                        notifica.classList.remove('hidden');
                        notifica.classList.add('show');
                        setTimeout(() => {
                        notifica.classList.remove('show');
                        setTimeout(() => notifica.classList.add('hidden'), 400);
                        }, 3000);
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
                        const notifica = document.getElementById('notifica');
                        notifica.textContent = 'Il messaggio non può essere vuoto.';
                        notifica.classList.remove('hidden');
                        notifica.classList.add('show');
                        setTimeout(() => {
                        notifica.classList.remove('show');
                        setTimeout(() => notifica.classList.add('hidden'), 400);
                        }, 3000);
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
            socket.emit('active-games', {}, (activeGames) => {
                userList.innerHTML = users.map(user => {
                    let inGame = false;

                    for (let i = 0; i < activeGames.length; i++) {
                        const game = activeGames[i];
                        if (game.players.includes(user) && game.players.includes(currentUser)) {
                            inGame = true;
                            break;
                        }
                    }

                    if (user === currentUser) {
                        return `<li>${user} (Tu)</li>`;
                    } else if (inGame) {
                        return `<li>${user} (In partita)</li>`;
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
                });
                }
            });
        },
        sendInvite: (to) => {
            console.log(currentUser, to);
            socket.emit('send-invite', { from: currentUser, to });
        },
        receiveInvite: () => {
        socket.on('receive-invite', ({ from }) => {
        const notifica = document.getElementById('notifica');
        notifica.innerHTML = `${from} ti ha invitato a giocare. <button id="accept-invite">Accetta</button> <button id="decline-invite">Rifiuta</button>`;
        notifica.classList.remove('hidden');
        notifica.classList.add('show');

        document.getElementById('accept-invite').onclick = () => {
            socket.emit('accept-invite', { from, to: currentUser  });
            notifica.classList.add('hidden');
        };

        document.getElementById('decline-invite').onclick = () => {
            notifica.classList.add('hidden');
        };
    });
},

        inviteError: () => {
            socket.on('invite-error', ({ message }) => {
                `La partita contro ${opponent} sta per iniziare!`
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
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Login effettuato con successo!';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                    notifica.classList.remove('show');
                    setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
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
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Riempi tutti i campi.';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                    notifica.classList.remove('show');
                    setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
                }
            };

            loginButton.onclick = () => {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                if (username && password) {
                    userLogin.login(username, password);
                } else {
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Riempi tutti i campi.';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                    notifica.classList.remove('show');
                    setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
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
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Registrazione completata, controlla la tua email';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                        notifica.classList.remove('show');
                        setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
                    const loginForm = document.getElementById('login-form');
                    const registerForm = document.getElementById('register-form');
                    registerForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                } else {
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = data.message || 'Errore nella registrazione.';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                        notifica.classList.remove('show');
                        setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
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
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Riempi tutti i campi.';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                    notifica.classList.remove('show');
                    setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
                }
            };

            registerButton.onclick = () => {
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                if (username && email) {
                    userRegister.register(username, email);
                } else {
                    const notifica = document.getElementById('notifica');
                    notifica.textContent = 'Riempi tutti i campi.';
                    notifica.classList.remove('hidden');
                    notifica.classList.add('show');
                    setTimeout(() => {
                    notifica.classList.remove('show');
                    setTimeout(() => notifica.classList.add('hidden'), 400);
                    }, 3000);
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
    const canvasAlly = document.getElementById('canvas1');
    const canvasEnemy = document.getElementById('canvas2');
    const ctxAlly = canvasAlly.getContext('2d');
    const ctxEnemy = canvasEnemy.getContext('2d');
    const turnoText = document.getElementById('turno');

    const rows = 10;
    const cols = 10;
    const cellSize = 50;

    return {
        setup: (turno, to, lista) => {
            let gridAlly = Array.from({ length: rows }, () => Array(cols).fill(0));
            let gridEnemy = Array.from({ length: rows }, () => Array(cols).fill(0));

            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }
            
            function getPossiblePositions(length) {
                const positions = [];
            
                for (let y = 0; y < 10; y++) {
                    for (let x = 0; x <= 10 - length; x++) {
                        positions.push({ x, y, dir: 0 }); // Horizontal
                    }
                }
            
                for (let y = 0; y <= 10 - length; y++) {
                    for (let x = 0; x < 10; x++) {
                        positions.push({ x, y, dir: 1 }); // Vertical
                    }
                }
            
                shuffle(positions);
                return positions;
            }
            
            function canPlace(grid, x, y, dir, length) {
                for (let i = 0; i < length; i++) {
                    const nx = x + (dir === 0 ? i : 0);
                    const ny = y + (dir === 1 ? i : 0);
                    if (grid[ny][nx] !== 0) return false;
                }
                return true;
            }
            
            function place(grid, x, y, dir, length) {
                for (let i = 0; i < length; i++) {
                    const nx = x + (dir === 0 ? i : 0);
                    const ny = y + (dir === 1 ? i : 0);
                    grid[ny][nx] = 1;
                }
            }
            
            function placeShip(grid, length, count) {
                const positions = getPossiblePositions(length);
                let placed = 0;
            
                for (let pos of positions) {
                    if (placed >= count) break;
                    if (canPlace(grid, pos.x, pos.y, pos.dir, length)) {
                        place(grid, pos.x, pos.y, pos.dir, length);
                        placed++;
                    }
                }
            }
            
            // Posiziona le navi
            placeShip(gridAlly, 4, 1); // Portaerei
            placeShip(gridAlly, 3, 2); // Incrociatori
            placeShip(gridAlly, 2, 3); // Torpedinieri
            placeShip(gridAlly, 1, 4); // Sommergibili

            socket.emit('enemy', { from: currentUser, lista, turno, gridAlly })

            new Promise(resolve => {
                socket.once('enemy-setup', ({ gridEnemySocket }) => {
                    resolve(gridEnemySocket);
                });
            }).then(gridEnemy => {
                console.log("nemici", gridEnemy);
                shuffle(lista);
                socket.emit('start', { from:currentUser, gridAlly, gridEnemy, turno, lista })
            })            
        },

        game: (gridAlly, gridEnemy, turno, lista) => {
            console.log("game",gridAlly, gridEnemy)

            function drawGridAlly(ctx, grid) {
                ctx.clearRect(0, 0, canvasAlly.width, canvasAlly.height);
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        ctx.strokeStyle = 'black';
                        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        if (grid[i][j] === 2) {
                            ctx.fillStyle = 'red';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        } else if (grid[i][j] === 3) {
                            ctx.fillStyle = 'lightblue';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        } else if (grid[i][j] === 1) {
                            ctx.fillStyle = 'gray';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }

            function drawGridEnemy(ctx, grid) {
                console.log("griglia")
                ctx.clearRect(0, 0, canvas1.width, canvas1.height);
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        ctx.strokeStyle = 'black';
                        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        if (grid[i][j] === 2) {
                            ctx.fillStyle = 'red';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        } else if (grid[i][j] === 3 && grid[i][j] === 1) {
                            ctx.fillStyle = 'lightblue';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }
            
            // Aggiorna la griglia
            function aggiorna() {
                console.log("update")
                drawGridEnemy(ctxEnemy, gridEnemy)
                socket.emit('update', { gridAlly, gridEnemy, turno, lista })
                turnoText.innerText = `Turno: Giocatore ${turno}`;
            }

            function handleCanvaClick(event) {
                canvas.addEventListener('click', (event) => {
                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    const j = Math.floor(x / cellSize);
                    const i = Math.floor(y / cellSize);
            
                    if (i >= 0 && i < rows && j >= 0 && j < cols) {
                        if (gridEnemy[i][j] === 1) {
                            gridEnemy[i][j] = 2;
                            aggiorna();
                        } else if (gridEnemy[i][j] === 0) {
                            gridEnemy[i][j] = 3;
                            turno++;
                            if (turno == 2) {
                                turno = 0;
                            }
                            socket.emit('start', { from:currentUser, gridAlly, gridEnemy, turno, lista })
                        }
                    }
                });
            }
            
            // Gestione del click sulla griglia
            function creaGestoreClick(gridNemico) {
                return function handleCanvasClick(event) {
                    let canvas = canvasEnemy
                    canvas = event.currentTarget;
                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    const j = Math.floor(x / cellSize);
                    const i = Math.floor(y / cellSize);
            
                    if (i >= 0 && i < rows && j >= 0 && j < cols) {
                        if (gridNemico[i][j] === 1) {
                            console.log("colpito")
                            gridNemico[i][j] = 2;
                            aggiorna();

                        } else if (gridNemico[i][j] === 0) {
                            console.log("mancato")
                            canvas.removeEventListener('click', handler);
                            gridNemico[i][j] = 3;
                            turno++;
                            if (turno === 2) {
                                turno = 0;
                            }

                        }
                    }
                };
            }

            drawGridAlly(ctxAlly, gridAlly)
            drawGridEnemy(ctxEnemy, gridEnemy)

            const handler = creaGestoreClick(gridEnemy);
            canvasEnemy.addEventListener('click', handler);            
        },

        updateAlly: (gridAllySocket, gridEnemySocket) => {

            let gridEnemy = gridAllySocket;
            let gridAlly = gridEnemySocket

            console.log(gridEnemy)

            console.log("update", gridAlly, gridEnemy)

            function drawGridAlly(ctx, grid) {
                console.log("griglia")
                ctx.clearRect(0, 0, canvas1.width, canvas1.height);
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        ctx.strokeStyle = 'black';
                        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        if (grid[i][j] === 2) {
                            ctx.fillStyle = 'red';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        } else if (grid[i][j] === 3) {
                            ctx.fillStyle = 'lightblue';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        } else if (grid[i][j] === 1) {
                            ctx.fillStyle = 'gray';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }

            function drawGridEnemy(ctx, grid) {
                console.log("griglia")
                ctx.clearRect(0, 0, canvas1.width, canvas1.height);
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        ctx.strokeStyle = 'black';
                        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        if (grid[i][j] === 2) {
                            ctx.fillStyle = 'red';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        } else if (grid[i][j] === 3 && grid[i][j] === 1) {
                            ctx.fillStyle = 'lightblue';
                            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }
            
            drawGridAlly(ctxAlly, gridAlly);
            drawGridEnemy(ctxEnemy, gridEnemy)
        },
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



export { websocket, inviti, login, register, partita };

socket.on('setup-game', ({ opponent, turno, lista }) => {
    const notifica = document.getElementById('notifica');
    notifica.textContent = `La partita contro ${opponent} sta per iniziare!`;
    notifica.classList.remove('hidden');
    notifica.classList.add('show');
    setTimeout(() => {
    notifica.classList.remove('show');
    setTimeout(() => notifica.classList.add('hidden'), 400);
    }, 3000);
    const inviteSection = document.getElementById('invite-section');
    const gameSection = document.getElementById('game-section');
    inviteSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    const game = partita();
    game.setup(turno, opponent, lista);
});

socket.on('start-game', ({ gridAlly, gridEnemy, turno, lista }) => {
    const game = partita();
    game.game(gridAlly, gridEnemy, turno, lista);
});

socket.on('update-ally', ({ gridAllySocket, gridEnemySocket }) => {
    const game = partita();
    game.updateAlly(gridAllySocket, gridEnemySocket)
});

socket.on('render-neutro', ({ gridAlly }) =>{
    const game = partita();
    game.render()
})


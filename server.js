const fs = require('fs');
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const database = require('./database');

const conf = JSON.parse(fs.readFileSync('./conf.json'));
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const activeGames = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const onlineUsers = {};

async function createTransporter() {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: conf.mailFrom,
            pass: conf.mailSecret
        }
    });
}

const inviaEmail = async (body, password) => {
    const transporter = await createTransporter();
    const mailOptions = {
        from: `"BattleShip.site" <${conf.mailFrom}>`,
        to: body.email,
        subject: "La tua nuova password",
        text: `Ciao ${body.username}!\n\nEcco la tua nuova password: ${password}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error("Errore invio email:", error);
        }
        console.log("Email inviata:", info.response);
    });
};

app.post('/register', async (req, res) => {
    const { username, email } = req.body;
    if (!email.endsWith('@itis-molinari.eu')) {
        return res.status(400).json({ success: false, message: 'Email non valida.' });
    }
    const password = Math.random().toString(36).slice(-8);
    console.log(`Password generata per ${username}: ${password}`);
    try {
        await database.register(username, email, password);
        await inviaEmail({ username, email }, password);
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message || 'Errore nella registrazione.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await database.login(username, password);
    if (user) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Credenziali non valide.' });
    }
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user-login', (username) => {
        onlineUsers[socket.id] = username;
        console.log('Utenti online:', onlineUsers);
        io.emit('update-users', Object.values(onlineUsers));
    });

    socket.on('send-chat-message', ({ user, message }) => {
        io.emit('receive-chat-message', { user, message });
    });

    socket.on('send-invite', ({ from, to }) => {
        let destinationSocketId = null;

        for (const id in onlineUsers) {
            if (onlineUsers[id] === to) {
                destinationSocketId = id;
                break;
            }
        }
        if (destinationSocketId) {
            io.to(destinationSocketId).emit('receive-invite', { from });
        } else {
            socket.emit('invite-error', { message: 'Utente non disponibile.' });
        }
    });

    socket.on('accept-invite', ({ from, to }) => {
    console.log("server");
    let fromSocketId = null;
    for (const id in onlineUsers) {
        if (onlineUsers[id] === from) {
            fromSocketId = id;
            break;
        }
    }
    
    let turno = Math.floor(Math.random() * 2);
    if (fromSocketId) {
        const lista = [fromSocketId, socket.id];
        activeGames.push({ player1: from, player2: to, lista });
        io.emit('update-games', activeGames);
        io.emit('update-users', Object.values(onlineUsers));
        io.to(fromSocketId).emit('setup-game', { opponent: to, turno, lista });
        io.to(socket.id).emit('setup-game', { opponent: from, turno, lista });
        console.log("fromSocketId:", fromSocketId);
console.log("socket.id:", socket.id);
console.log("lista:", lista);
    }
});

    socket.on('enemy', ({ from, lista, turno, gridAlly }) => {

        gridEnemySocket = gridAlly
        
        let destinationSocketId = null;

        for (const id in onlineUsers) {
            if (onlineUsers[id] === from) {
                destinationSocketId = id;
                break;
            }
        }
        console.log(destinationSocketId, lista[turno])
        console.log(turno)
        if (lista[turno] == destinationSocketId) {
            if (turno == 0) {
                io.to(lista[turno+1]).emit('enemy-setup', { gridEnemySocket });
            }
            else {
                io.to(lista[turno-1]).emit('enemy-setup', { gridEnemySocket });
            }   
        }
        else {
            io.to(lista[turno]).emit('enemy-setup', { gridEnemySocket });
        }
    });

    socket.on('start', ({ from, gridAlly, gridEnemy, turno, lista }) => {
        console.log("turno")

        let destinationSocketId = null;

        let gridEnemySocket = gridAlly
        let gridAllySocket = gridEnemy

        for (const id in onlineUsers) {
            if (onlineUsers[id] === from) {
                destinationSocketId = id;
                break;
            }
        }

        console.log(destinationSocketId, lista[turno])
        console.log(turno)

        if (lista[turno] == destinationSocketId) {
            io.to(lista[turno]).emit('start-game', { gridAlly, gridEnemy, turno, lista });
        }
        else {
            io.to(destinationSocketId).emit('update-ally', {gridAllySocket, gridEnemySocket});
        }
    });

    socket.on('update', ({ gridAlly, gridEnemy, turno, lista, i, j }) => {
    const nextTurn = (turno + 1) % lista.length;
    const currentPlayer = onlineUsers[lista[nextTurn]];

    let resultMessage = '';
    if (gridEnemy[i][j] === 1) {
        gridEnemy[i][j] = 2;
        resultMessage = `${onlineUsers[lista[turno]]} ha colpito una nave!`;
    } else if (gridEnemy[i][j] === 0) {
        gridEnemy[i][j] = 3;
        resultMessage = `${onlineUsers[lista[turno]]} ha mancato il bersaglio.`;
    }

    // Verifica se tutte le navi sono distrutte
    const allShipsDestroyed = (grid) => {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col] === 1) {
                    return false; // C'è ancora una nave
                }
            }
        }
        return true; // Tutte le navi sono distrutte
    };

    if (allShipsDestroyed(gridEnemy)) {
        const winner = onlineUsers[lista[turno]];
        io.emit('game-event', { message: `${winner} ha vinto la battaglia!` });

        // Dopo 5 secondi, reindirizza entrambi i giocatori alla sezione degli inviti
        setTimeout(() => {
            io.to(lista[0]).emit('end-game');
            io.to(lista[1]).emit('end-game');
        }, 5000);
        return;
    }

    // Invia l'aggiornamento al prossimo giocatore
    io.to(lista[nextTurn]).emit('update-ally', { gridAllySocket: gridAlly, gridEnemySocket: gridEnemy, currentPlayer });
    io.emit('turno', { turno: nextTurn, currentPlayer });
    io.emit('game-event', { message: resultMessage });
});

    socket.on('active-games', (data, callback) => {
        callback(activeGames);
    })

    socket.on('disconnect', () => {
    const disconnectedUser = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    console.log('Utenti online dopo disconnessione:', onlineUsers);

    for (let i = activeGames.length - 1; i >= 0; i--) {
        if (activeGames[i].player1 === disconnectedUser || activeGames[i].player2 === disconnectedUser) {
            activeGames.splice(i, 1);
        }
    }
    io.emit('update-users', Object.values(onlineUsers));
    io.emit('update-games', activeGames);
});
});

server.listen(conf.port, () => {
    console.log(`Server running on port ${conf.port}`);
});
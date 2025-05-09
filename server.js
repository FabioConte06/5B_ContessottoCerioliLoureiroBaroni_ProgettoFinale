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
        console.log("server")
        let fromSocketId = null;
        for (const id in onlineUsers) {
            if (onlineUsers[id] === from) {
                fromSocketId = id;
                break;
            }
        }
        let turno = Math.floor(Math.random() * 2);
        if (fromSocketId) {
            io.to(fromSocketId).emit('setup-game', { opponent: to, turno });
            io.to(socket.id).emit('setup-game', { opponent: from, turno });
        }
    });

    socket.on('enemy', ({ to, gridAlly }) => {
        let destinationSocketId = null;

        for (const id in onlineUsers) {
            if (onlineUsers[id] === to) {
                destinationSocketId = id;
                break;
            }
        }
        if (destinationSocketId) {
            io.to(destinationSocketId).emit('enemy-setup', { gridAlly });
        }
    });

    socket.on('start', ({ from, to, gridAlly, gridEnemy, turno, lista }) => {
        if (lista[turno]) {
            io.to(lista[turno]).emit('start-game', { from, to, gridAlly, gridEnemy, turno, lista });
        }
    });

    socket.on('update', ({ gridEnemy, turno, lista }) => {
        if (turno == 1) {
            io.to(lista[turno-1]).emit('update-ally', {gridEnemy});
        }
        else {
            io.to(lista[turno+1]).emit('update-ally', {gridEnemy});
        }
    });

    socket.on('active-games', (data, callback) => {
        callback(activeGames);
    })

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        console.log('Utenti online dopo disconnessione:', onlineUsers);
        io.emit('update-users', Object.values(onlineUsers));
    });
});

server.listen(conf.port, () => {
    console.log(`Server running on port ${conf.port}`);
});
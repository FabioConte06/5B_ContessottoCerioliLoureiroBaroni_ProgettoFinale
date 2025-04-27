const fs = require('fs');
const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const conf = JSON.parse(fs.readFileSync('./conf.json'));
const port = conf.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

let onlineUsers = {};
let userList = [];
let games = {};

io.on('connection', (socket) => {
    console.log("socket connected: " + socket.id);

    // Gestione della connessione e impostazione del nome
    socket.on('setName', (name) => {
        onlineUsers[socket.id] = name;
        userList.push({ socketId: socket.id, name: name, online: true });
        io.emit('list', userList);
    });

    // Invio invito a un altro giocatore
    socket.on('sendInvite', (invitedUserId) => {
        const invitedUser = userList.find(user => user.socketId === invitedUserId);
        if (invitedUser && onlineUsers[invitedUserId]) {
            io.to(invitedUserId).emit('inviteReceived', { from: socket.id });
        }
    });

    // Gestione dell'accettazione dell'invito
    socket.on('acceptInvite', (data) => {
        const { gameId, invitedUserId } = data;

        // Crea la partita
        games[gameId] = {
            players: [socket.id, invitedUserId],
            moves: [],
            grids: {
                [socket.id]: Array(100).fill(null),
                [invitedUserId]: Array(100).fill(null)
            }
        };

        socket.join(gameId);
        io.to(invitedUserId).emit('gameStarted', { gameId });
        io.to(socket.id).emit('gameStarted', { gameId });
    });

    // Gestione del rifiuto dell'invito
    socket.on('declineInvite', (inviterId) => {
        io.to(inviterId).emit('inviteDeclined', { by: socket.id });
    });

    // Disconnessione di un utente
    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        userList = userList.map(user =>
            user.socketId === socket.id ? { ...user, online: false } : user
        );
        io.emit('list', userList);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

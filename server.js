const fs = require('fs');
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const conf = JSON.parse(fs.readFileSync('./conf.json'));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const onlineUsers = {};
let userList = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('register', ({ username }) => {
        onlineUsers[socket.id] = username;
        userList.push({ socketId: socket.id, name: username });
        io.emit('userList', userList);
    });

    socket.on('sendInvite', (invitedUserId) => {
        const invitedUser = userList.find(user => user.socketId === invitedUserId);
        if (invitedUser) {
            io.to(invitedUserId).emit('inviteReceived', { from: onlineUsers[socket.id], inviterId: socket.id });
        }
    });

    socket.on('acceptInvite', ({ inviterId }) => {
        const gameId = `game-${Date.now()}`;
        io.to(inviterId).emit('gameStarted', { gameId });
        io.to(socket.id).emit('gameStarted', { gameId });
    });

    socket.on('declineInvite', (inviterId) => {
        io.to(inviterId).emit('inviteDeclined', { by: onlineUsers[socket.id] });
    });

    socket.on('chatMessage', ({ username, message }) => {
        io.emit('chatMessage', { username, message });
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        userList = userList.filter(user => user.socketId !== socket.id);
        io.emit('userList', userList);
    });
});

server.listen(conf.port, () => {
    console.log(`Server running on port ${conf.port}`);
});
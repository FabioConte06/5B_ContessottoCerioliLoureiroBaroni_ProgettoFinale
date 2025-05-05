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

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.Email_User,
        pass: process.env.Email_Password
    }
});

app.post('/register', async (req, res) => {
    const { username, email } = req.body;
    if (!email.endsWith('@itis-molinari.eu')) {
        return res.status(400).json({ success: false, message: 'Email non valida.' });
    }
    const password = Math.random().toString(36).slice(-8);
    try {
        await database.register(username, email, password);
        await transporter.sendMail({
            from: process.env.Email_User,
            to: process.env.Email_User,
            subject: 'Registrazione completata',
            text: `La tua password è: ${password}`
        });
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Errore nella registrazione.' });
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
});

server.listen(conf.port, () => {
    console.log(`Server running on port ${conf.port}`);
});

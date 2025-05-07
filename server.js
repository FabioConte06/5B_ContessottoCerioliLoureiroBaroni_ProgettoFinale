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

const onlineUsers = {};

(async () => {
    try {
        await database.createTable();
        console.log("Tabella creata o già esistente.");
    } catch (error) {
        console.error("Errore durante la creazione della tabella:", error);
    }
})();

async function create_trasporter(){
    return transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: conf.mailFrom,
            pass: conf.mailSecret
        }
    });
}

const inviaEmail = async (body, password) =>{
    console.log(password);
    const transporter = await create_trasporter()
    const mailOptions = {
        from: `"BattleShip.site" <${conf.mailFrom}>`,
        to: body.email,
        subject: "La tua nuova password",
        text: `Ciao ${body.username}!\n\nEcco la tua nuova password: ${password}`
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error("Errore invio:", error);
        }
        console.log("Email inviata:", info.response);
      });
}

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

    socket.on('user-login', (username) => {
        onlineUsers.push({ socketId: socket.id, username });
        io.emit('update-users', onlineUsers.map(user => user.username)); // Invia solo i nomi utente
    });

    socket.on('send-invite', ({ from, to }) => {
        const recipient = onlineUsers.find(user => user.username === to);
        if (recipient) {
            io.to(recipient.socketId).emit('receive-invite', { from });
        }
    });

    socket.on('disconnect', () => {
        const index = onlineUsers.findIndex(user => user.socketId === socket.id);
        if (index !== -1) {
            onlineUsers.splice(index, 1);
        }
        io.emit('update-users', onlineUsers.map(user => user.username)); // Aggiorna la lista
    });
});

server.listen(conf.port, () => {
    console.log(`Server running on port ${conf.port}`);
});

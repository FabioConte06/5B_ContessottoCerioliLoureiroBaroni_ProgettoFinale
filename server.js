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

async function create_trasporter(){
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: conf.mailFrom,
            pass: conf.mailSecret
        }
    });
}

const inviaEmail = async (body) =>{
    const transporter = await create_trasporter()
    const mailOptions = {
        from: '"Babapapr.it" <poker@babapapr.it>',
        to: body.email,
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

app.post('/register', async (req, res) => {
    const { username, email } = req.body;
    console.log(body)

    if (!email.endsWith('@itis-molinari.eu')) {
        return res.status(400).json({ success: false, message: 'Email non valida.' });
    }
    
    const password = Math.random().toString(36).slice(-8);
    try {
        await database.register(username, email, password);
        inviaEmail(body);
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

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

app.post('/svuota', async (req, res) => {
    try {
        await database.svuota();
        res.json({ success: true, message: 'Database svuotato con successo.' });
    } catch (err) {
        console.error('Errore durante lo svuotamento:', err);
        res.status(500).json({ success: false, message: 'Errore nello svuotare il database.' });
    }
});


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
        for(let i = activeGames.length - 1; i >= 0; i--) {
            if (activeGames[i].player1 === username || activeGames[i].player2 === username) {
                activeGames.splice(i, 1);
            }
        }

        console.log('Utenti online:', onlineUsers);

        io.emit('update-users', Object.values(onlineUsers));
        io.emit('update-games', activeGames);

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
    let fromSocketId = null;
    for (const id in onlineUsers) {
        if (onlineUsers[id] === from) {
            fromSocketId = id;
            break;
        }
    }

    let turno = Math.floor(Math.random() * 2);
    if (fromSocketId) {
        lista = [fromSocketId, socket.id];
        activeGames.push({ player1: from, player2: to }); // Aggiungi la partita

        io.to(fromSocketId).emit('setup-game', { opponent: to, turno, lista });
        io.to(socket.id).emit('setup-game', { opponent: from, turno, lista });

        io.emit('update-games', activeGames); // Aggiorna la lista delle partite
        io.emit('update-users', Object.values(onlineUsers)); // Aggiorna la lista degli utenti
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





        console.log("lista", lista)


        console.log("turno", turno)

        console.log(destinationSocketId, lista[turno])



        if (lista[turno] == destinationSocketId) {

            io.to(lista[turno]).emit('start-game', { gridAlly, gridEnemy, turno, lista });

        }

        else {

            io.to(destinationSocketId).emit('update-ally', {gridAllySocket, gridEnemySocket});

        }

    });



    socket.on('update', ({ gridAlly, gridEnemy, turno, lista }) => {

        gridEnemySocket = gridEnemy

        gridAllySocket = gridAlly

        if (turno == 1) {

            io.to(lista[turno-1]).emit('update-ally', {gridAllySocket, gridEnemySocket});

        }

        else {

            io.to(lista[turno+1]).emit('update-ally', {gridAllySocket, gridEnemySocket});

        }

    });




    socket.on('turno-over', ({ gridAlly, gridEnemy, lista, turno }) => {
    let temp = gridEnemy;
    gridEnemy = gridAlly;
    gridAlly = temp;

    io.to(lista[turno]).emit('turno', { gridAlly, gridEnemy, turno, lista });
});




    socket.on('active-games', (data, callback) => {

        callback(activeGames);

    })

    socket.on('victory', ({ winner, lista }) => {
    const loser = lista.find(id => id !== socket.id);

    io.to(socket.id).emit('game-over', { message: `Complimenti ${winner}, hai vinto la battaglia!` });

    io.to(loser).emit('game-over', { message: `Mi dispiace, hai perso la battaglia contro ${winner}.` });

    for (let i = activeGames.length - 1; i >= 0; i--) {
        if (activeGames[i].player1 === winner || activeGames[i].player2 === winner) {
            activeGames.splice(i, 1);
        }
    }

    io.emit('update-games', activeGames);
    io.emit('update-users', Object.values(onlineUsers));
});

socket.on('utenti', (from, lista, turno) => {
    let destinationSocketId = null;

        for (const id in onlineUsers) {

            if (onlineUsers[id] === to) {

                destinationSocketId = id;

                break;

            }

        }
})



    socket.on('disconnect', () => {
        const invertito ={};
        for (const [chiave,valore] of Object.entries(onlineUsers)) {
            invertito[valore] = chiave;
        }
        for (let i = activeGames.length - 1; i >= 0; i--) {
            if(activeGames[i].player1 == onlineUsers[socket.id] || activeGames[i].player2 == onlineUsers[socket.id]) {
                if (activeGames[i].player1 == onlineUsers[socket.id]) {
                    console.log(invertito);
                    console.log(activeGames[i].player2);
                    console.log(activeGames[i].player1);
                    io.to(invertito[activeGames[i].player2]).emit('game-over', { message: `Hai vinto a tavolino!` });
                    activeGames.splice(socket.id, 1);
                }
                else if (activeGames[i].player2 == onlineUsers[socket.id]) {
                    console.log(invertito);
                    console.log(activeGames[i].player2);
                    console.log(activeGames[i].player1);
                    io.to(invertito[activeGames[i].player1]).emit('game-over', { message: `Hai vinto a tavolino!` });
                    activeGames.splice(socket.id, 1);
                }
        
            }        
        }
        delete onlineUsers[socket.id];
        console.log('Utenti online dopo disconnessione:', onlineUsers);
        io.emit('update-users', Object.values(onlineUsers)); // Aggiorna la lista degli utenti
        io.emit('update-games', activeGames); // Aggiorna la lista delle partite
    });

});



server.listen(conf.port, () => {

    console.log(`Server running on port ${conf.port}`);
});
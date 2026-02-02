const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    if (waitingPlayer) {
        const room = 'room_' + waitingPlayer.id + '_' + socket.id;
        socket.join(room);
        waitingPlayer.join(room);

        io.to(waitingPlayer.id).emit('init', { color: 'white', room: room });
        io.to(socket.id).emit('init', { color: 'black', room: room });
        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
        socket.emit('waiting', 'Esperando oponente...');
    }

    socket.on('move', (data) => {
        socket.to(data.room).emit('move', data.move);
    });

    socket.on('disconnect', () => {
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

// IMPORTANTE: Usar el puerto que nos asigne el entorno (Render)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

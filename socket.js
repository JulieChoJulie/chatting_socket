const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });

    app.set('io', io);
    const room = io.of('/room');
    const chat = io.of('/chat');

    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    room.on('connection', (socket) => {
        console.log('connect to room name space');
        socket.on('disconnect', () => {
            console.log('disconnect with room name space');
        });
    });

    chat.on('connection', (socket) => {
        console.log('connect to chat name space');
        const req = socket.request;
        const { headers: { referer } } = req;
        // roomId =>URL = socket.request.headers.referer
        const roomId = referer
            .split('/')[referer.split('/').length -1]
            .replace(/\?.+/, '');
        socket.join(roomId);
        socket.to(roomId).emit('join', {
            occup: socket.adapter.rooms[roomId].length,
            user: 'system',
            chat: `${req.session.color} is entered.`,
        });
        socket.on('disconnect', () => {
            console.log('disconnect with chat name space');
            socket.leave(roomId);
            const currentRoom = socket.adapter.rooms[roomId];
            const userCount = currentRoom ? currentRoom.length : 0;

            if (userCount === 0) {
                axios.delete(`http://localhost:8005/room/${roomId}`)
                    .then(()=> {
                        console.log('Successfully deleted the room');
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                socket.to(roomId).emit('exit', {
                    occup: socket.adapter.rooms[roomId].length,
                    user: 'system',
                    chat: `${req.session.color} exits the room.`,
                });
            }
        });
    });
};
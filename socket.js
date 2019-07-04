const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = SocketIO(server, { path: '/socket.io' });

    app.set('io', io);
    const room = io.of('/room');
    const chat = io.of('/chat');

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
        const roomId = referer
            .split('/')[referer.split('/').length -1]
            .replace(/\?.+/, '');
        socket.join(roomId);
        socket.on('disconnect', () => {
            console.lg('disconnect with chat name space');
            socket.leave(roomId);
        });
    });

};
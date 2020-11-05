const io = require("socket.io");
const server = io.listen(3000);

const myMessages = [];

server.on('connection', (socket) => {
    socket.on('send-message', (data) => {
        myMessages.push(data);
        socket.emit('text-event', myMessages);
        socket.broadcast.emit('text-event', myMessages);
    });
});

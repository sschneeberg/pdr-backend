//imports and set up
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const socketio = require('socket.io');

const app = express();
const httpServer = require('http').createServer(app);
const io = socketio(httpServer, { cors: { origin: '*' } });
const chatRooms = require('./api/middleware/chatRooms');

const port = process.env.PORT || 8000;

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(passport.initialize());
require('./config/passport')(passport);

//routes
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Connected to backend' });
});

//controllers
app.use('/api/users', require('./api/users'));
app.use('/api/tickets', require('./api/tickets'));
app.use('/api/dashboard', require('./api/dashboard'));
app.use('/api/company', require('./api/company'));

//chat
io.on('connection', (client) => {
    console.log('connect');
    let room = '';
    let permissions = '';
    client.on('join-company', (company, id, permissions) => {
        room = company;
        if (permissions === 'dev' || permissions === 'admin') {
            chatRooms[room] ? chatRooms[room]++ : (chatRooms[room] = 1);
        }
        client.join(room);
        client.emit('joined-room', chatRooms[room]);
    });
    client.on('send-message', (msg) => {
        client.to(room).emit('sent-message', msg);
    });

    client.on("statusUpdated", (info) => {
        //listens for status update from devHome and transmits the message to userHome
        client.broadcast.emit("statusUpdated", info)
    });

    client.on('disconnecting', () => {
        console.log('disconnecting');
        if (permissions === 'dev' || permissions === 'admin') {
            chatRooms[room] ? chatRooms[room]-- : delete chatRooms[room];
        }
    });
});

httpServer.listen(port, console.log(`listening on port ${port}`));

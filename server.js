//imports and set up
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const socketio = require('socket.io');

const app = express();
const httpServer = require('http').createServer(app);
const io = socketio(httpServer, { cors: { origin: '*' } });

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
    let room = '';
    console.log('connected');
    client.on('join-company', (company, id) => {
        console.log('company joined: ', company, id);
        room = company;
        client.join(room);
    });
    client.on('send-message', (msg) => {
        client.to(room).emit('sent-message', msg);
    });
});

httpServer.listen(port, console.log(`listening on port ${port}`));

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
//app.use('/api/chat', require('./api/chat'));

//chat - move to own file once working
io.on('connection', (client) => {
    console.log('connected');
});

httpServer.listen(port, console.log(`listening on port ${port}`));

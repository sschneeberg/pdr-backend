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
    let room = '';
    client.on('join-company', (company, permissions) => {
        //company channel: should be admins and devs only
        room = company;
        console.log('ROOM', room);
        if (permissions === 'dev' || permissions === 'admin') {
            client.join(company);
        }
    });
    client.on('support-available', (company, id, permissions) => {
        if (permissions === 'dev' || permissions === 'admin') {
            //record connection in company rooms map
            chatRooms[company] ? chatRooms[company].push(id) : (chatRooms[company] = [id]);
        }
    });

    client.on('statusUpdated', (info) => {
        //listens for status update from devHome and transmits the message to userHome
        client.broadcast.emit('statusUpdate', info);
    });

    client.on('disconnecting', () => {
        console.log('disconnecting');
    });

    client.on('support-unavailable', (company, id, permissions) => {
        if (permissions === 'dev' || permissions === 'admin') {
            //remove connection from company rooms map
            chatRooms[company] = chatRooms[company].filter((member) => {
                return member !== id;
            });
        }
    });

    client.on('company-connect', (company) => {
        //customer reaches out to company
        let socket = '';
        if (chatRooms[company] && chatRooms[company].length > 0) {
            //assign a support member to the customer
            //LATER: make this a better algorithm to ensure no one rep gets overwhelmed
            let index = Math.floor(Math.random() * chatRooms[company].length);
            console.log('SOCKET', chatRooms[company][index]);
            socket = chatRooms[company][index];
            console.log(socket);
            client.emit('company-connected', chatRooms[company].length, socket);
        } else {
            client.emit('company-connected', 0, socket);
        }
    });

    client.on('send-message', (msg, supportSocket, customerSocket, username) => {
        console.log(supportSocket);
        if (!supportSocket) {
            //this is a company chat message
            console.log('sent');
            client.to(room).emit('sent-company-message', msg);
        } else {
            //this is a customer to support message
            console.log('message sent');
            client.to(supportSocket).emit('sent-customer-message', msg.text, customerSocket, username);
        }
    });

    client.on('send-support-message', (msg, customerSocket) => {
        //this is a support to customer message
        client.to(customerSocket).emit('sent-support-message', msg);
    });

    client.on('end-chat', (customerSocket) => {
        client.to(customerSocket).emit('chat-closed');
    });
});

httpServer.listen(port, console.log(`listening on port ${port}`));

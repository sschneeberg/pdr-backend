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
    client.on('join-company', (company, permissions) => {
        //company channel: should be admins and devs only
        room = company;
        if (permissions === 'dev' || permissions === 'admin') {
            client.join(company);
        }
    });
    client.on('support-available', (company, id, permissions) => {
        if (permissions === 'dev' || permissions === 'admin') {
            //record connection in company rooms map
            chatRooms[company]
                ? chatRooms[company].push({ socektId: id, chats: 0 })
                : (chatRooms[company] = [{ socketId: id, chats: 0 }]);
            console.log(chatRooms[company]);
        }
    });
    client.on('support-unavailable', (company, id, permissions) => {
        if (permissions === 'dev' || permissions === 'admin') {
            //remove connection from company rooms map
            chatRooms[company] = chatRooms[company].filter((member) => {
                return member.socketId !== id;
            });
            console.log(chatRooms[company]);
        }
    });
    client.on('company-connect', (company) => {
        //customer reaches out to company
        let socket = '';
        if (chatRooms[company]) {
            //assign a support member to the customer
            //LATER: make this a better algorithm to ensure no one rep gets overwhelmed
            let index = Math.floor(Math.random() * chatRooms[company].length);
            socket = chatRooms[company][index].socketId;
            chatRooms[company][index].chats += 1;
            client.emit('company-connected', chatRooms[company].length, socket);
        } else {
            client.emit('company-connected', 0, socket);
        }
    });

    client.on('send-message', (msg, supportSocket, customerSocket) => {
        if (!supportSocket) {
            //this is a company chat message
            client.to(room).emit('sent-company-message', msg);
        } else {
            //this is a customer to support message
            client.to(supportSocket).emit('sent-customer-message', msg, customerSocket);
        }
    });
    client.on('send-support-message', (msg, customerSocket) => {
        //this is a support to customer message
        client.to(customerSocket).emit('sent-support-message', msg);
    });
});

httpServer.listen(port, console.log(`listening on port ${port}`));

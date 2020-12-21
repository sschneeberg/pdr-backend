const db = require('../models');

db.Ticket.insertMany([
    {
        title: 'Test Bug',
        company: 'Test Company 1',
        product: 'website 1',
        desdcription: 'This is a seed ticket created for testing purposes',
        createdBy: 'customer@email.com'
    },
    {
        title: 'Another Bug',
        company: 'Test Company 2',
        product: 'Desktop App',
        desdcription: 'This is a seed bug created for testing purposes',
        createdBy: 'customer@email.com',
        assignedTo: 'jsmith@company2.com',
        priority: '3',
        status: 'Under Review'
    }
]);

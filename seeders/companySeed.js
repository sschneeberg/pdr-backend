const db = require('../models');

//Run this file after grabbing ids from created users

db.Company.insertMany([
    {
        name: 'Test Company 1',
        products: ['Website 1', 'Website 2'],
        roles: { admin: [''], dev: ['', ''] }
    },
    {
        name: 'Test Company 2',
        products: ['Desktop App'],
        roles: { admin: ['', ''], dev: '' }
    }
]);

const db = require('../models');
const { v4: uuidv4 } = require('uuid');

db.Company.insertMany([
    {
        name: 'Test Company 1',
        products: ['Website 1', 'Website 2'],
        roles: { admin: ['jsmith@company1.com'], dev: ['jdoe@company1.com', 'jschmoe@company1.com'] },
        companyKey: uuidv4()
    },
    {
        name: 'Test Company 2',
        products: ['Desktop App'],
        roles: { admin: ['mjane@company2.com', 'banne@company2.com'], dev: '' },
        companyKey: uuidv4()
    }
]);

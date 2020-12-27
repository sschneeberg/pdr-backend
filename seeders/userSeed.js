const db = require('../models');
const bcrypt = require('bcryptjs');

let testUserPassword = '';

bcrypt.genSalt(10, (error1, salt) => {
    if (error1) console.log(error1);
    bcrypt.hash('password', salt, (error2, hash) => {
        if (error2) console.log(error2);
        testUserPassword = hash;
        db.User.insertMany([
            {
                username: 'John Smith',
                email: 'jsmith@company1.com',
                password: testUserPassword,
                permissions: 'admin',
                company: 'Test Company 1'
            },
            {
                username: 'Joe Schmoe',
                email: 'jschmoe@company1.com',
                password: testUserPassword,
                permissions: 'dev',
                company: 'Test Company 1'
            },
            {
                username: 'Jane Doe',
                email: 'jdoe@company1.com',
                password: testUserPassword,
                permissions: 'dev',
                company: 'Test Company 1'
            },
            {
                username: 'Betty Anne',
                email: 'banne@company2.com',
                password: testUserPassword,
                permissions: 'admin',
                company: 'Test Company 2'
            },
            {
                username: 'Mary Jane',
                email: 'mjane@company2.com',
                password: testUserPassword,
                permissions: 'admin',
                company: 'Test Company 2'
            },
            {
                username: 'John Smith',
                email: 'jsmith@company2.com',
                password: testUserPassword,
                permissions: 'dev',
                company: 'Test Company 2'
            },
            {
                username: 'Customer User',
                email: 'customer@email.com',
                password: testUserPassword
            }
        ]);
    });
});

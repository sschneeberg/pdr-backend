const models = require('./models');

models.User.find().then((users) => {
    console.log('USERS ------------------------------');
    console.log(users);
});

models.User.findOne().then((user) => {
    console.log('USERS ------------------------------');
    console.log(user.permissions);
    console.log(user.email);
    console.log(user.company);
});

models.Company.find().then((company) => {
    console.log('COMPANY ------------------------------');
    console.log(company);
});

models.Company.findOne().then((company) => {
    console.log('COMPANY DETAILS ------------------------------');
    console.log(company.name);
    console.log(company.products);
    console.log(company.companyKey);
    console.log(company.roles);
});

models.Ticket.find().then((tickets) => {
    console.log('TICKETS ------------------------------');
    console.log(tickets);
});

models.Ticket.findOne().then((ticket) => {
    console.log('TICKETS ------------------------------');
    console.log(ticket.title);
    console.log(ticket.company);
    console.log(ticket.product);
    console.log(ticket.description);
    console.log(ticket.createdAt);
    console.log(ticket.createdBy);
});

models.Comment.findOne().then((comment) => {
    console.log('COMMENTS ------------------------------');
    console.log(comment.ticket);
    console.log(comment.comment);
    console.log(comment.commentBy);
    console.log(comment.createdAt);
    models.Ticket.findOne({ _id: `${comment.ticket}` }).then((ticket) => {
        console.log('COMMENT -> TICKET ------------------------------');
        console.log(ticket);
    });
});

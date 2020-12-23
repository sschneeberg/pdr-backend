# pdr-backend

Pest Damage Repcode .
ort: MERN Stack Bug Tracker App (Backend Repository)

## ROUTES

-   GET /api/tickets/companies (Public) -- Get list of all companies and a map to their products
-   GET /api/tickets/:id/comments (Private) where id is a ticket id -- Get all comments related to a specific ticket
-   GET /api/tickets/:id (Private) where id is ticket id -- Get all ticket info for a specific ticket
-   GET api/users/current (Private) -- Get current user's login information and permissions
-   GET api/dashboard (private) -- Get all information for customer or dev dashboard
-   GET api/dashboard/admin-dashboard (private admin) -- Get all information for admin dashboard

-   POST api/users/login (Public) -- login
-   POST api/users/register (Public) -- create customer user account
-   POST api/users/register-company (Public) -- create an admin or dev account with a new or existing company
-   POST api/tickets (Public) -- create tickets
-   POST api/tickets/:id/comments (Private) where id is ticket id -- create comment on ticket

-   PUT /api/tickets/:id (Private) where id is ticket id -- update assignedTo and priority (admin only) or status (admin or dev)
-   PUT /api/users/:id (Private) where id is user id -- update email, password, or username (any user)
-   PUT /api/users/permissions/:id (Private) where id is user id -- update company member's permissions (admin only)

-   DELETE /api/company (Private) -- delete company user belongs to and all it's users (admin only)
-   DELETE /api/user/:id (Private) where id is user id -- delete user account
-   DELETE /api/tickets/:id/comments (Private) where id is comment id-- deletes comment by id (admin only)


## Schema's Used

This schema is embedded with assigned admin and dev roles for the comapny. Super simple, right?!

```js
const roleSchema = new Schema({
    admin: [{ type: String }],
    dev: [{ type: String }]
});

const companySchema = new Schema({
    name: { type: String, unique: true },
    products: [{ type: String }],
    roles: [roleSchema],
    companyKey: { type: String }
});
```

This schema covers the basic requirements for a user. The permissions have several checks and can be 'dev' or 'admin'. Regular consumers are not assigned a role.

```js
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be at least 8 characters']
    },
    permissions: { type: String },
    company: [{ type: String }]
});
```

Here is the ticket Schema. The only thing required is a description of the bug, however, half the ticket is updated by an admin or dev later on in the reporting process. 

```js
const ticketSchema = new Schema({
    title: {
        type: String,
        maxLength: [20]
    },
    assignedTo: [{ type: String }],
    company: { type: String },
    product: { type: String },
    picture: { type: String },
    description: {
        type: String,
        minLength: [30, 'Please include a detailed description'],
        required: true
    },
    priority: { type: Number },
    status: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdBy: { type: String }
});
```
Lastly, the comment Schema! These comments are left on tickets for communication about buggy details between dev, admin, and consumers that are tracking their reported bugs. Fun! 

```js
const commentSchema = new Schema({
    ticket: {type: String},
    comment: {type: String},
    commentBy: {type: String},
    createdAt: {
        type: Date,
        default: new Date()
    },
})
```

# pdr-backend

Pest Damage Repcode .
ort: MERN Stack Bug Tracker App (Backend Repository)

## ROUTES

| Method | Route                         | Access                 | Description                                                                       |
| ------ | ----------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| GET    | /api/tickets/companies        | Public                 | Get list of all companies and a map to their products                             |
| GET    | /api/tickets/:id/comments     | Private                | Get all comments related to a specific ticket (:id is a Ticket id)                |
| GET    | /api/tickets/:id              | Private                | Get all ticket info for a specific ticket (:id is a Ticket id)                    |
| GET    | api/dashboard                 | Private                | Get all information for customer or dev dashboard                                 |
| GET    | api/dashboard/admin-dashboard | Private (Admin Only)   | Get all information for admin dashboard                                           |
| GET    | api/users/:id                 | Private                | Get user information (:id is a User id)                                           |
| GET    | api/company                   | Private (Admin Only)   | Get company key                                                                   |
| POST   | api/users/login               | Public                 | Login a user                                                                      |
| POST   | api/users/reset               | Public                 | Reset Password                                                                    |
| POST   | api/users/register            | Public                 | Create customer user account                                                      |
| POST   | api/users/register-company    | Public                 | Create an admin or dev account with a new or existing company                     |
| POST   | api/tickets                   | Public                 | Create tickets                                                                    |
| POST   | api/tickets/:id/comments      | Private                | Create comment on ticket (:id is a Ticket id)                                     |
| PUT    | /api/tickets/:id              | Private (Admin or Dev) | Update assignedTo and priority (Admin) or status (Admin/Dev) (:id is a Ticket id) |
| PUT    | /api/users/:id                | Private                | Update user email, password, or username (:id is a User id)                       |
| PUT    | /api/users/permissions/:id    | Private (Admin only)   | Update company member's permissions                                               |
| DELETE | /api/company                  | Private (Admin only)   | Delete the company user belongs to and all it's users                             |
| DELETE | /api/users/:id                | Private                | Delete user account (:id is a User id)                                            |
| DELETE | /api/tickets/:id/comments     | Private (Admin only)   | Deletes comment by id                                                             |

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
    companyKey: { type: String, default: uuidv4(); }
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

Here is the ticket Schema. The only thing required is a description of the bug, however, half the ticket is updated by an admin or dev later on in the reporting process. Priority is stored at a number but corresponds to Low, Medium, High, and Critical on the front end. Similarly, Status is a number that corresponds to New, In Progress, and Closed.

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
    status: { type: Number, default: 1 },
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
    ticket: { type: String },
    comment: { type: String },
    commentBy: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
});
```

# pdr-backend

Pest Damage Report: MERN Stack Bug Tracker App (Backend Repository)

## ROUTES

-   GET /api/tickets/companies (Public) -- Get list of all companies and a map to their products
-   GET /api/tickets/:id/comments (Private) where id is a ticket id -- Get all comments related to a specific ticket
-   GET /api/tickets/:id (Private) where id is user id -- Get all tickets for a specific user
-   GET api/users/current (Private) -- Get current user's login information and permissions
-   GET api/dashboard (private) -- Get all information for customer or dev dashboard
-   GET api/dashboard/admin-dashboard (private admin) -- Get all information for admin dashboard

-   POST api/users/login (Public)
-   POST api/users/register (Public)

```js
const roleSchema = new roleSchema({
    admin: [{ type: String }],
    dev: [{ type: String }]
});

// drop down bar to select companies in our DB
// radio choice of "register a company" or "join with a company"
// register company checks for existing company and generates and sends a key
// by default they should be an admin under that "register a compay" email provided
// UUID for companyKey to create unique key for that company
const companySchema = new companySchema({
    name: { type: String, unique: true },
    products: [{ type: String }],
    roles: [roleSchema],
    companyKey: { type: String }
});

// check username in company roles before creation
// permissions dropdown options [consumer, dev, admin]
const userSchema = new userSchema({
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

//dropdown for status for series of vals "completed", "received", "in progress", etc.
// assignTo --> admin assigns ---> dev
// store dev email in assigned to
// grab dev email when admin assigns a dev
// createdBy is the user's email that made the bug report
// priority status is a dropdown ADMIN selects after receiving the ticket
// dropdown is a string of priorities FOR ADMIN (Low, Med, High, Critical), but its a number to parse on backend
// product and company are dropdown (multiform)
// picutre and desc is multiform
const ticketSchema = new ticketSchema({
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

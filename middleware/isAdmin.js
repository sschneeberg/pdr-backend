module.exports = (req, res, next) => {
    if (req.user.permissions === 'admin') {
        next();
    } else {
        res.json({ msg: 'You do not have permissions to access this page' });
    }
};

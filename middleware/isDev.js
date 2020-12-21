module.exports = (req, res, next) => {
    if (req.user.permission !== 'dev') {
        res.json({ msg: 'You do not have permissions to access this page' });
    } else {
        next();
    }
};

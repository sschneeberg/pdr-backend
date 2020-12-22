module.exports = (req, res, next) => {
    if (req.user.permissions === "Admin") {
        next()
    } else {
        res.json({msg: "Not an admin!"})
        res.redirect("/")
    }
}
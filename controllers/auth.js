const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateHeaderName } = require("http");

//Créer un nouvelle utilisateur signup
exports.signup = (req, res) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
    User.save().then(() => res.status(201).json({ message: "Utilisateur crée !"})).catch((error) => res.status(400).json({ error}));
    })
    .catch((error) => res.status(500).json({ error }));
};

//Créer une connexion avec login 
exports.login = (req, res) => {
    User.findOne({ email: req.body.email })
   .then((user) => {
    if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé"});
}
bcrypt 
.compare(req.body.password, user.password)
.then((valid) => {
    if (!valid) {
        return res.status(401).json({ error: "Mot de passe incorrect"});
}
res.status(200).json({
    userId: user._id, 
    token: jwt.sign({ userId: user._id}, process.env. JWT_SECRET, {
        expiresIn: '24h'
    })
});
})
.catch((error) => res.status(500).json({ error}));
})
.catch((error) => res.status(500).json({ error}));
};
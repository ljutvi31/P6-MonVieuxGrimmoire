const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];  // Récupère le token du header
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');  // Décode le token
        const userId = decodedToken.userId;  // Extrait l'ID utilisateur
        req.auth = {  // Ajoute l'ID à l'objet requête
            userId: userId
        };
        next();  // Passe au middleware suivant
    } catch(error) {
        res.status(401).json({ error });  // Erreur si token invalide
    }
};
// Importation de la bibliothèque jsonwebtoken pour gérer les tokens
const jwt = require('jsonwebtoken');

// Middleware d'authentification
module.exports = (req, res, next) => {
  try {
    // Vérification de la présence du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Autorisation du HEADERS absent!" });
    }

    // Récupération et vérification du token
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Utilisation d'une clé secrète sécurisée

    // Ajout de l'ID utilisateur à l'objet req
    req.auth = {
      userId: decodedToken.userId,
    };
    next(); // Poursuite de la chaîne de middleware
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré !", error });
  }
};

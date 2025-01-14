require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");

//importation des routes 
const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");

const app = express();

//Connexion sur MongoDB
mongoose.set("strictQuery", true); //Activation de strict query
mongoose.connect(process.env.MONGODBD_URI)
.then(() => console.log("Connecté à MongoDB!"))
.catch((error) => console.error("Connexion à MongoDB échouée!", error));

//Parse le JSON
app.use(express.json());
//Middleware Helmet pour sécuriser les en-tête HTTP
app.use(helmet());

//Middleware pour gérer le CroosOriginRessourcesSharing 
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); //Autorise uniquement les requête venant du localhost3000 et seul le FE peut communiquer avec API
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    next();
}); 

//Gestion des ressources statiques 
app.use("/images", express.static(path.join(__dirname, "images")));

//Routes
app.use("/api/auth", authRoutes); 
app.use("/api/books", booksRoutes) ;

//Routes de test 
app.use("/api/test", (req, res) => {
    res.json({ message: "Test d'API réussi!" });
});

module.exports = app;
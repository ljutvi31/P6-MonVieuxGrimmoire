const Book = require("../models/Book");
const fs = require("fs");
const path = require("path");

// POST : Enregistrer un nouveau livre
exports.createBook = (req, res, next) => {
    console.log("File:", req.file); // Log pour vérifier si le fichier est présent
    console.log("Body:", req.body); // Log pour vérifier le contenu du body
    try {
        if (!req.file) {
            throw new Error("Image requise");
        }
        // Valider et parser l'objet book
        const bookObject = JSON.parse(req.body.book);
        console.log("Parsed bookObject:", bookObject); // Log pour valider le JSON
        delete bookObject._id; // Supprimer des champs non nécessaires
        delete bookObject._userId;
        // Création de l'objet livre
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
            averageRating: 0,
            ratings: [],
        });
        // Sauvegarde dans la base de données
        book.save()
            .then(() => res.status(201).json({ message: "Livre enregistré !" }))
            .catch((error) => {
                console.error("Erreur save:", error);
                res.status(400).json({ error });
            });
    } catch (error) {
        console.error("Erreur création:", error);
        res.status(400).json({ error: error.message || "Données invalides ou image manquante" });
    }
};

// PUT : Modifier un livre existant
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
        : { ...req.body };
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "Non autorisé" });
            }
            // Supprimer l'ancienne image si une nouvelle est fournie
            if (req.file && book.imageUrl) {
                const filename = path.join("images", book.imageUrl.split("/images/")[1]);
                fs.unlink(filename, (err) => {
                    if (err) console.error("Erreur suppression ancienne image:", err);
                });
            }
            // Mise à jour du livre
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Livre modifié !" }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(404).json({ error: "Livre non trouvé" }));
};

// DELETE : Supprimer un livre
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "Non autorisé" });
            }
            const filename = path.join("images", book.imageUrl.split("/images/")[1]);
            fs.unlink(filename, () => {
                Book.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Livre supprimé !" }))
                    .catch((error) => res.status(400).json({ error }));
            });
        })
        .catch((error) => res.status(404).json({ error: "Livre non trouvé" }));
};

// GET : Récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error: "Livre non trouvé" }));
};

// GET : Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};

// GET : Récupérer les 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) // Tri par note moyenne décroissante
        .limit(3) // Limite aux 3 premiers résultats
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

// POST pour noter un livre
exports.rateBook = (req, res, next) => {
    // Vérification de la note entre 0 et 5
    if (req.body.rating < 0 || req.body.rating > 5) {
        return res.status(400).json({ message: "La note doit être comprise entre 0 et 5" });
    }

    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifier si l'user a déjà noté ce livre
            if (book.ratings.find(rating => rating.userId === req.auth.userId)) {
                return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
            }

            // Ajouter la nouvelle note
            const newRating = {
                userId: req.auth.userId,
                grade: req.body.rating
            };
            
            book.ratings.push(newRating);

            // Calculer la nouvelle moyenne
            const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = Number((totalRatings / book.ratings.length).toFixed(1));

            // Sauvegarder les modifications
            return book.save();
        })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};
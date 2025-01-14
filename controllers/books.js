const Book = require("../models/Book");
const fs = require("fs");

// POST : Enregistrer un nouveau livre
exports.createBook = (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book); // Récupérer les données du livre
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId, // Ajouter l'utilisateur connecté
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Construire l'URL de l'image
    });

    book
      .save()
      .then(() => res.status(201).json({ message: "Livre enregistré !" }))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    res.status(400).json({ error: "Données invalides ou image manquante" });
  }
};

// PUT : Modifier un livre existant
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book), // Si une nouvelle image est uploadée
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body }; // Si pas d'image, utiliser les données envoyées

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Non autorisé" });
      }

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

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
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

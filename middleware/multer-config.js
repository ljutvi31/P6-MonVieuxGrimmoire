// Importation des packages nécessaires
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Types de fichiers acceptés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Dossier cible pour les images
  },
  filename: (req, file, callback) => {
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('_')
      .replace(/[^a-z0-9._-]/g, ''); // Nettoyage du nom du fichier
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + '_' + Date.now() + '.' + extension); // Nom unique
  },
});

// Middleware Multer avec filtre MIME et limite de taille
const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // Limite à 4 Mo
  fileFilter: (req, file, callback) => {
    if (!MIME_TYPES[file.mimetype]) {
      return callback(new Error('Format non supporté. Utilisez JPG, PNG ou WebP.'));
    }
    callback(null, true);
  },
}).single('image');

// Middleware de traitement des images avec Sharp
const processImage = async (req, res, next) => {
  if (!req.file) return next(); // Pas de fichier à traiter

  const filePath = req.file.path; // Chemin de l'image originale
  const newFilePath = path.join('images', `optimized_${req.file.filename}`); // Chemin optimisé

  try {
    // Redimensionne et optimise l'image
    await sharp(filePath)
      .resize(800, 800, { fit: 'inside' }) // Dimensions max
      .webp({ quality: 80 }) // Convertit en WebP
      .toFile(newFilePath); // Sauvegarde l'image optimisée

    // Supprime l'image originale
    fs.unlinkSync(filePath);

    // Met à jour le chemin du fichier dans la requête
    req.file.path = newFilePath;
    req.file.filename = `optimized_${req.file.filename}`;
    next();
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image :', error);
    next(error);
  }
};

// Exporte les middlewares sous forme de tableau
module.exports = [upload, processImage];

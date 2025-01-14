// Import des packages nécessaires
const multer = require('multer');
const sharp = require('sharp');

// Définition des types de fichiers images acceptés
const MIME_TYPES = {
   'image/jpg': 'jpg',
   'image/jpeg': 'jpg',
   'image/png': 'png',
   'image/webp': 'webp'
};

// Configuration du stockage des fichiers avec multer
const storage = multer.diskStorage({
   // Définit le dossier de destination des images
   destination: (req, file, callback) => {
       callback(null, 'images');
   },
   // Génère un nom de fichier unique et sécurisé
   filename: (req, file, callback) => {
       // Nettoie et formate le nom du fichier
       const name = file.originalname
           .toLowerCase() // Met en minuscules
           .split(' ').join('_') // Remplace les espaces par des _
           .replace(/[^a-z0-9._-]/g, ''); // Supprime les caractères spéciaux
       const extension = MIME_TYPES[file.mimetype];
       // Crée un nom unique avec timestamp
       callback(null, name + Date.now() + '.' + extension);
   }
});

// Configuration de multer avec les restrictions
const upload = multer({
   storage: storage, // Utilise la configuration de stockage définie
   limits: { 
       fileSize: 4 * 1024 * 1024 // Limite la taille des fichiers à 4MB
   },
   // Filtre les types de fichiers
   fileFilter: (req, file, callback) => {
       if (!MIME_TYPES[file.mimetype]) {
           return callback(new Error('Format non supporté. Utilisez JPG, PNG ou WebP'));
       }
       callback(null, true);
   }
}).single('image'); // Accepte un seul fichier avec le champ 'image'

// Middleware d'optimisation des images avec Sharp
const optimizeImage = async (req, res, next) => {
   // Continue si pas de fichier
   if (!req.file) return next();
   
   try {
       // Optimise l'image
       await sharp(req.file.path)
           .resize(800, 800, { fit: 'inside' }) // Redimensionne l'image
           .webp({ quality: 80 }) // Convertit en WebP avec qualité 80%
           .toFile(`${req.file.path}.webp`); // Sauvegarde la nouvelle image
       // Met à jour le nom du fichier
       req.file.filename = req.file.filename + '.webp';
       next();
   } catch (error) {
       next(error);
   }
};

// Exporte les middlewares dans l'ordre d'exécution
module.exports = [upload, optimizeImage];
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Types MIME supportés
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

// Création du dossier images s'il n'existe pas
const createImagesFolder = () => {
    const dir = "images";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

createImagesFolder();

// Configuration Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.')[0];
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
}); 

// Middleware Multer avec vérifications
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024, // Limite à 4MB
    },
    fileFilter: (req, file, callback) => {
        if (!MIME_TYPES[file.mimetype]) {
            return callback(new Error("Format de fichier non supporté. Utilisez JPG, PNG ou WebP."));
        }
        callback(null, true);
    }
}).single('image');

// Middleware Sharp pour optimiser l'image
const processImage = (req, res, next) => {
    if (!req.file) return next();

    const filePath = req.file.path;
    const fileName = `resized_${req.file.filename}`;
    const outputPath = path.join('images', fileName);

    sharp(filePath)
        .resize({
            width: 412,
            height: 520,
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy,
            withoutEnlargement: true
        })
        .webp({ 
            quality: 90,
            effort: 6
        })
        .toFile(outputPath)
        .then(() => {
            fs.unlink(filePath, () => {
                req.file.filename = fileName;
                req.file.path = outputPath;
                next();
            });
        })
        .catch(error => {
            console.error("Erreur lors du traitement de l'image :", error);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            next(error);
        });
};

module.exports = {
    upload: upload,
    resizeImage: processImage
};
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Types MIME supportés
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
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
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const name = file.originalname
            .toLowerCase()
            .split(" ")
            .join("_")
            .replace(/[^a-z0-9._-]/g, "");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + "_" + Date.now() + "." + extension);
    },
});

// Middleware Multer avec vérifications
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Limite à 2MB
    },
    fileFilter: (req, file, callback) => {
        if (!MIME_TYPES[file.mimetype]) {
            return callback(new Error("Format de fichier non supporté. Utilisez JPG, PNG ou WebP."));
        }
        callback(null, true);
    },
}).single("image");

// Middleware Sharp pour optimiser l'image
const processImage = (req, res, next) => {
    if (!req.file) return next();

    const filePath = req.file.path;
    const optimizedFilePath = path.join(
        "images",
        "optimized_" + req.file.filename
    );

    sharp(filePath)
        .resize(800, 800, { fit: "inside" }) // Redimensionne tout en gardant les proportions
        .webp({ quality: 80 }) // Convertit en WebP pour une meilleure compression
        .toFile(optimizedFilePath)
        .then(() => {
            // Supprime l'image originale
            fs.unlink(filePath, () => {
                req.file.path = optimizedFilePath;
                req.file.filename = "optimized_" + req.file.filename;
                next();
            });
        })
        .catch(error => {
            // En cas d'erreur, nettoie les fichiers
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(optimizedFilePath)) fs.unlinkSync(optimizedFilePath);
            next(error);
        });
};

module.exports = [upload, processImage];
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

// Configuration Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const dir = path.resolve("images");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Crée le dossier s'il n'existe pas
        }
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const name = file.originalname
            .toLowerCase()
            .split(" ")
            .join("_")
            .replace(/[^a-z0-9._-]/g, ""); // Nettoie le nom du fichier
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + "_" + Date.now() + "." + extension); // Génère un nom unique
    },
});

// Middleware Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // Limite à 4 Mo
    fileFilter: (req, file, callback) => {
        console.log("File received in multer:", file); // Log pour vérifier le fichier
        if (!MIME_TYPES[file.mimetype]) {
            return callback(new Error("Format non supporté. Utilisez JPG, PNG ou WebP."));
        }
        callback(null, true);
    },
}).single("image");

// Middleware Sharp pour optimiser l'image
const processImage = async (req, res, next) => {
    if (!req.file) return next(); // Pas d'image à traiter

    const filePath = req.file.path;
    const optimizedFilePath = path.join("images", `optimized_${req.file.filename}`);

    try {
        await sharp(filePath)
            .resize(800, 800, { fit: "inside" }) // Dimensions max
            .webp({ quality: 80 }) // Convertit en WebP
            .toFile(optimizedFilePath);

        fs.unlinkSync(filePath); // Supprime l'image originale

        req.file.path = optimizedFilePath; // Met à jour le chemin du fichier
        req.file.filename = `optimized_${req.file.filename}`;
        next();
    } catch (error) {
        console.error("Erreur traitement image:", error);
        next(error);
    }
};

// Exporte les middlewares
module.exports = [upload, processImage];

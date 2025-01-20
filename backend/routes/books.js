const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multerConfig = require("../middleware/multer-config");
const booksCtrl = require("../controllers/books");

// IMPORTANT : L'ordre des routes est crucial
// Les routes spécifiques doivent être placées avant les routes dynamiques (:id)

// Routes publiques
router.get("/", booksCtrl.getAllBooks);
// Cette route doit être AVANT /:id
router.get("/bestrating", booksCtrl.getBestRating);
router.get("/:id", booksCtrl.getOneBook);

// Routes protégées
router.post("/", auth, multerConfig.upload, multerConfig.resizeImage, booksCtrl.createBook);
router.put("/:id", auth, multerConfig.upload, multerConfig.resizeImage, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.post("/:id/rating", auth, booksCtrl.rateBook);

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multerConfig = require("../middleware/multer-config");
const booksCtrl = require("../controllers/books");

// Routes
router.get("/", booksCtrl.getAllBooks);
router.get("/:id", booksCtrl.getOneBook);
router.get("/bestrating", booksCtrl.getBestRating);
router.post("/", auth, ...multerConfig, booksCtrl.createBook);
router.post("/:id/rating", auth, booksCtrl.rateBook);
router.put("/:id", auth, ...multerConfig, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
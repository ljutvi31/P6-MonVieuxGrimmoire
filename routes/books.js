const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const booksCtrol = require("../controllers/books");

//Logique routes books
router.get("/", booksCtrl.getAllBooks);
router.post("/", auth, multer, booksCtrl.createBooks);
router.get("/:id", booksCtrl.getOneBook);
router.put("/:id", auth, multer, booksCtrl.modifyBook);
route.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
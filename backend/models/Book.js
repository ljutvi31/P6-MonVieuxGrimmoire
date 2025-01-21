const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { 
        type: Number, 
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{4}$/.test(value.toString()) && value <= new Date().getFullYear();
            },
            message: "L'année doit être un nombre à 4 chiffres et ne pas dépasser l'année courante"
        }
    },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { 
                type: Number, 
                required: true,
                min: [0, 'La note minimum est 0'],
                max: [5, 'La note maximum est 5']
            }
        }
    ],
    averageRating: { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);
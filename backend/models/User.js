const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Veuillez entrer un email valide'], // Regex plus stricte pour la validation d'email comme suggéré par le mentor
        validate: {
            validator: function(value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Veuillez entrer une adresse email valide.'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Le mot de passe doit contenir au moins 6 caractères'] // Ajout d'une validation de longueur minimale pour plus de sécurité
    }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
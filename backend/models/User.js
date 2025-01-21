const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [emailRegex, 'Email invalide'],
        validate: {
            validator: function(value) {
                return emailRegex.test(value);
            },
            message: 'Email invalide'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
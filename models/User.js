const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true,
        validate: { //utilisation de validate pour personnalisation du messaged d'erreur vs match qui ne peut pas
            validator: function(value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: 'Le mot de passe doit comporter au moins 8 caractères, inclure au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.'
        }
    }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);

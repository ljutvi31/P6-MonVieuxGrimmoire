const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma utilisateur
const userSchema = mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    validate: {
      validator: function(value) {
        // Regex pour valider le format de l'email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Veuillez entrer une adresse email valide.'
    }
  },
  password: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        // Regex pour valider le mot de passe
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message: 'Le mot de passe doit comporter au moins 8 caractères, inclure au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.'
    }
  }
});

// Plugin pour garantir l'unicité des emails
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);

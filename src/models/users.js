const mongoose = require('mongoose');

exports.Users = mongoose.model('User',new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 25,
        unique: true
    }
}));
 
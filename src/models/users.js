const mongoose = require("mongoose"); 

exports.Users = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 25,
      unique: true,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 1024,
      required: true,
    },
    connectionId: {
      type: String,
      maxlength: 1024,
    },
  })
);

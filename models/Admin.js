const mongoose = require('mongoose');

//------------ User Schema ------------//
const RegistrarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email3: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  dept: {
    type: String,
    required: true
  },
  phoneno: {
    type: String,
    required: true
  },
  phoneno1: {
    type: String,
  },
  password3: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  resetLink: {
    type: String,
    default: ''
  }
}, { timestamps: true });


const Registrar = mongoose.model('Registrar', RegistrarSchema);

module.exports = Registrar;
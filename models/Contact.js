const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String
  },
  phone:
  {
    type: String
  },
  message:
  {
    type: String
  },
  
}, { timestamps: true });


const Contacts = mongoose.model('Contact', ContactSchema);

module.exports = Contacts ;
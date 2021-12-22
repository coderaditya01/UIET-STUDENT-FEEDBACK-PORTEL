const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  email1: {
    type: String,
    required: true
  },
  query: {
    type: String
  },
  query_reply:{
    type: String
  }
}, { timestamps: true });


const Queryy = mongoose.model('Query', QuerySchema);

module.exports = Queryy;
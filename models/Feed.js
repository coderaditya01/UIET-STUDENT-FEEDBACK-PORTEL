const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema({
  email1: {
    type: String,
    required: true
  },
  feedback: {
    type: String
  },
  feedback_reply:
  {
    type: String
  },
}, { timestamps: true });


const Feedb = mongoose.model('Feed', FeedSchema);

module.exports = Feedb;
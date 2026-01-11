const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  messages: [
    {
      role: { type: String, required: true },  
      content: { type: String, required: true },
    },
  ],
  title: { type: String, default: 'Untitled Chat' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);
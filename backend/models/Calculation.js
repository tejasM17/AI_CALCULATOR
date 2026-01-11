const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  query: { type: String, required: true },  
  result: { type: String, required: true }, 
  steps: { type: String },  
  type: { type: String },   
  title: { type: String, default: 'Untitled Calculation' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Calculation', calculationSchema);
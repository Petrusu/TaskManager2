const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  default: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('Stage', StageSchema);

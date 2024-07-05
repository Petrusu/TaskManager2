const { createCustomError } = require('../errors/custom-error');
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'must provide title'],
    maxlength: [20, 'ешеду can not be more than 20 characters'],
  },
  value: {
    type: String,
    required: [true, 'must provide value'],
    trim: true,
    maxlength: [400, 'name can not be more than 400 characters'],
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    required: [true, 'must provide stage']
  },
  creationDate: {
    type: Date,
    default: new Date(Date.now() + (180 * 60 * 1000))
  },
  expiredDate: {
    type: Date
  },
  updateDate: {
    type: Date,
    default: new Date(Date.now() + (180 * 60 * 1000))
  },
  completeProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    required: [true, 'completeProgress must be between 0 and 100']
  }
})
  .pre('findOneAndUpdate',  function(next) {
    if (typeof this._update.creationDate !== 'undefined') {
      return next(createCustomError('creationDate is read only field', 500));
    } else {
      next();
    }
  });

module.exports = mongoose.model('Task', TaskSchema);

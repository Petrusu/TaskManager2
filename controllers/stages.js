const Stage = require('../models/Stage');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../errors/custom-error');

const getAllStages = asyncWrapper(async (req, res, next) => {
  const stages = await Stage.find({});
  if (!stages.length) {
    return next(createCustomError(`Found no stages`, 404));
  }
  res.status(200).json({ stages });
});

module.exports = {
  getAllStages
};

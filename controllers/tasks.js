const Task = require('../models/Task');
const Stage = require('../models/Stage');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../errors/custom-error');

const getAllTasks = asyncWrapper(async (req, res) => {
  const filter = {};
  let { stage } = req.query;

  if (typeof stage === 'string') {
    filter['$and'] = [{
      stage: stage
    }];
  }

  const tasks = await Task.find(filter);
  res.status(200).json({ tasks });
});

const createTask = asyncWrapper(async (req, res) => {
  const stage = await Stage.findOne({default: true});
  let { expiredDate } = req.body;
  if (typeof expiredDate !== 'undefined') {
    expiredDate = new Date(parseInt(expiredDate, 10) + (180 * 60 * 1000));
  }
  const task = await Task.create({ ...req.body, expiredDate, stage: stage._id });
  res.status(201).json({ task });
});

const getTask = asyncWrapper(async (req, res, next) => {
  const { id: taskID } = req.params;
  const task = await Task.findOne({ _id: taskID });
  if (!task) {
    return next(createCustomError(`No task with id : ${taskID}`, 404));
  }
  res.status(200).json({ task });
});

const deleteTask = asyncWrapper(async (req, res, next) => {
  const { id: taskID } = req.params;
  const task = await Task.findOneAndDelete({ _id: taskID });
  if (!task) {
    return next(createCustomError(`No task with id : ${taskID}`, 404));
  }
  res.status(200).json({ task });
});

const updateTask = asyncWrapper(async (req, res, next) => {
  const { id: taskID } = req.params;
  const updateDate = new Date(Date.now() + (180 * 60 * 1000));

  const task = await Task.findOneAndUpdate({ _id: taskID }, { ...req.body, updateDate }, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    return next(createCustomError(`No task with id : ${taskID}`, 404));
  }

  res.status(200).json({ task })
});

module.exports = {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};

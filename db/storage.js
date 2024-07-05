const connectDB = require('./connect');
const Stage = require('../models/Stage');

const initializeStorage = async () => {
  await connectDB(process.env.MONGO_URI);
  const stages = await Stage.find();
  if (!stages.length) {
    Stage.create([
      {name: 'ready', default: true},
      {name: 'progress'},
      {name: 'review'},
      {name: 'done'}
    ]).catch(console.error);
  }
};

module.exports = initializeStorage;

require('dotenv').config();
const express = require('express');
const app = express();
const { stages, tasks } = require('./routes');
const initializeStorage = require('./db/storage');
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');

// middleware

app.use(express.static('./public'));
app.use(express.json());

// routes

app.use('/api/v1/tasks', tasks);
app.use('/api/v1/stages', stages);

// errors middleware

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await initializeStorage();
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

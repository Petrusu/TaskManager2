const express = require('express');
const router = express.Router();
const { getAllStages } = require('../controllers/stages');

router.route('/').get(getAllStages);

module.exports = router;

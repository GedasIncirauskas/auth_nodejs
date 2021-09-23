const express = require('express');
const cors = require('cors');
const { port } = require('./config.js');
const logger = require('../logger.js');

const auth = require('./routes/v1/auth.js');
const tutorials = require('./routes/v1/tutorials.js');

const app = express();
app.use(express.json());
app.use(cors('*'));

app.use('/v1/auth', auth);
app.use('/v1/tutorials', tutorials);

app.all('*', (req, res) => {
  return res.status(404).send({ msg: 'Page not found' });
});

app.listen(port, () => logger.info(`Working on ${port}`));

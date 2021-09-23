const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { loggedIn } = require('../../middleware.js');
const { dbConfig, jwtSecret } = require('../../config.js');

router.get('/user-tutorials/:id', loggedIn, async (req, res) => {
  const id = req.params.id || '';
  const query = `
  SELECT title, content FROM tutorials  
  ${id && `WHERE user_id = '${req.params.id}'`}
    `;
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err });
  }
});

router.get('/tutorials', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decodedToken = jwt.verify(token, jwtSecret);
    if (decodedToken) {
      const query = `
      SELECT title, content FROM tutorials  
        `;
      try {
        const con = await mysql.createConnection(dbConfig);
        const [data] = await con.execute(query);
        await con.end();
        return res.send(data);
      } catch (err) {
        return res.status(500).send({ err });
      }
    }
  } else {
    const query = `
    SELECT title, content
    FROM tutorials
    WHERE private = 0
    `;
    try {
      const con = await mysql.createConnection(dbConfig);
      const [data] = await con.execute(query);
      await con.end();
      return res.send(data);
    } catch (err) {
      return res.status(500).send({ err });
    }
  }
});

router.post('/tutorials', loggedIn, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `
    INSERT INTO tutorials (user_id, title, content, private) 
    VALUES (${mysql.escape(req.userData.id)}, ${mysql.escape(title)}, ${mysql.escape(content)}, 1)`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Please try again' });
  }
});

module.exports = router;

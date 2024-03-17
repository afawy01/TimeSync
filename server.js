const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(function() {
  db.run("CREATE TABLE users (id INT, username TEXT)");
  db.run("CREATE TABLE meetings (id INT, title TEXT, user_id INT, FOREIGN KEY(user_id) REFERENCES users(id))");
});

app.get('/', (req, res) => {
  res.send('TimeSync Server is running!');
});

// Add any new endpoints here

//Add New Users
app.post('/user', (req, res) => {
    const { username } = req.body;
    const sql = `INSERT INTO users (username) VALUES (?)`;
    db.run(sql, [username], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send({ message: 'User added', id: this.lastID });
    });
  });

//Add Meeting
app.post('/meeting', (req, res) => {
    const { title, user_id } = req.body;
    const sql = `INSERT INTO meetings (title, UserID) VALUES (?, ?)`;
    db.run(sql, [title, user_id], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send({ message: 'Meeting added', id: this.lastID });
    });
  });

//Add Group
app.post('/group', (req, res) => {
    const { title, user_id } = req.body;
    const sql = `INSERT INTO TeamsChannels (ChannelName, UserID) VALUES (?, ?)`;
    db.run(sql, [title, user_id], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send({ message: 'Group added', id: this.lastID });
    });
  });
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

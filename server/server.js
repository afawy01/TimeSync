const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');
const sqliteStore = require('connect-sqlite3')(session);
const path = require('path');

const db = new sqlite3.Database('./TimeSync.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the TimeSync SQLite database.');
});

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(express.static('.'));

app.use(session({
  store: new sqliteStore,
  secret: 'test',
  cookie: { maxAge: 24*60*60*1000 }
}));

// URL Visits
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'user.html'))
  const userId = req.session.userId;
});

app.get('/user', (req, res) => {
  // Check if user cookie exists
  if (req.session.userId) {
    res.json({username : req.session.username})
  } else {
    res.json({error: 'User not logged in'})
  }
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'))
})

// Add any new endpoints here
//Notes: Add CRUD functions

app.get('/settings', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'))
})

//Add New Users
app.post('/user', (req, res) => {
  // TODO: hash passwords
    const { username, password, email } = req.body;
    const sql = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, 'User')`;
    db.run(sql, [username, password, email], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send({ message: 'User added', id: this.lastID });
    });
  });

function isAuthenticated (req, res, next) {
  if (req.session.user) next()
}


// CHECKING USER LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.all(sql, [username, password], function(err, rows) {
    if (err) {
      return console.error(err.message);
    }
    if (rows.length == 1) {
      // Authenticate user cookie
      req.session.userId = rows[0]["UserID"]
      req.session.username = rows[0]["Username"]
      res.redirect('/');
    }
  })
})

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

//Add Meeting
app.post('/meeting', (req, res) => {
    const { title, description } = req.body;
    const sql = `INSERT INTO meetings (Title, Description) VALUES (?, ?)`;
    db.run(sql, [title, description], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send({ message: 'Meeting added', id: this.lastID });
    });
  });

//Add Group
app.post('/group', (req, res) => {
    console.log(req.body)
    const { title, description } = req.body;
    const sql = `INSERT INTO TeamsChannels (ChannelName, Description) VALUES (?, ?)`;
    db.run(sql, [title, description], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send({ message: 'Group added', id: this.lastID });
    });
  });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

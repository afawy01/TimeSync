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
    //db.run('CREATE TABLE IF NOT EXISTS "UserTeams" ( "EntryID" INTEGER, "UserID" INTEGER, "ChannelID" INTEGER, "Role" TEXT, PRIMARY KEY("EntryID" AUTOINCREMENT));');
    console.log('Connected to the TimeSync SQLite database.');
});

// Query db and await results before continuing
function queryAllDB(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if(err) {
        reject(err);
      }
      resolve(rows);
    })
  })
}

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

app.get('/user', async (req, res) => {
  // Check if user cookie exists, if so get user info and teams
  if (req.session.userId) {
    let sql = `SELECT * FROM UserTeams WHERE UserID = ?`
    const teamlist = await queryAllDB(sql, [req.session.userId]);
    let info = ""
    for(let i = 0; i < teamlist.length; i++) {
      info = info.concat(teamlist[i]["ChannelID"]);
      if (i < teamlist.length-1) {
        info = info.concat(', ')
      }
    }
    console.log(info);
    sql = `SELECT * FROM TeamsChannels WHERE ChannelID IN (${info})`;
    const teaminfo = await queryAllDB(sql)
    res.json({username : req.session.username, teamlist: teamlist, teaminfo: teaminfo});
  } else {
    res.json({error: 'User not logged in'})
  }
})

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'registration.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'))
})

// Add any new endpoints here
//Notes: Add CRUD functions

app.get('/settings', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'))
})

app.get('/teams', (req, res) => {
  res.sendFile(path.join(__dirname, 'teams.html'))
})

//Add New Users
app.post('/user', async (req, res) => {
  // TODO: hash passwords

  const { username, password, email } = req.body;

  // Check if username exists
  let sql = `SELECT * FROM users WHERE username = ?`
  const results = await queryAllDB(sql, [username])
  if (results.length > 0) {
    res.send({ error: 'User exists' })
    return
  }

  sql = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, 'User')`;
  db.run(sql, [username, password, email], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.send({ message: 'User added', id: this.lastID, redirect: '/login' });
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
      res.send({ redirect: '/' })
    } else {
      res.send({ error: 'Incorrect Login' });
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
    let joincode = crypto.randomBytes(4).toString('base64');
    console.log(joincode);
    console.log(req.body)
    const { title, description } = req.body;
    let sql = `INSERT INTO TeamsChannels (ChannelName, Description, JoinCode) VALUES (?, ?, ?)`;
    db.run(sql, [title, description, joincode], function(err) {
      if (err) {
        return console.error(err.message);
      }
      sql = `INSERT INTO UserTeams (UserID, ChannelID, Role) VALUES (?, ?, 'Owner')`;
      db.run(sql, [req.session.userId, this.lastID], function(err) {
        if (err) {
          return console.error(err.message);
        }
      })
      res.send({ message: 'Group added', id: this.lastID });
    })
  });

app.post('/joingroup', (req, res) => {
  const { joincode } = req.body;
  let sql = `SELECT * FROM TeamsChannels WHERE JoinCode = ?`
  db.all(sql, [joincode], async function(err, rows) {
    console.log(rows)
    if (err) {
      return console.error(err.message);
    }

    if (rows.length == 1) {
      console.log(rows);
      // Check if user is already in the group
      sql = `SELECT * FROM UserTeams WHERE UserID = ? AND ChannelID = ?`
      let results = await queryAllDB(sql, [req.session.userId, rows[0]["ChannelID"]])
      if (results.length == 1) {
        res.send({ message: 'User is already in this group'})
        return
      }

      // If user not in group, user joins group
      sql = `INSERT INTO UserTeams (UserID, ChannelID, Role) VALUES (?, ?, 'Member')`
      db.run(sql, [req.session.userId, rows[0]["ChannelID"]], function(err) {
        if (err) {
          return console.error(err.message);
        }
      })
      res.send({ message: 'Successfully joined group'});
    } else {
      res.send({ message: 'Group with that code does not exist'});
    }
  })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

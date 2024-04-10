const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');
const sqliteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');

const db = new sqlite3.Database('./TimeSync.db', (err) => {
  // Initialize DB if not existing
  db.exec(fs.readFileSync('./TimeSync.sql').toString())
  console.log('Connected to the TimeSync SQLite database.');
})

// Query db and await results before continuing
function queryAllDB(query, params = []) {
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

    sql = `SELECT ProfilePicture FROM Users WHERE UserID = ${req.session.userId}`
    db.get(sql, (err, row) => {
    })

    res.json({username : req.session.username, teamlist: teamlist, teaminfo: teaminfo, userid: req.session.userId, /*profilepicture: imgblob[0]*/});
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

app.get('/teamlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'teamlist.html'))
})

app.get('/team', (req, res) => {
  res.sendFile(path.join(__dirname, 'team.html'))
})

app.get('/teamsettings', (req, res) => {
  res.sendFile(path.join(__dirname, 'teamsettings.html'))
})

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'))
})

app.get('/availability', (req, res) => {
  res.sendFile(path.join(__dirname, 'availability.html'))
})

app.get('/teamcalendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'teamcalendar.html'))
})

app.get('/getteam', async (req, res) => {
  // TODO: Check user credentials if they are allowed to get this team's information
  const channelID = req.query.id
  if (!channelID) {
    res.send({ error: 'No team ID given.'})
  }
  let sql = `SELECT * FROM TeamsChannels WHERE ChannelID = ?`
  const teamInfo = await queryAllDB(sql, [channelID])

  sql = `SELECT * FROM UserTeams WHERE ChannelID = ?`
  const teamMembers = await queryAllDB(sql, [channelID])

  // Get all team member usernames
  let info = ""
  for(let i = 0; i < teamMembers.length; i++) {
    info = info.concat(teamMembers[i]["UserID"])
    if (i < teamMembers.length-1) {
      info = info.concat(', ')
    }
  }

  // TODO: Clean up JSON for teammembers and memberinfo being separate.
  sql = `SELECT UserID, Username FROM Users WHERE UserID IN (${info})`
  const memberInfo = await queryAllDB(sql)

  res.send({ teaminfo: teamInfo, teammembers: teamMembers, memberinfo: memberInfo })
})

// ----------WIP Functions -------------------------
// Pull teams for users
app.get('/api/user-teams', (req, res) => {
  if (!req.session.userId) {
      return res.status(401).json({ error: 'User not logged in' });
  }
  const userId = req.session.userId;
  const query = `
      SELECT tc.ChannelID, tc.ChannelName
      FROM TeamsChannels tc
      JOIN UserTeams ut ON tc.ChannelID = ut.ChannelID
      WHERE ut.UserID = ?`;

  db.all(query, [userId], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(rows);
  });
});

// Endpoint to send a message to a team
app.post('/api/send-message', (req, res) => {
  const { channelId, message } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ error: 'User not authenticated' });

  const query = `INSERT INTO Messages (ChannelID, UserID, MessageText) VALUES (?, ?, ?)`;

  db.run(query, [channelId, userId, message], function(err) {
      if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Failed to send message' });
      }
      res.json({ success: 'Message sent successfully', messageId: this.lastID });
  });
});

// Endpoint to get the chat logs for a selected team
app.get('/api/chat-logs', (req, res) => {
  const channelId = req.query["id"];
  const query = `SELECT * FROM Messages WHERE ChannelID = ?`;

  db.all(query, [channelId], (err, messages) => {
      if (err) {
          console.error(err.message);
          return res.status(500).json({ error: "Internal Server Error" });
      }
      if (messages.length === 0) {
          return res.status(404).json({ error: "No messages found for this team." });
      }
      res.json(messages);
  });
});

app.get('/api/get-user-meetings', (req, res) => {
  const userID = req.session.userId

  const sql = `SELECT * FROM UserMeetings WHERE UserID = ${userID}`
  db.all(sql, (err, meetings) => {
    if (err) {
      console.error(err.message);
    }
    res.json(meetings);
  })
})

app.get('/api/get-team-meetings', (req, res) => {
  const channelID = req.query.id
  const userID = req.session.userId
  console.log(channelID)

  const sql = `SELECT * FROM TeamMeetings WHERE ChannelID = ${channelID}`
  db.all(sql, (err, meetings) => {
    if (err) {
      console.error(err.message);
    }
    res.json(meetings);
  })
})

app.get('/api/get-polls', async (req, res) => {
  const channelID = req.query["id"]
  const userID = req.session.userId

  let sql = `SELECT * FROM AvailabilityPolls WHERE ChannelID = ${channelID}`
  const pollResults = await queryAllDB(sql)

  sql = `SELECT * FROM AvailabilityDates WHERE ChannelID = ${channelID}`
  const dateResults = await queryAllDB(sql)

  sql = `SELECT * FROM AvailabilityVotes WHERE ChannelID = ${channelID}`
  const voteResults = await queryAllDB(sql)

  res.send({ polls: pollResults, dates: dateResults, votes: voteResults })
})

app.post('/api/change-profile-picture', (req, res) => {
  let imgblob = req.body
  const userID = req.session.userId

  const sql = `UPDATE Users SET ProfilePicture = ? WHERE UserID = ${userID}`
  queryAllDB(sql, `x${imgblob}`)
  db.run(sql, (err) => {
    if(err) { console.error(err.message) }
  })

  res.status(200).send({ message: 'Successfully changed profile picture' })
})

app.post('/api/change-profile', (req, res) => {
  const { username, password, email } = req.body
  const userID = req.session.userId

  if (username) {
    const sql = `UPDATE Users SET Username = '${username}' WHERE UserID = ${userID}`
    db.run(sql, (err) => {
      if(err) { console.error(err.message) }
    })
  }

  if (password) {
    const sql = `UPDATE Users SET Password = '${password}' WHERE UserID = ${userID}`
    db.run(sql, (err) => {
      if(err) { console.error(err.message) }
    })
  }

  if (email) {
    const sql = `UPDATE Users SET Email = '${email}' WHERE UserID = ${userID}`
    db.run(sql, (err) => {
      if(err) { console.error(err.message) }
    })
  }

  res.status(200).send({ message: 'Successfully changed profile' })
})

app.post('/api/remove-member', (req, res) => {
  const { channelID, userID } = req.body
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'User not authenticated' });

  // TODO: Check role of userid to see if permitted to do this action

  const sql = `DELETE FROM UserTeams WHERE UserID = ${userID} AND ChannelID = ${channelID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      res.status(200).send("Successfully removed member");
    }
  })
})

app.post('/api/change-member-role', (req, res) => {
  const { channelID, userID, role } = req.body

  const sql = `UPDATE UserTeams SET Role = '${role}' WHERE UserID = ${userID} AND ChannelID = ${channelID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      res.status(200).send("Successfully change member role")
    }
  })
})

app.post('/api/add-user-meeting', (req, res) => {
  const { title, description, date } = req.body
  const userID = req.session.userId

  const sql = `INSERT INTO UserMeetings (userid, title, description, meetingdate) VALUES (?, ?, ?, ?)`;
  db.run(sql, [userID, title, description, date], function(err) {
    if(err) {
      return console.error(err.message);
    }
    res.status(200).send({ message: 'User meeting saved successfully.' })
  })

})

app.post('/api/remove-user-meeting', (req, res) => {
  const { meetingID } = req.body
  const userID = req.session.userId

  const sql = `DELETE FROM UserMeetings WHERE UserID = ${userID} AND MeetingID = ${meetingID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message)
    } else {
      res.status(200).send({ message: 'User meeting deleted successfully.'})
    }
  })
})

app.post('/api/add-team-meeting', (req, res) => {
  const { title, description, date, channelID } = req.body
  const userID = req.session.userId

  const sql = `INSERT INTO TeamMeetings (CreatorUserID, Title, Description, MeetingDate, ChannelID) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [userID, title, description, date, channelID], function(err) {
    if(err) {
      return console.error(err.message);
    }
    res.status(200).send({ message: 'Team meeting saved successfully.' })
  })

})

app.post('/api/remove-team-meeting', (req, res) => {
  const { meetingID, channelID } = req.body
  const userID = req.session.userId

  const sql = `DELETE FROM TeamMeetings WHERE ChannelID = ${userID} AND MeetingID = ${meetingID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message)
    } else {
      res.status(200).send({ message: 'User meeting deleted successfully.'})
    }
  })
})

app.post('/api/delete-team', (req, res) => {
  const { channelID } = req.body

  // TODO: Check role of user requesting for authentication
  const userID = req.session.userId

  let sql = `DELETE FROM TeamsChannels WHERE ChannelID = ${channelID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message)
    }
  })

  sql = `DELETE FROM UserTeams WHERE ChannelID = ${channelID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message)
    }
  })

  sql = `DELETE FROM Messages WHERE ChannelID = ${channelID}`
  db.run(sql, (err) => {
    if (err) {
      console.error(err.message)
    } else {
      res.status(200).send({ message: 'Successfully deleted team.' })
    }
  })
})

// !--------------------------------------------------------------------
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

// User has selected a team from the list
app.post('/team', (req, res) => {
  const { ChannelID } = req.body;
  const sql = `SELECT * FROM TeamsChannels WHERE ChannelID = ?`
  db.all(sql, [ChannelID], function(err, rows) {
    if (err) {
      return console.error(err.message);
    }
    if (rows.length == 1) {

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
    const { title, description, icon } = req.body;
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
      res.send({ message: 'Successfully created team', id: this.lastID, joincode: joincode });
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

app.post('/api/create-poll', (req, res) => {
  const { title, description, dates, channelID } = req.body
  const userID = req.session.userId

  let sql = `INSERT INTO AvailabilityPolls (CreatorUserID, ChannelID, Title, Description) VALUES (?, ?, ?, ?)`
  db.run(sql, [userID, channelID, title, description], function(err) {
    if(err) {return console.error(err.message)}
    let pollID = this.lastID

    for (let i = 0; i < dates.length; i++) {
      sql = `INSERT INTO AvailabilityDates (PollID, Date, ChannelID) VALUES (?, ?, ?)`
      db.run(sql, [pollID, dates[i], channelID], function(err) {
        if (err) {return console.error(err.message) }
      })
      //res.status(200).send({ message: 'Successfully created poll' })
    }
  })
})

app.post('/api/vote-poll', (req, res) => {
  const { channelID, pollID, date } = req.body
  const userID = req.session.userId

  let sql = `INSERT INTO AvailabilityVotes (PollID, UserID, ChannelID, Date) VALUES (?, ?, ?, ?)`
  db.run(sql, [pollID, userID, channelID, date], function(err) {
    if(err) { return console.error(err.message) }
  })

  res.status(200).send({ message: 'Successfully casted vote'})
})

app.post('/api/remove-vote', (req, res) => {
  const { channelID, pollID, date } = req.body
  console.log(req.body)
  const userId = req.session.userId
  console.log(userId)

  let sql = `DELETE FROM AvailabilityVotes WHERE ChannelID = ${channelID} AND PollID = ${pollID} AND Date = "${date}" AND UserID = ${userId}`
  db.run(sql, (err) => {
    if(err) { console.error(err.message) } else {
      res.status(200).send({ message: 'Successfully removed vote' })
    }
  })
})

//Polling stuff

// Support POSTing form data with URL encoded
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    next();
});

app.get("/poll", async (req, res) => {
    let data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
    const totalVotes = Object.values(data).reduce((total, n) => total += n, 0);

    data = Object.entries(data).map(([label, votes]) => {
        return {
            label,
            percentage: (((100 * votes) / totalVotes) || 0).toFixed(0)
        }
    });

    res.json(data);
});

app.post("/poll", async (req, res) => {
    const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));

    data[req.body.add]++;

    await fs.writeFile(dataFile, JSON.stringify(data));

    res.end();
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

module.exports = app;
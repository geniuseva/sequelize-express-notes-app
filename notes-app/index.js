//
// Server
//
const express = require('express');
const app = express();
const port = 3000;
app.listen(port, () => console.log(`notes-app listening on port ${port}!`));

// 'body-parser' module accepts and parses JSON parameters
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// set up database and check the connection using Sequelize
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  // The `host` parameter is required for other databases
  // host: 'localhost'
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// run a SELECT query to check if the database responds correctly
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// create a model named Note for mapping
const Note = sequelize.define('notes', { note: Sequelize.TEXT, tag: Sequelize.STRING });

// synchronize all models to database
sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`);
  });

// create some sample tables
sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`);

    Note.bulkCreate([
      { note: 'pick up some bread after work', tag: 'shopping' },
      { note: 'remember to write up meeting notes', tag: 'work' },
      { note: 'learn how to use node orm', tag: 'work' }
    ]).then(function() {
      return Note.findAll();
    }).then(function(notes) {
      console.log(notes);
    });
  });

//
// Routes
//
app.get('/', (req, res) => res.send('Notes App'));

// read all entities
app.get('/notes', function(req, res) {
  Note.findAll().then(notes => res.json(notes));
});

// read a more specific entity
// app.get('/notes/search', function(req, res) {
//    Note.findAll({ where: { note: req.query.note, tag: req.query.tag } }).then(notes => res.json(notes));
// });

// read eneities using "or"
// const Op = Sequelize.Op;
// app.get('/notes/search', function(req, res) {
//   Note.findAll({
//     where: {
//       tag: {
//         [Op.or]: [].concat(req.query.tag)
//       }
//     }
//   }).then(notes => res.json(notes));
// });

// read entities with "limit"
const Op = Sequelize.Op;
app.get('/notes/search', function(req, res) {
  Note.findAll({
    limit: 2,
    where: {
      tag: {
        [Op.or]: [].concat(req.query.tag)
      }
    }
  }).then(notes => res.json(notes));
});

// read a specific entity
app.get('/notes/:id', function(req, res) {
    Note.findAll({ where: { id: req.params.id } }).then(notes => res.json(notes));
});

// insert entities
app.post('/notes', function(req, res) {
  Note.create({ note: req.body.note, tag: req.body.tag }).then(function(note) {
    res.json(note);
  });
});

// update entities
app.put('/notes/:id', function(req, res) {
    Note.findByPk(req.params.id).then(function(note) {
      note.update({
        note: req.body.note,
        tag: req.body.tag
      }).then((note) => {
        res.json(note);
      });
    });
});

// delete entities
app.delete('/notes/:id', function(req, res) {
    Note.findByPk(req.params.id).then(function(note) {
      note.destroy();
    }).then((note) => {
      res.sendStatus(200);
    });
});
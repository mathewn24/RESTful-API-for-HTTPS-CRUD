const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cors = require('cors');
app.use(cors());

mongoose.connect(
  'mongodb+srv://stu101:p341728W@cluster0.qsanyuv.mongodb.net/stu101'
);

// mongoose.connection is an instance of the connected DB
const db = mongoose.connection;

//Upon connection failure
db.on('error', console.error.bind(console, 'connection error:'));

//Upon connection failure
db.on('open', function () {
  //Defining Event Schema
  const eventSchema = new Schema({
    eventId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    loc: { type: Schema.Types.ObjectId, ref: 'Location' },
    quota: { type: Number },
  });

  //Defining Location Schema
  const locationSchema = new Schema({
    locId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    quota: { type: Number },
  });

  const Event = mongoose.model('Event', eventSchema);
  const Location = mongoose.model('Location', locationSchema);
  
  Event.findOne({
    eventId: 23432,
  })
    .populate('loc')
    .exec(function (err, event) {
      if (err) {
        console.log('Error: ' + err);
        return err;
      } else {
        console.log('Event 1 is located at: ' + event);
      }
    });

  app.get('/setlocation', (req, res) => {
    Location.create(
      {
        locId: 234,
        name: 'CUHK',
        quota: 11,
      },
      (err, location) => {
        if (err) {
          console.log('Error');
          return err;
        } else {
          console.log(
            'The location is at ' +
              location.name +
              '\n with a quota of: ' +
              location.quota +
              '\n and location ID: ' +
              location.locId
          );
        }
      }
    );
  });

  app.get('/ev/:eventId', (req, res) => {
    Event.findOne({ eventId: req.params['eventId'] }, 'eventId name loc quota')
      .populate('loc')
      .exec((err, event) => {
        if (err) {
          res.send(err);
        } else {
          //event.loc = location1;
          console.log('The location is ' + event);
          res.send(
            '{<br/>"eventId": ' +
              event.eventId +
              ',<br/>' +
              '"name": "' +
              event.name +
              '",<br/>' +
              '"loc": ' +
              '<br/>{' +
              '<br/>"locId": ' +
              event.loc.locId +
              ',<br/>' +
              '"name": "' +
              event.loc.name +
              '",<br/>' +
              '},' +
              '<br/>' +
              '"quota": ' +
              event.quota +
              '<br/>}'
          );
        }
      });
  });

  app.all('/*', (req, res) => {
    res.send('Default page.');
  });

  console.log('Connection is open...');
});

/*
app.get('/main', (req, res) => {
  res.send('Hello World!');
});

//Send through query in url
app.get('/class', (req, res) => {
  const cid = req.query.id;
  const instructor = req.query.teach;

  res.send({
    'Class ID': cid,
    'Course instructor': instructor,
  });
});

//Send through params in url
app.get('/course/:courseid/building/:buildid', (req, res) => {
  let course = req.params.courseid;
  let building = req.params.buildid;

  res.send({
    'Course': course,
    'Building': building,
  });
});

//Get html file for making the post request
app.get('/findevent', (req, res) => {
  res.sendFile(path.join(__dirname, '/main.html'));
});

// Parser to obtain the content in the request body.
app.use(bodyParser.urlencoded({ extended: false }));

// Handle POST request for /event
app.post('/event', (req, res, next) => {
  let venue = req.body['loc'];
  let time = req.body['epoch'];
  //const venue = req.body.loc;
  //const time = req.body.epoch;

  res.send({
    'Location1' : venue,
    'Time' : time,
  });
  next;
});
*/

const server = app.listen(3000);

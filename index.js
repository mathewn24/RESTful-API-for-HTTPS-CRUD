const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { argv } = require('process');

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

  // Q1:GET http://localhost:3000/ev/eventId

  app.get('/ev/:eventId', (req, res) => {
    Event.findOne({ eventId: req.params['eventId'] }, 'eventId name loc quota')
      .populate('loc')
      .exec((err, event) => {
        if (err) {
          res.redirect(404, '/error404');

        } else {
          //console.log('The location is ' + event);
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


  // Q2: POST http://llocalhost:3000/ev

  //Get html file for making the post request
  app.get('/newevent', (req, res) => {
    res.sendFile(path.join(__dirname, '/main.html'));
  });

  // Parser to obtain the content in the request body.
  app.use(bodyParser.urlencoded({ extended: false }));
 
  // Handle POST request for /ev
  app.post('/ev', (req, res, next) => {
    var ev_name = req.body.name;
    var ev_locId = req.body.locId;
    var ev_quota = req.body.quota;
    //console.log('Name: ' + ev_name + ' Loc ID: ' + ev_locId + ' Quota: ' + ev_quota);

    var ev_Id;
    // Find the event with the maximum event Id by sorting
    // in descending order, and get the first element which is the largest,
    // and assign its ID + 1 to ev_Id.

    var maxEventId = Event.find({}).sort('-eventId').limit(1);
    maxEventId.exec((err, maxId) => {
      if (err) {
        return err;
      }

      ev_Id = maxId[0].eventId + 1;
    });

    // Find the location with given locId and see if
    // its quota is large enough for the event being created.

    var isLocQuotaEnough = { locId: ev_locId };
    Location.findOne(isLocQuotaEnough, (err, location) => {
      if (err) {
        console.log('location not found error.');
      }

      if (location.quota >= ev_quota) {
        // Create event after requirements met.
        Event.create(
          {
            eventId: ev_Id,
            name: ev_name,
            loc: location,
            quota: ev_quota,
          },
          (err, event) => {
            if (err) {
              res.send(err);
            } else {
              console.log('Success! Event created: \n' + event);
              //res.send('The new created event:' + '<br/>' + event);
              res.redirect(201, '/ev/' + event.eventId);
            }
          }
        );
      } else {
        console.log('ERROR 406');
        console.error(406);
        res.redirect(406, '/error406');
      }
    });

    next;
  });


  // Q3: DELETE http://localhost:3000/ev/eventId
  
  app.delete('/ev/:eventId', (req, res) => {
    console.log(req.params.eventId);
    Event.findOneAndRemove({ eventId: req.params['eventId'] })
      .exec((err, event) => {
        if (err) {
          console.log("error");
          res.redirect(404, '/error404');

        } else if (event == null){
          res.statusCode = 404;
          res.send("404 Not Found.");
        }else {
          console.log('The event is deleted.');
          res.sendStatus(204);
        }
      });
  });


  // Q4: GET http://localhost:3000/ev
  // and 
  // Q7: GET http://localhost:3000/ev?q=number

  // List out all the events existing in the database currently.
  app.get('/ev', (req, res) =>{

    var quotaSize = req.query['q'];
    
    if(quotaSize){
      // List all the events with quota of atleast this number,
      // eg. greater that or equal to the number.
      Event.find({quota: {$gte: quotaSize}}, (err, events) =>{
        if(err){
          console.log(err);
        } else if (events == null){
          res.send("[" + "<br/>" + "]");
        } else {
          console.log(events);
          res.send("Events greater than or equal to query quota:" + 
          "<br/>" + "[" + events + "]");
        }

      });
      //res.send(quotaSize);

    } else {

    Event.find({})
    .populate('loc')
    .exec(function (err, event) {
      if (err) {
        console.log('Error: ' + err);
        return err;
      } else {
        res.send('Event:' + '<br/>' + event + '<br/>');
      }
    });

    }

  });


  // Q5: GET http://localhost:3000/lo/locId

  // Show the details for the specified location ID.
  app.get('/lo/:locId', (req, res) => {
    Location.findOne({ locId: req.params['locId'] })
      .exec((err, location) => {
        if (err) {
          res.statusCode = 404;
          res.send('Error 404 Not Found');

        } else {
          //console.log('The location is ' + event);
          res.send(
            '{<br/>"locId": ' +
              location.locId +
              ',<br/>' +
              '"name": "' +
              location.name +
              '",<br/>'+
              '"quota": ' +
              location.quota +
              '<br/>}'
          );
        }
      });
  });


  // Q6: GET http://localhost:3000/lo

  // List all of the locations currently available in the database.
  app.get('/lo', (req, res) =>{
    
    Location.find({})
    .exec(function (err, location) {
      if (err) {
        console.log('Error: ' + err);
        return err;
      } else {
        for (var i = 0; i < location.length; i++) {
          console.log('Location ' + i + ' is: ' + location);
        }
        res.send('Location:' + '<br/>' + location + '<br/>');
      }
    });
  });


  //Error Pages
  app.get('/error406', (req, res) => {
    res.send("Error406 : Event not created.");
  });

  app.get('/error404', (req, res) => {
    res.send("Error404 : Event not found.");
  });

  app.all('/*', (req, res) => {
    res.send('Default page.');
  });

  console.log('Connection is open...');
});

const server = app.listen(3000);
'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');
var MongoClient = require('mongodb').MongoClient;
var helmet      = require('helmet');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(helmet.xssFilter());

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MONGODB_CONNECTION_STRING = process.env.DB;

MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
  if(err)
    return;
  
  db = db.db("personalLibrary");
  console.log("Connected to the DB.");
  
  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });

  //For FCC testing purposes
  fccTestingRoutes(app);

  //Routing for API 
  apiRoutes(app, db);  

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          var error = e;
            console.log('Tests are not valid:');
            console.log(error);
        }
      }, 1500);
    }
  });
});
module.exports = app; //for unit/functional testing

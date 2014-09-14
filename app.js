var express = require('express')
    , http = require('http')
    , path = require('path')
    , port = process.env.PORT || 8080
    , app = express()
    , mongo = require('mongodb')
    , bodyParser = require('body-parser')
    , router = express.Router()
    , url = require('url')
    , parseString = require('xml2js').parseString;

var dataToSend = {};

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/handkeyjs';

var monk = require('monk')
    , db = monk(mongoUri)
    , collection = db.get('serialNumbers');

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function parseToJson(key, value) {
  dataToSend = {};
  dataToSend[key] = value;
}

function randomNumberGenerator() {
  var randomNumber = Math.random() * (1000 - 1) + 1;
  return Math.floor(randomNumber);
}

function check_computer_input(data, res, counter) {
  if (data !== undefined && data !== null && counter) {
    // first time computer connects
    var randomNumber = randomNumberGenerator();
    res.json({'computer_number': randomNumber});
    collection.insert({
      computer_number: randomNumber,
      serial_number: data
    });
  } else {
    // data is found
    res.json({});
    clearData(res);
  }
}

function findSerialNumber(serial_number, res) {
  var counter = true;
  if (serial_number !== undefined && serial_number !== null) {
    collection.find().success(function(computer_serials) {
      for (var i = 0; i < computer_serials.length; i++) {
        var stored_serial_number = computer_serials[i].serial_number;
        if (stored_serial_number === serial_number) {
          parseToJson('computer_number', computer_serials[i].computer_number);
          res.json(dataToSend);
          clearData(res);
          counter = false;
        }
      }
      if (counter) {check_computer_input(serial_number, res, true);}
    });
  }
}

function clearData(res) {
  setTimeout(function() {
    dataToSend = {};
  }, 30000);
}

// function parseXml(req) {
//   var data;
//   parseString(req, function(err, result) {
//     data = result;
//   });
//   return data;
// }

router.use(function(req, res, next) {
  next();
});

router.get('/', function(req, res) {
  var queryObject = url.parse(req.url, true).query;
  if (Object.keys(queryObject).length === 0) {
    res.json({});
  } else {
    var serial_number = parseInt(queryObject.serial_number);
    findSerialNumber(serial_number, res);
  }
});

function clearDatabase() {
  collection.drop();
}
require('lotus');
router.route('/')
  .post(function(req, res) {
    clearDatabase();
    // var data = parseXml(req);
    lotus;
    var data = req;
    for (var element in req) {
      console.log(element);
    }
    collection.find().success(function(computer_serials) {
      for (var i = 0; i < computer_serials.length; i++) {
        var stored_serial_number = computer_serials[i].serial_number;
        if (stored_serial_number === parseInt(data)) {
          parseToJson('computer_number', computer_serials[i].computer_number);
          res.json(dataToSend);
          clearData(res);
        }
      }
    });
  });

app.use('/serial_number', router);

app.listen(port);
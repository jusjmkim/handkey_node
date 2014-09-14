var express = require('express')
    , http = require('http')
    , path = require('path')
    , port = process.env.PORT || 8080
    , app = express()
    , mongo = require('mongodb')
    , bodyParser = require('body-parser')
    , router = express.Router();

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

function parseToJson(key, value, res) {
  dataToSend = {};
  dataToSend[key] = value;
}

function randomNumberGenerator() {
  var randomNumber = Math.random() * (1000 - 1) + 1;
  return Math.floor(randomNumber);
}

function check_computer_input(data, res) {
  var randomNumber = randomNumberGenerator();
  var serial_number = data.serial_number
  // not first time computer connects
  if (findSerialNumber(serial_number, res)) {
    res.json({'computer_number': randomNumber});
    collection.insert({
      computer_number: randomNumber,
      serial_number: data.serial_number
    });
  } else {
    res.json(dataToSend);
  }
}

function findSerialNumber(serial_number, res) {
  collection.find().success(function(computer_serials) {
    computer_serials.forEach(function(computer_serial) {
      if (computer_serial.serial_number == serial_number) {
        parseToJson('computer_number', computer_serial.computer_number, res);
        return false;
      }
    });
  });

  return true;
}

router.use(function(req, res, next) {
  next();
});

router.get('/', function(req, res) {
  var queryObject = url.parse(req.url, true);
  findSerialNumber(queryObject.serial_number, res);
  res.json(dataToSend);
});

router.route('/')

  .post(function(req, res) {
    var data = req.body;
    check_computer_input(data, res);
    setTimeout(function() {
      dataToSend = {};
    }, 30000);
  });

app.use('/serial_number', router);

app.listen(port);
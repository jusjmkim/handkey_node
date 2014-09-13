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

  // not first time computer connects
  if (!isNaN(data.serial_number)) {
    res.json({'computer_number': randomNumber})
    collection.insert({
      computer_number: data.serial_number
    });

  // not first time computer connects
  } else if (!isNaN(data.computer_number)) {
    var computer_number = data.computer_number;
    console.log(data);
    console.log(computer_number);
    collection.find().success(function(computer_serials) {
      console.log(computer_serials);
      computer_serials.forEach(function(computer_serial) {
        if (computer_serial.computer_number === computer_number) {
          parseToJson('serial_number', computer_number, res);
          console.log(dataToSend);
        }
      });
      res.json(dataToSend);
    });
  }
}

router.use(function(req, res, next) {
  next();
});

router.get('/', function(req, res) {
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
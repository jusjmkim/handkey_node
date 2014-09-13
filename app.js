var express = require('express')
    , http = require('http')
    , path = require('path')
    , port = process.env.PORT || 8080
    , app = express()
    , mongo = require('mongodb');

var mongoUri = proccess.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/handkeyjs';

var monk = require('monk')
    , db = monk(mongoUri)
    , collection = db.get('serialNumbers');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.get('/', function(req, res) {
  res.on('data', function(data) {
    check_computer_input(data, res);
    setTimeout(function() {
      res.json({});
    }, 30000);
  });
});

function check_computer_input(data, res) {
  var data_json = JSON.parse(data);
  var randomNumber = randomNumber();

  // not first time computer connects
  if (data_json.serial_number !== "undefined") {
    parseToJson('computer_number', randomNumber, res);
    collection.insert({
      randomNumber: data_json.serial_number
    });
  // not first time computer connects
  } else {
    collection.find().success(function(computer_serials) {
      parseToJson('serial_number', computer_serials[randomNumber], res); 
    });
  }
}

function parseToJson(key, value, res) {
  var json_data = {key: value};
  res.json(json_data);
}

function randomNumber() {
  return Math.random() * (1000 - 1) + 1;
}

function listenToServer() {
  server.listen(port);
}

(function() {
  listenToServer();
})();
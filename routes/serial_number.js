var express = require('express');
var http = require('http');
var router = express.Router();

var collection;

/* GET home page. */
router.get('/serial_number', function(req, res) {
  var db = req.db;
  collection = db.get('serialNumbers');
  res.on('data', function(data) {
    check_computer_input(data);
    setTimeout(function() {
      sendData(JSON.stringify({}));
    }), 30000);
  }
});

function check_computer_input(data) {
  var data_json = JSON.parse(data);
  var randomNumber = randomNumber();

  // not first time computer connects
  if (data_json.serial_number !== "undefined") {
    parseToJson('computer_number', randomNumber);
    collection.insert({
      randomNumber: data_json.serial_number
    });
  // not first time computer connects
  } else {
    collection.find().success(function(computer_serials) {
      parseToJson('serial_number', computer_serials[randomNumber]); 
    });
  }
}

function parseToJson(key, value) {
  var json_data = {key: value};
  sendData(JSON.stringify(json_data));
}

function sendData(data) {
  var req = http.request(dataToHttp(data), function(res) {
    res.setEncoding('utf-8');
    console.log('The response: ' + res);
  });

  req.write(data);
  req.end();
}

function dataToHttp(data){
  return {
    host: 'handkeyjs.herokuapp.com',
    port: 3000,
    path: '/serial_number',
    method: 'POST',
    headers: header(data)
  };
}

function header(data) {
  return {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  };
}

function randomNumber() {
  return Math.random() * (1000 - 1) + 1;
}

module.exports = router;

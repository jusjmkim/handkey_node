var express = require('express');
var http = require('http');
var router = express.Router();

/* GET home page. */
router.get('/serial_number', function(req, res) {
//  res.on('data', function(data) {
    var dataString = JSON.parse(data);
    postPebble(dataString);
 // }
});

function postPebble(data) {
  var req = http.request(dataToHttp(data), function(res) {
    console.log('The response' + res);
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

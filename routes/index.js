var express = require('express');
var http = require('http');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.on('data', function(data) {
    var dataString = JSON.parse(data);
  }
});

module.exports = router;

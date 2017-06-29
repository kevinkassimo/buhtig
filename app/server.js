var http = require('http');
var reqlib = require('../lib/req.js');
var errorcode = require('../lib/errorcode.js');
var querystring = require('querystring');
var url = require('url');
var fs = require('fs');
var express = require('express');

var app = express();

var server = http.createServer(function(req, res) {
    var logging = fs.open("traffic.log", "a+", function(err, fd) {
		fs.writeSync(fd, req.url.toString() + "\n");
    });
    
	var query = url.parse(req.url).query;
	//query looks like ?repo=expressjs/express&commit=1
	var message = querystring.parse(query);
	console.log(message);
	
	if (message['repo'] && message['commit']) {
		let returnCallback = function(link) {
			res.writeHead(200, {'content-type': 'text/plain', 'Access-Control-Allow-Origin':'*'});
			res.write('lnk:' + link);
			res.end();
		}
		let errorHandler = function(err) {
			res.writeHead(500, {'content-type': 'text/plain', 'Access-Control-Allow-Origin':'*'});
			res.write('err:' + err);
			res.end();
		}
		reqlib.getNthCommitURL(message['repo'], parseInt(message['commit'], 10), returnCallback, errorHandler);
	} else {
		res.writeHead(404, {'content-type': 'text/plain', 'Access-Control-Allow-Origin':'*'});
		res.write('404 - Not Found');
		res.end();
	}
}).listen(10000);

console.log('Server starts.');

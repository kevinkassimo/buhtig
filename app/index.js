var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res) {
	var logging = fs.open("traffic.log", "a+", function(err, fd) {
		fs.writeSync(fd, req.method + " " + req.url.toString() + "\n");
	});


	
	var message = url.parse(req.url).pathname;
	if (message.substring(0, 6) === '/fonts') {
		fs.readFile(__dirname + message, function (err, data) {
			if (err) {
				res.writeHead(500, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'*'});
				res.end('500 - Internal Error');
			} else {
				res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Access-Control-Allow-Origin':'*'});
				res.write(data);
				res.end();
			}
		});
	} else {
		fs.readFile(__dirname + '/index.html', function (err, data) {
			if (err) {
				res.writeHead(500, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'http://192.241.229.194:10000/'});
				res.end('500 - Internal Error');
			} else {
				res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin':'http://192.241.229.194:10000/'});
				res.write(data);
				res.end();
			}
		});
	}
}).listen(80);

console.log('Server started; press Ctrl-C to terminate.');

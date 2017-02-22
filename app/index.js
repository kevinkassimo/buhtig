var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res) {
	fs.readFile(__dirname + '/index.html', function (err, data) {
		if (err) {
			res.writeHead(500, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'http://192.241.229.194:100/'});
			res.end('500 - Internal Error');
		} else {
			res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin':'http://192.241.229.194:100/'});
			res.write(data);
			res.end();
		}
	});
}).listen(80);

console.log('Server started; press Ctrl-C to terminate.');
var requestor = require('../lib/req.js');

requestor.getRepoCommitCount('expressjs/express', x => console.log(x), x => console.log('ERR: '+x));
requestor.getNthCommitURL('expressjs/express', 5308, x => console.log(x), x => console.log('ERR: '+x));
requestor.getNthCommitURL('expressjs/express', 5309, x => console.log(x), x => console.log('ERR: '+x));
requestor.getNthCommitURL('kevinkassimo/SEASHelper', 1, x => console.log(x), x => console.log('ERR: '+x));
requestor.getNthCommitURL('somethingStinks/Stinky', 1, x => console.log(x), x => console.log('ERR: '+x));
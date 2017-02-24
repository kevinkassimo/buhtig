/* Thanks to @wong2 for the commit count function (sadly there seems to be no more efficient ones...)
 * https://github.com/wong2/first-commit/blob/master/app/github.js
 */
'use strict';

var http = require('http');
var cheerio = require('cheerio');
var fetch = require('node-fetch');

var github = require('./urls/github.js');
var errorcode = require('./errorcode.js');
// OAuth module for increased rate limit. This file is not public
var auth = require('../client/auth.js');

//default page size. Github requires '?page=1&per_page=100' like stuff
const PAGE_SIZE = 100;

var Dynamic = {};

Dynamic.PageFormat = {
	getItemIndexOnPage: function(index) {
		return index % PAGE_SIZE;
	},
	getPageNumberWhereItemCouldBeFound: function(index) {
		return Math.floor(index/PAGE_SIZE)+1;
	},
	formatPaging: function(index, isAppend) {
		if (isAppend === undefined) {
			isAppend = false;
		}
		let pageNum = Math.floor(index/PAGE_SIZE)+1;
		let pageItem = index % PAGE_SIZE;
		if (pageItem === 0) {
			pageItem = PAGE_SIZE;
		}
		if (isAppend) {
			return `&page=${pageNum}&per_page=${PAGE_SIZE}`;
		} else {
			return `?page=${pageNum}&per_page=${PAGE_SIZE}`;
		}
	},
	formatPagingOAuth: function(index, isAppend) {
		return auth.appendOAuth(PageFormat.formatPaging(index, isAppend));
	}
}






var PageFormat = {
	getItemIndexOnPage: function(index) {
		return index % PAGE_SIZE;
	},
	getPageNumberWhereItemCouldBeFound: function(index) {
		return Math.floor(index/PAGE_SIZE)+1;
	},
	formatPaging: function(index, isAppend) {
		if (isAppend === undefined) {
			isAppend = false;
		}
		let pageNum = Math.floor(index/PAGE_SIZE)+1;
		let pageItem = index % PAGE_SIZE;
		if (pageItem === 0) {
			pageItem = PAGE_SIZE;
		}
		if (isAppend) {
			return `&page=${pageNum}&per_page=${PAGE_SIZE}`;
		} else {
			return `?page=${pageNum}&per_page=${PAGE_SIZE}`;
		}
	},
	formatPagingOAuth: function(index, isAppend) {
		return auth.appendOAuth(PageFormat.formatPaging(index, isAppend));
	}
}


//SLOW!!! However it seems that Github's API did not provide a perfect way of finding total number of commits
//Considering improvement
//repo format: owner/repo
function getRepoCommitCount(repo, callback, err) {
	fetch(github.WEB + repo).then(function (res) {
		return res.text();
	}).then(function(body) {
		let $ = cheerio.load(body);
		let stringNum = $('.numbers-summary .commits .num').text().trim().replace(/,/, '');
		if (stringNum === '') {
			//Did not find, call err
			err(errorcode.INVALID_REPO);
		} else {
			let commitCount = parseInt(stringNum);
			callback(commitCount);
		}
	});
}

function getNthCommitURLGivenCommitCount(repo, n, commitCount, callback, err) {
	let commitURLPrefix = `${github.API_REPOS}${repo}/commits`;
	let reverseNum = commitCount - n + 1;
	if (reverseNum <= 0 || reverseNum > commitCount) {
		err(errorcode.INVALID_COMMIT);
		return;
	}
	
	fetch(`${commitURLPrefix}${PageFormat.formatPagingOAuth(reverseNum)}`).then(function (res) {
		return res.text();
	}).then(function(body) {
		let commitList = JSON.parse(body);
		//'html_url' is the corresponding url for the commit
		let pageItem = PageFormat.getItemIndexOnPage(reverseNum);
		let htmlUrl = commitList[pageItem-1]['html_url'];
		if (htmlUrl === undefined) {
			// Notice: if this is undefined, I may have exceeded the rate limit...
			err(errorcode.RATE_LIM_EXCCEED);
		} else {
			callback(htmlUrl);
		}
	});
}

// callback takes 1 argument (passing resulting URL)
function getNthCommitURL(repo, n, callback, err) {
	let internalCallback = function(commitCount) {
		getNthCommitURLGivenCommitCount(repo, n, commitCount, callback, err);
	}
	getRepoCommitCount(repo, internalCallback, err);
}

module.exports = {
	getRepoCommitCount: getRepoCommitCount,
	getNthCommitURLGivenCommitCount: getNthCommitURLGivenCommitCount,
	getNthCommitURL: getNthCommitURL
};
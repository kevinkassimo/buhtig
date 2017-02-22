/* Thanks to @wong2 for the commit count function
 * https://github.com/wong2/first-commit/blob/master/app/github.js
 */
var http = require('http');
var cheerio = require('cheerio');
var fetch = require('node-fetch');

var github = require('./urls/github.js');
// OAuth module for increased rate limit. This file is not public
var auth = require('../client/auth.js');

//default page size. Github requires '?page=1&per_page=100' like stuff
const PAGE_SIZE = 100;


//SLOW!!! However it seems that Github's API did not provide a perfect way of finding total number of commits
//Considering improvement
//repo format: owner/repo
function getRepoCommitCount(repo, callback, err) {
	if (err === undefined) {
		err = x => console.log(x);
	}
	
	fetch(auth.addOAuth(github.WEB + repo)).then(function (res) {
		return res.text();
	}).then(function(body) {
		let $ = cheerio.load(body);
		let stringNum = $('.numbers-summary .commits .num').text().trim().replace(/,/, '');
		if (stringNum === '') {
			//Did not find, call err
			err('Not a valid repository name');
		} else {
			let commitCount = parseInt(stringNum);
			callback(commitCount);
		}
	});
	
	// Unfortunately, the contributor list does NOT work, 
	// not giving correct commit count in total
	// callback takes only 1 argument
	/*
	let internalFetch = function (pageCount, commitCount, callback) {
		let contributorUrl = github.API_REPOS + repo + '/contributors';
		
		fetch(`${contributorUrl}?page=${pageCount}&per_page=${PAGE_SIZE}`).then(function(res) {
			return res.text();
		}).then(function(body) {
			let contributorList = JSON.parse(body);
			if (contributorList.length === 0) {
				callback(commitCount);
			} else {
				let localCount = 0;
				contributorList.forEach(function(contributor) {
					localCount += contributor['contributions'];
				});
				internalFetch(pageCount + 1, commitCount + localCount, callback)
			}
		});
	}
	internalFetch(1, 0, callback);
	*/
}

// callback takes 1 argument (passing resulting URL)
function getNthCommitURL(repo, n, callback, err) {
	if (err === undefined) {
		err = x => console.log(x);
	}
	
	let commitURLPrefix = `${github.API_REPOS}${repo}/commits`;
	let internalCallback = function(commitCount) {
		// we need to reverse the number since github uses reversed layout
		let reverseNum = commitCount - n + 1;
		if (reverseNum <= 0) {
			err('Not a valid commit number');
			return;
		}
		let pageNum = Math.floor(reverseNum/PAGE_SIZE)+1;
		let pageItem = reverseNum % PAGE_SIZE;
		if (pageItem === 0) pageItem = PAGE_SIZE;
		
		fetch(auth.addOAuth(`${commitURLPrefix}?page=${pageNum}&per_page=${PAGE_SIZE}`)).then(function (res) {
			return res.text();
		}).then(function(body) {
			let commitList = JSON.parse(body);
			//'html_url' is the corresponding url for the commit
			let htmlUrl = commitList[pageItem-1]['html_url'];
			if (htmlUrl === undefined) {
				// Notice: if this is undefined, I may have exceeded the rate limit...
				err('Not a valid commit number or Rate Limit Exceeds (max 5000 per hour) for this site...');
			} else {
				callback(htmlUrl);
			}
		});
	}
	getRepoCommitCount(repo, internalCallback);
}

module.exports = {
	getRepoCommitCount: getRepoCommitCount,
	getNthCommitURL: getNthCommitURL
};
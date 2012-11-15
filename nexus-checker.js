/*global Buffer console process require setTimeout*/
var https = require('https');
var url = require('url');
var nodemailer = require('nodemailer');
var argv = require('optimist')
	.usage('Periodically check the Google Play Store for 16GB Nexus 4, and send email when it\'s available.\n\nUsage: $0')
	.demand('user').demand('pass').demand('to')
	.describe('user', 'Your GMail username, in the form username@gmail.com.')
	.describe('pass', 'Your GMail password.')
	.describe('to', 'Email addresses to notify (comma-separated list).')
	.describe('interval', 'Seconds to wait between checks. Default: 120 seconds.')
	.argv;

// Configurable options
var checkInterval = (argv.interval || 120) * 1000; // ms
var emailInterval = 1800 * 1000; // ms (default: 30 minutes)

var gmailUser = argv.user;
var gmailPass = argv.pass;
var sender = gmailUser;
var recipients = argv.to.split(/, ?/);
var subject = 'Nexus 4 back in stock!!';
var storeUrl = 'https://play.google.com/store/devices/details?id=nexus_4_16gb';
var textBody = 'Check Google Play Store: ' + storeUrl;
var htmlBody = 'Check Google Play Store: <a href="' + storeUrl + '">' + storeUrl + '</a>';

// Don't change below this line
var lastEmailedTime = 0;
var lastResult = 'out';

function log(msg) {
	if (msg instanceof Error) {
		msg = msg.stack || msg.message;
	}
	console.log(new Date().toLocaleString() + ': ' + msg);
}

function instock() {
	// Send email if: state has just changed to "in stock" or the emailInterval has elapsed
	var now = new Date().getTime();
	if (lastResult === 'in' && (now - lastEmailedTime) < emailInterval) {
		console.log('Waiting ' + parseInt((lastEmailedTime + emailInterval - now)/1000.0, 10) + ' seconds before sending another email');
	} else {
		var transport = nodemailer.createTransport('SMTP', {
			service: 'Gmail',
			auth: {
				user: gmailUser,
				pass: gmailPass
			}
		});
		transport.sendMail({
			from: sender,
			to: recipients.join(', '),
			subject: subject,
			text: textBody,
			html: htmlBody
		}, function(error, responseStatus) {
			if (error) {
				log('Error: ' + error.message);
			} else {
				log('Email sent! ' + responseStatus.message);
				lastEmailedTime = new Date().getTime();
			}
			transport.close();
		});
	}
}

(function check() {
	var req = https.get(url.parse(storeUrl), function(res) { // get(string) requires node 0.8.9+ so don't use it
		res.setEncoding('utf8');
		var buf = [];
		res.on('data', function handleData(contents) {
			buf.push(contents);
			var str = buf.join('');
			if (str.indexOf('buy-hardware-button') !== -1) {
				log('In stock!');
				instock();
				lastResult = 'in';
				res.removeListener('data', handleData);
				req.end();
			} else if (str.indexOf('backorder-signup-form') !== -1 || str.indexOf('hardware-sold-out') !== -1) {
				log('not in stock');
				lastResult = 'out';
				res.removeListener('data', handleData);
				req.end();
			}
		});
	}).on('error', function(error) {
		log(error);
	});

	setTimeout(check, checkInterval);
}());

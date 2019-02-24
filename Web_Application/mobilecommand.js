'use strict';
var express         = require('express');
var  app            = express();
var path            = require('path');
var router          = express.Router();
var bodyParser      = require('body-parser');
var ejs 			= require('ejs')
app.set('view engine', 'ejs');
var mysql = require('mysql');
const config = require('./config');
const Nexmo = require('nexmo');
const socketio = require('socket.io');



// Nexmo init
const nexmo = new Nexmo({
  apiKey: config.api_key,
  apiSecret: config.api_secret,
}, {debug: true});



var enCoded = bodyParser.urlencoded({ extended: false });

var con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'mobile_database',
	multipleStatements: true
});

app.use(express.static(__dirname + '/newdesign'));

var exports = module.exports = {};

exports.Send = function(value,callback){
	var sql_string = "SELECT * FROM student WHERE student_id = " + value + ";";
	con.query(sql_string , function(err, rows, fields) {
		if (err) {
		    console.log("error ocurred",err);
		}else{
			if(rows.length >0){
				let toNumber = rows[0].phone_number;
				let text = "Your Q-STI verification: " + rows[0].verification;
				let data = {};

				// Sending SMS via Nexmo
				nexmo.message.sendSms(
					config.number, toNumber, text, {type: 'unicode'},
					(err, responseData) => {
					  if (err) {
						data = {error: err};
					  } else {
						console.dir(responseData);
						if(responseData.messages[0]['error-text']) {
						  data = {error: responseData.messages[0]['error-text']};
						} else {
						  let n = responseData.messages[0]['to'].substr(0, responseData.messages[0]['to'].length - 4) + '****';
						  data = {id: responseData.messages[0]['message-id'], number: n};
						}
					  }
					}
				);

				// Basic Number Insight - get info about the phone number
				nexmo.numberInsight.get({level:'basic', number: toNumber}, (err, responseData) => {
					if (err) console.log(err);
					else {
					  console.dir(responseData);
					}
				});
			}
			else{
				console.log("error ocurred",err);
			}
		}
	});	
	
	callback(null, value);
};

exports.Login = function(s,callback){
	var s;
	callback(null, s);
};

exports.queueline = function(s,callback){
	var s;
	callback(null, s);
};

exports.queuemanagement = function(s,callback){
	var s;
	callback(null, s);
};

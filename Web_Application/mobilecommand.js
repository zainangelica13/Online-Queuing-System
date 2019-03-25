'use strict';
var express         = require('express');
var  app            = express();
var bodyParser      = require('body-parser');
var ejs 			= require('ejs')
app.set('view engine', 'ejs');
var mysql = require('mysql');
const config = require('./config');
const Nexmo = require('nexmo');



// Nexmo init
const nexmo = new Nexmo({
  apiKey: config.api_key,
  apiSecret: config.api_secret,
}, {debug: true});



var enCoded = bodyParser.urlencoded({ extended: false });

var con = mysql.createPool({
	connectionLimit : 10,
	host: '156.67.222.90',
	user: 'u452013966_qsti',
	password: '1UjcDXOJ7G2T',
	database: 'u452013966_qsti',
	port: 3306,
	multipleStatements: true
});

app.use(express.static(__dirname + '/newdesign'));

var exports = module.exports = {};

exports.Send = function(value,callback){
	con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM student WHERE student_id = " + value + ";";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				console.log("error ocurred",err);
			}else{
				if(rows.length >0){
					let toNumber = rows[0].phone_number;
					let text = "Your Q-STI verification: " + rows[0].verification;
					let data = {};
					con.release();
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
					con.release();
				}
			}
		});	
	
	callback(null, value);
	});
};

exports.Login = function(s,callback){
		function getRandomInt(max) {
			return Math.floor(Math.random() * Math.floor(max));
		}
		
		var random = getRandomInt(3000);
		
		if (random < 1000) {
				return random;
		}
		console.log("SSID  is : "+ s);
		console.log("query is : "+ 'SELECT * from student WHERE student_id = "'+ s +'"');
		
		
		console.log("Connecting");
		con.getConnection(function(err,con){
			con.query('SELECT * from student WHERE student_id = "'+ s +'"', function(err, rows, fields) {		
				if (err) {
					console.log('error: ', err);
					throw err;
				} else {
					if(rows.length > 0){
						var str = "UPDATE student SET verification = " + random + " WHERE student_id = " + s;
						con.query(str , function(err, rows1, fields) {
							if (err) {
								console.log(err)
							}else{
								if(rows1.affectedRows == 1){
									setValue(s);
									con.release();	
								}
								else{
									con.release();	
									res.send("Try again");
									}
								}
						});	
					}
					else{
						con.release();	
						res.send("Sending no data");
					}
							
				}
		
			});
		
		
		function setValue (value) {
			var sql_string = "SELECT * FROM student WHERE student_id = " + value + ";";
			con.query(sql_string , function(err, rows, fields) {
				if (err) {
					console.log("error ocurred",err);
				}else{
					if(rows.length >0){
						let toNumber = rows[0].phone_number;
						let text = "Your Q-STI verification: " + rows[0].verification;
						let data = {};
						con.release();
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
						con.release();
					}
				}
			});	
		}
	callback(null, s);
	
	});
};

exports.queueline = function(s,callback){
	var s;
	callback(null, s);
};

exports.queuemanagement = function(s,callback){
	var s;
	callback(null, s);
};

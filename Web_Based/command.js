var express         = require('express');
var  app            = express();
var path            = require('path');
var router          = express.Router();
var bodyParser      = require('body-parser');
var ejs 			= require('ejs')
app.set('view engine', 'ejs');
var mysql = require('mysql');
var enCoded = bodyParser.urlencoded({ extended: false });
forEachNext = function(arr, foreachfn, finishfn) {
	var i = 0
	console.log(arr)
	var nextfn = function() {
		setTimeout(function() {
			if (i == arr.length) {
				if (finishfn)
					finishfn()
			} else {
				foreachfn(i, arr[i++], nextfn)
			}
		}, 0)
	}
	nextfn()
}

var con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'queue_system',
	multipleStatements: true
});

app.use(express.static(__dirname + '/Queuing_Design'));

var exports = module.exports = {};

exports.Signup = function(s,callback){
	var s;
	callback(null, s);
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

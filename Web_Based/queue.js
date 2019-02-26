var express         = require('express');
var  app            = express();
var path            = require('path');
var router          = express.Router();
var bodyParser      = require('body-parser');
var ejs 			= require('ejs')
var session 		= require('express-session');
app.set('view engine', 'ejs');
var mysql = require('mysql');
//var crud = require("./crud.js");
var command = require("./command.js");
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
app.use(session({
			name: 'id_no',
		    secret: '1234',
		    resave: false,
		    saveUninitialized: false
		}));

var sess;

app.get('/', function(req, res) {
	sess = req.session;

	if (sess.id_no) {
		var filename = __dirname + '/Queuing_Design/index.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	} else {
		var filename = __dirname + '/Queuing_Design/login.ejs';
		var options = {}
	    var data = {studentnumber: '',password: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	}
});

app.get('/logout', function(req, res) {
	
	req.session.destroy(function(err){
		if (err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
		
	})
	
});

app.get('/signup', function(req,res) {

	var filename = __dirname + '/Queuing_Design/signup.ejs';
	var options = {}
	var data = {rel: ''}
	ejs.renderFile(filename, data, options, function(err, str){
		res.send(str);
	});
});

app.get('/back', function(req,res) {
	res.redirect('/');
});

app.post('/back', enCoded, function(req,res) {
	var idnumber= req.body.id_no;
	var name = req.body.name;
	var designation= req.body.designation;
	var pass = req.body.pass;
	var validator = req.body.validator;
	
	var sql_string = "SELECT id_number FROM users WHERE id_number = "+idnumber+";";
		con.query(sql_string , function(err, rows, fields)
		{
			if (err) {
				console.log('Error!');
			} else {
				if(rows.length > 0) {
					data = {
						allow: false,
						msg:'ID number already exist!'
					}
					res.send(data);
				} else {
					if (validator == 'false') {
						var data = {allow: true}
						res.send(data);
					} else {
						var sql_string = "INSERT INTO users VALUES ('"+idnumber+"','"+name+"','"+designation+"','"+pass+"');";
							con.query(sql_string , function(err, rows, fields)
							{
								if (err) {
									console.log('Error!');
								}
								else {
									res.redirect('/');
								}
							});
					}
				}
			}
		});	
});

app.get('/login', function(req,res) {
	res.redirect('/');
});

app.post('/login', enCoded, function(req,res) {

	var obj = {
		id_no:req.body.id_no,
		pass:req.body.pass,
		validator:req.body.validator
	};
	sess = req.session;
	sess.id_no = obj.id_no;
	sess.designation;
	req.session.save();
	console.log(sess.id_no+'\n')

	if (sess.id_no) {
		var sql_string = "SELECT * FROM users WHERE id_number = "+sess.id_no+";";
			con.query(sql_string , function(err, rows, fields)
			{
				if (err) {
					console.log('Error!');
				} else {
					if(rows.length > 0) {
						if(rows[0].password == obj.pass){
							if (obj.validator == 'false') {
								var data = {allow: true}
								res.send(data);
							} else {
								sess.designation = rows[0].designation.charAt(0);
								console.log(sess.designation);
								res.redirect('/');
							}
							
						} else {
							data = {
								allow: false,
								msg:'Id number and password does not match!'
							}
							res.send(data)
						}
						 
					} else {
						data = {
							allow: false,
							msg:'Id number does not exist!'
						}
						res.send(data)
					}
				}
			});	
	} else {
		res.redirect('/');
	}
	
});

app.get('/queue_line', enCoded, function(req,res) {

	sess = req.session;

	if (sess.id_no) {
		var filename = __dirname + '/Queuing_Design/queue_line.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	} else {
		res.redirect('/');
	}
		
});

app.get('/queue_management', enCoded, function(req,res) {

	sess = req.session;

	if (sess.id_no) {
		var filename = __dirname + '/Queuing_Design/queue_management.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	} else {
		res.redirect('/');
	}
});	

app.post('/print', enCoded, function(req,res) {

	sess = req.session;

	var qr_code= req.body.qr_code;
	var validator = req.body.validator;

	if (sess.id_no) {
		var sql_string = "SELECT date FROM queue_lines WHERE date = CURDATE();";
			con.query(sql_string , function(err, rows, fields)
			{
				if (err) {
					console.log('Error!');
				} else {
					if(rows.length > 0) {
						data = {
							allow:false,
							msg:'QR Code already printed this day!'
						}
						res.send(data);
					} else {
						if (validator == 'false') {
							var data = {allow: true}
							res.send(data);
						} else {
							var sql_string = "INSERT INTO queue_lines VALUES ( CURDATE(), '"+qr_code+"', '100','0','0','0','0');";
								con.query(sql_string , function(err, rows, fields)
								{
									if (err) {
										console.log('Error!');
									}
									else {
										res.redirect('/');
									}
								});
						}
					}
				}
			});	
	} else {
		res.redirect('/');
	}
});

var remaining;
app.get('/update', enCoded, function(req,res) {

	sess = req.session;
	if (sess.id_no) {
		var sql_string = "SELECT queue_remaining, `"+sess.designation+".queue_serving` FROM queue_lines WHERE date = CURDATE();";
			con.query(sql_string , function(err, rows, fields)
			{
				if (err) {
					console.log('Error! '+ sql_string);
				} else {
					if(rows.length > 0) {
						remaining = 101 - rows[0].queue_remaining;
						data = {
							available: remaining,
							serving:rows[0][sess.designation+".queue_serving"]
						}
						res.send(data);
					} else {
						data = {
							available:'Please Generate QR Code first',
							serving:0
						}
						res.send(data)
					}
				}
			});
	} else {
		res.redirect('/');
	}
	
});

app.post('/start', enCoded, function(req,res) {

	sess = req.session;
	var serving = req.body.serving;

	console.log('start!');
	if (sess.id_no) {	
		if (serving < remaining - 1) {
			serving++;
			var sql_string = "UPDATE queue_lines SET `"+sess.designation+".queue_serving` = '"+ serving +"' WHERE date = CURDATE();";
				con.query(sql_string , function(err, rows, fields)
				{
					if (err) {
						console.log(sql_string);

						console.log('Error!');
					} else { 
						data = {
							available: remaining,
							serving: serving
						}
						res.send(data)
						console.log(serving);
					}
				});
		} else {
			data = {
				msg : 'Next queue number is not taken yet.'
			}
		}
	} else {
		res.redirect('/');
	}
	
});
app.listen(3000);
console.log("App is listening on port 3000");	
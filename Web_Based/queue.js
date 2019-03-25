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

var con = mysql.createPool({
	connectionLimit : 10,
	host: '156.67.222.90',
	user: 'u452013966_qsti',
	password: '1UjcDXOJ7G2T',
	database: 'u452013966_qsti',
	port: 3306,
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
		if (sess.designation == 'Administrator') {
			var filename = __dirname + '/Queuing_Design/admin.ejs';
			var options = {}
		    var data = {rel: ''}
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});
		} else {								
			var filename = __dirname + '/Queuing_Design/index.ejs';
			var options = {}
			var data = {rel: ''}
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});
		}
	} else {
		var filename = __dirname + '/Queuing_Design/login.ejs';
		var options = {}
	    var data = {rel: ''}
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
	var id_no= req.body.id_no;
	var name = req.body.name;
	var designation= req.body.designation;
	var password = req.body.password;
	con.getConnection(function(err,con){
	var sql_string = "SELECT id_number FROM users WHERE id_number = "+id_no+";";
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
					con.release();
					res.send(data);
				} else {
					var sql_string = "INSERT INTO users VALUES ('"+id_no+"','"+name+"','"+designation+"','"+password+"');";
						con.query(sql_string , function(err, rows, fields)
						{
							if (err) {
								console.log('Error!');
							}
							else {
								var data ={msg:"Sign up success"}
								con.release();
								res.send(data);
							}
						});
				}
			}
		});	
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
	if (sess.id_no) {
		con.getConnection(function(err,con){
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
								con.release();
								res.send(data);
							} else {
								sess.designation = rows[0].designation;
								console.log(sess.id_no+"\t"+sess.designation)	
								con.release();
								res.redirect('/');
								
							}
						} else {
							data = {
								allow: false,
								msg:'Id number and password does not match!'
							}
							con.release();
							res.send(data)
						}
					} else {
						data = {
							allow: false,
							msg:'Id number does not exist!'
						}
						con.release();
						res.send(data)
					}
				}
			});

	});			
	} else {
		res.redirect('/');
	}
});

app.get('/queue_line', enCoded, function(req,res) {

	sess = req.session;

	if (sess.id_no) {
		if (sess.designation == 'Administrator') {
			var filename = __dirname + '/Queuing_Design/employees.ejs';
			var options = {}
		    var data = {rel: ''}
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});
		} else {								
			var filename = __dirname + '/Queuing_Design/queue_line.ejs';
			var options = {}
			var data = {rel: ''}
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});
		}
	} else {
		res.redirect('/');
	}
		
});

app.get('/queue_management', enCoded, function(req,res) {

	sess = req.session;

	if (sess.id_no) {
		if (sess.designation == 'Administrator') {
			var filename = __dirname + '/Queuing_Design/students.ejs';
			var options = {}
		    var data = {rel: ''}
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});
		} else {								
			var filename = __dirname + '/Queuing_Design/queue_management.ejs';
			var options = {}
			var data = {rel: ''}
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});
		}
	} else {
		res.redirect('/');
	}
});	

app.get('/user_level', enCoded, function(req,res) {

	sess = req.session;

	data = {user:sess.designation}
	res.send(data)
});

app.post('/print', enCoded, function(req,res) {

	sess = req.session;

	var qr_code= req.body.qr_code;
	var validator = req.body.validator;

	var date = new Date();
	var datenow = date.toDateString();

	if (sess.id_no) {
		if (sess.designation=='cashier') {
			con.getConnection(function(err,con){
			var sql_string = "SELECT date FROM queue_management WHERE date = '"+datenow+"';";
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
							con.release();
							res.send(data);
						} else {
							if (validator == 'false') {
								var data = {
									user_level: sess.designation,
									allow: true
								}
								con.release();
								res.send(data);
							} else {
								var sql_string = "UPDATE queue_management SET date = '"+datenow+"', qr_code = '"+qr_code+"' WHERE date != '"+datenow+"';";
									con.query(sql_string , function(err, rows, fields)
									{
										if (err) {
											console.log(err);
										}
										else {
											var sql_string = "UPDATE cashier, registrar, enrollment, proware "
															+"SET cashier.queue_line=0, cashier.current_number=0, " 
															+"registrar.queue_line=0, registrar.current_number=0, " 
															+"enrollment.queue_line=0, enrollment.current_number=0, "
															+"proware.queue_line=0, proware.current_number=0;";
												con.query(sql_string , function(err, rows, fields)
												{
													if (err) {
														console.log(err);
													}
													else {
														con.release();
														res.redirect('/');
													}
												});
										}
									});
							}
						}
					}
				});	
			});
		} else {
			var data = {
				user_level: sess.designation,
				msg: "QR Code must printed by the Cashier only."
			}
			res.send(data);
		}
		
	} else {
		res.redirect('/');
	}
});

var remaining;
app.get('/update', enCoded, function(req,res) {

	sess = req.session;

	var date = new Date();
	var datenow = date.toDateString();

	if (sess.id_no) {
		con.getConnection(function(err,con){
		var sql_string = "SELECT date FROM queue_management WHERE date = '"+datenow+"';";
			con.query(sql_string , function(err, rows, fields)
			{
				if (err) {
					console.log('Error!');
				} else {
					if(rows.length > 0) {
						var sql_string = "SELECT * FROM "+sess.designation+";";
						con.query(sql_string , function(err, rows, fields)
						{
							if (err) {
								console.log('Error!');
							} else {
								if(rows.length > 0) {
									remaining = rows[0].queue_line + 1;
									data = {
										available: remaining,
										serving:rows[0].current_number
									}
									con.release();
									res.send(data);
								} else {
									con.release();
									console.log('Data not found!');
								}
							}
						});
					} else {
						data = {
							available:'Please Generate QR Code first',
							serving:0
						}
						con.release();
						res.send(data)
					}
				}
			});
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
					con.getConnection(function(err,con){
			var sql_string = "UPDATE "+sess.designation+" SET current_number = "+ serving +" WHERE current_number != "+ serving +";";
				con.query(sql_string , function(err, rows, fields)
				{
					if (err) {
						console.log('Error!');
					} else { 
						data = {
							available: remaining,
							serving: serving
						}
						con.release();
						res.send(data)
						console.log(serving);
					}
				});
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

app.get('/students', enCoded, function(req,res) {
			con.getConnection(function(err,con){
	var sql_string = "SELECT * FROM student;";
		con.query(sql_string , function(err, rows, fields)
		{
			if (err) {
				console.log('Error!');
			} else {
				if(rows.length > 0) {
					var id_val = new Array();
					var name_val = new Array()
					var course_val = new Array()
					var phone_number_val = new Array()
					for(var ctr=0; ctr<rows.length;ctr++) {
						id_val[ctr] = rows[ctr].student_id;
						name_val[ctr] = rows[ctr].name;
						course_val[ctr] = rows[ctr].course;
						phone_number_val[ctr] = rows[ctr].phone_number;
					}
					data = {
						table: rows.length,
						id_col: {id_val},
						name_col: {name_val},
						course_col: {course_val},
						phone_number_col: {phone_number_val}
					}
					con.release();
					res.send(data);
				} else {
					console.log('Error')
				}
			}
		});	
			});
});

app.post('/student_insert', enCoded, function(req,res) {
	var id_no= req.body.id_no;
	var name = req.body.name;
	var course= req.body.course;
	var phone_number = req.body.phone_number;
			con.getConnection(function(err,con){
	var sql_string = "SELECT student_id FROM student WHERE student_id = "+id_no+";";
		con.query(sql_string , function(err, rows, fields)
		{
			if (err) {
				console.log('Error!');
			} else {
				if(rows.length > 0) {
					data = {
						allow: false,
						msg:'ID number already registered!'
					}
					con.release();
					res.send(data);
				} else {
					var sql_string = "INSERT INTO student (student_id, name, course, phone_number) VALUES ('"+id_no+"','"+name+"','"+course+"','"+phone_number+"');";
						con.query(sql_string , function(err, rows, fields)
						{
							if (err) {
								console.log('Error!');
							}
							else {
								var data ={msg:"Sign up success"}
								con.release();
								res.send(data);
							}
						});
				}
			}
			});	
			});
});
app.post('/student_edit', enCoded, function(req,res) {

	id_no= req.body.id_no;
		con.getConnection(function(err,con){

	var sql_string = "SELECT * FROM student WHERE student_id='"+id_no+"';";
		con.query(sql_string , function(err, rows, fields)
		{	
			if (err) {
				console.log('Error!');
			} else {
				if(rows.length > 0) {
					data = {
						id_col: rows[0].student_id,
						name_col: rows[0].name,
						course_col: rows[0].course,
						phone_number_col: rows[0].phone_number
					}
					con.release();
					res.send(data);
				} else {
					con.release();
					console.log('Error')
				}
			}
		});	
		});
});

app.post('/student_update', enCoded, function(req,res) {

	id_no= req.body.id_no;
	name= req.body.name;
	course= req.body.course;
	phone_number= req.body.phone_number;
		con.getConnection(function(err,con){

	var sql_string = "UPDATE student SET name='"+name+"', course='"+course+"', phone_number='"+phone_number+"' WHERE student_id='"+id_no+"';";
		con.query(sql_string , function(err, rows, fields)
		{	
			if (err) {
				console.log('Error!');
			} else {
				data = {msg:'Student Data Updated!'};
				con.release();
				res.send(data);
			}
		});	
		});
});

app.post('/student_delete', enCoded, function(req,res) {

	id_no= req.body.id_no;
		con.getConnection(function(err,con){

	var sql_string = "DELETE FROM student WHERE student_id='"+id_no+"';";
		con.query(sql_string , function(err, rows, fields)
		{	
			if (err) {
				console.log('Error!');
			} else {
				data = {msg:'Student Deleted Successfully'};
				con.release();
				res.send(data);
			}
		});	
		});
});

app.get('/employees', enCoded, function(req,res) {
			con.getConnection(function(err,con){

	var sql_string = "SELECT * FROM users;";
		con.query(sql_string , function(err, rows, fields)
		{
			if (err) {
				console.log('Error!');
			} else {
				if(rows.length > 0) {
					var id_val = new Array();
					var name_val = new Array()
					var designation_val = new Array()
					var password_val = new Array()
					for(var ctr=0; ctr<rows.length;ctr++) {
						id_val[ctr] = rows[ctr].id_number;
						name_val[ctr] = rows[ctr].name;
						designation_val[ctr] = rows[ctr].designation;
					}
					data = {
						table: rows.length,
						id_col: {id_val},
						name_col: {name_val},
						designation_col: {designation_val}
					}
					con.release();
					res.send(data);
				} else {
					con.release();
					console.log('Error')
				}
			}
		});	
			});
});

app.post('/employees_edit', enCoded, function(req,res) {

	id_no= req.body.id_no;
		con.getConnection(function(err,con){

	var sql_string = "SELECT * FROM users WHERE id_number='"+id_no+"';";
		con.query(sql_string , function(err, rows, fields)
		{	
			if (err) {
				console.log('Error!');
			} else {
				if(rows.length > 0) {
					data = {
						id_col: rows[0].id_number,
						name_col: rows[0].name,
						designation_col: rows[0].designation
					}
					con.release();
					res.send(data);
				} else {
					con.release();
					console.log('Error')
				}
			}
		});	
		});
});

app.post('/employees_update', enCoded, function(req,res) {

	id_no= req.body.id_no;
	name= req.body.name;
	designation= req.body.designation;
	console.log(id_no)
			con.getConnection(function(err,con){

	var sql_string = "UPDATE users SET name='"+name+"', designation='"+designation+"' WHERE id_number='"+id_no+"';";
		con.query(sql_string , function(err, rows, fields)
		{	
			if (err) {
				console.log('Error!');
			} else {
				data = {msg:'User Data Updated!'};
				con.release();
				res.send(data);
			}
		});	
			});
});

app.post('/employees_delete', enCoded, function(req,res) {

	id_no= req.body.id_no;
		con.getConnection(function(err,con){

	var sql_string = "DELETE FROM users WHERE id_number='"+id_no+"';";
		con.query(sql_string , function(err, rows, fields)
		{	
			if (err) {
				console.log('Error!');
			} else {
				data = {msg:'User Deleted Successfully'};
				con.release();
				res.send(data);
			}
		});
		});		
});

var port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});	
var express         = require('express');
var session = require("express-session");
var app            = express();
var path            = require('path');
var router          = express.Router();
var bodyParser      = require('body-parser');
var ejs 			= require('ejs');
app.set('view engine', 'ejs');
var mysql = require('mysql');
const config = require('./config');
const Nexmo = require('nexmo');
module.exports = router;
const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
var command = require("./mobilecommand.js");
const io = require('socket.io')(server);

// Nexmo init
const nexmo = new Nexmo({
  apiKey: config.api_key,
  apiSecret: config.api_secret,
}, {debug: true});

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
	database: 'mobile_database',
	multipleStatements: true
});

var middleWare = session({
	name: 'studentid',
	secret: '1234',
	resave: false,
	saveUninitialized: false
});
	
io.use(function(socket,next) {
	middleWare(socket.request, socket.request.res, next);
});

app.use(middleWare);

app.use(express.static(__dirname + '/newdesign'));
var sess;
app.get('/', function(req, res) {
	sess = req.session;
	console.log(sess.studentid);
	if(req.session.studentid) {
		var sql_string = "SELECT * FROM student WHERE student_id = "+ sess.studentid +";";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				console.log('Error!');
			}else{
				if(rows.length >0){
					if (rows[0].current_number != null){
						var filename = __dirname + '/newdesign/cashier.ejs';
						var options = {}
						var data = {studentnumber: '',passwords: ''}
						ejs.renderFile(filename, data, options, function(err, str){
						res.send(str);
						});
					}
					else {
						var filename = __dirname + '/newdesign/home.ejs';
						var options = {}
						var data = {studentnumber: '',passwords: ''}
						ejs.renderFile(filename, data, options, function(err, str){
						res.send(str);
						});
					}
				}
				else{
					res.send({
						"code":204,
						"success":"Email does not exits"
					});
				}
			}
		});	
	}
	
	//I use home to debug the error in home. Change it into login.ejs 
	var filename = __dirname + '/newdesign/login.ejs';
	var options = {}
    var data = {studentnumber: '',passwords: ''}
	ejs.renderFile(filename, data, options, function(err, str){
	res.send(str);
	});
});

app.get('/send', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/send', enCoded, function(req,res) {
	var obj = {
		sid:req.body.studentID,
		validator:req.body.validator
	};
	sess = req.session;
	sess.studentid=obj.sid;
	//sess.studentid=req.body.studentID;
	req.session.save();
	console.log(obj.sid)
	
	function getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	
	var random = getRandomInt(3000);
	
	if (random < 1000) {
			return random;
	}
	
	var sql_string = "SELECT * FROM student WHERE student_id = " + sess.studentid + ";";
	con.query(sql_string , function(err, rows, fields) {
		if (err) {
			console.log(err)
		}else{
			if(rows.length >0){
				if(rows[0].student_id == obj.sid){
					if (obj.validator == 'false') {
						var data = {allow: true}
						res.send(data);
					} else {
						var str = "UPDATE student SET verification = " + random + " WHERE student_id = " + sess.studentid;
						con.query(str , function(err, rows1, fields) {
							if (err) {
								console.log(err)
							}else{
								if(rows1.affectedRows == 1){
									setValue(sess.studentid);
								}
								else{
									data = {
										allow: false,
										msg:'Try Again!'
									}
									res.send(data)
								}
							}
						});	
					}		
				} else {
					data = {
						allow: false,
						msg:'Id number and password does not match!'
					}
					res.send(data)
				}
			}
			else{
				data = {
					allow: false,
					msg:'Student ID number does not exist!'
				}
				res.send(data)
			}
		}
	});	
	
	function setValue (value) {
		//set home.ejs to verifylogin.ejs
		command.Send(value,function(err,results){
			var filename = __dirname + '/newdesign/verifylogin.ejs';
			var options = {}
			var data = {studentnumber: '',passwords: ''}
			ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
			});
	});
	}
	
});

app.get('/login', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/login', enCoded, function(req,res) {
	var obj = {
		vfy:req.body.Id,
		validator:req.body.validator
	};
	var verify = obj.vfy;
	var sql_string = "SELECT * FROM student WHERE verification = " + verify + ";";
	con.query(sql_string , function(err, rows, fields) {
		if (err) {
			data = {
				allow: false,
				msg:'Wrong verification code!'
			}
			res.send(data)
		}else{
			// console.log('The solution is: ', results);
			if(rows.length >0){
				if(rows[0].verification == verify){
					if (obj.validator == 'false') {
						var data = {allow: true}
						res.send(data);
					} else {
						var filename = __dirname + '/newdesign/home.ejs';
						var options = {}
						var data = {studentnumber: '',passwords: ''}
						ejs.renderFile(filename, data, options, function(err, str){
							res.send(str);
						});
					}
				}
			}
			else{
				data = {
					allow: false,
					msg:'Wrong verification code!'
				}
				res.send(data)
			}
		}
	});	
});

app.get('/signup', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/signup', enCoded, function(req,res) {
	var id = req.body.id;
	var contact = req.body.number;
	var number = contact.replace('0','63');
	console.log(number);
	
	var sql_string = "UPDATE student SET phone_number = "+ number + " WHERE student_id = " + id;
	con.query(sql_string , function(err, rows, fields) {
		if (err) {
		  // console.log("error ocurred",error);
			res.send({
			"code":400,
			"failed":"error ocurred"
			})
		}else{
				var filename = __dirname + '/newdesign/login.ejs';
				var options = {}
				var data = {studentnumber: '',passwords: ''}
				ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
				});
		}
	});
});

app.get('/home', function(req,res) {
	sess= req.session;
	console.log(req.session);
	
	var filename = __dirname + '/newdesign/home.ejs';
	var options = {}
	var data = {rel: ''}
	ejs.renderFile(filename, data, options, function(err, str){
		res.send(str);
	});
});

app.get('/logout', function(req,res) {
	sess =req.session;
	req.session.destroy();
	console.log(sess.studentid)
		var filename = __dirname + '/newdesign/login.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
});

app.get('/back', function(req,res,html) {
	var filename = __dirname + '/newdesign/home.ejs';
	var options = {}
	var data = {rel: ''}
	ejs.renderFile(filename, data, options, function(err, str){
		res.send(str);
	});
});

app.get('/done', function(req,res,html) {
	sess = req.session;
	var str = "UPDATE student SET queue_number = null, counter = null WHERE student_id = "+ sess.studentid +"";
	con.query(str , function(err, rows2, fields) {
		if (err) {
			res.send({
				"code":400,
				"failed":"error ocurred"
			})
		}
		var filename = __dirname + '/newdesign/home.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	});	
	
});

app.get('/cancel', function(req,res,html) {
	var bt = req.query.cnl;
	var btn = req.query.counter;
	console.log("counter: ",bt);
	var sql_string = "SELECT * FROM student";
	con.query(sql_string , function(err, rows1, fields) {
		for (var i = 0; i < rows1.length; i++) {
			if(rows1[i].queue_number > btn){
				var x = rows1[i].queue_number - 1;
				var str = "UPDATE student SET queue_number = " + x + " WHERE queue_number = "+ rows1[i].queue_number +"";
				con.query(str , function(err, rows2, fields) {
					if (err) {
						res.send({
							"code":400,
							"failed":"error ocurred"
						})
					}
				});	
			}
			if(rows1[i].queue_number == btn){
				var str = "UPDATE student SET queue_number = null, counter = null WHERE queue_number = "+ rows1[i].queue_number +"";
				con.query(str , function(err, rows2, fields) {
					if (err) {
						res.send({
							"code":400,
							"failed":"error ocurred"
						})
					}
				});	
			}
		}
		
		var str = "SELECT * FROM "+ bt +"";
		con.query(str , function(err, rows2, fields) {
			var x = rows2[0].queue_line - 1;
			if (err) {
				res.send({
					"code":400,
					"failed":"error ocurred"
				})
			} else {
				var str = "UPDATE "+ bt +" SET queue_line = " + x + "";
				con.query(str , function(err, rows, fields) {
					if (err) {
						res.send({
							"code":400,
							"failed":"error ocurred"
						})
					}
					else {
						var filename = __dirname + '/newdesign/home.ejs';
						var options = {}
						var data = {rel: ''}
						ejs.renderFile(filename, data, options, function(err, str){
							res.send(str);
						});
					}
				});
			}
		});	
	});
});

app.get('/Cashier', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/Cashier', enCoded, function(req,res) {
	var qr =  req.body.qr;
	//Remove comment for session
	sess= req.session;
	console.log(sess.studentid);
	
	//comment this variable
	//var stdnt = "10000125512";
	var sql_string = "SELECT * FROM queue_management WHERE qr_code = " + qr + ";";
	sql_string += "SELECT * FROM cashier;";
	con.query(sql_string , function(err, rows, fields) {
		var q = rows[1][0].queue_line;
		var queue = parseInt(q) + 1;
		var current_number = rows[1][0].current_number;
		console.log(q,current_number);
		if (err) {
			res.send({
			"code":400,
			"failed":"error ocurred at 1"
			})
		}else{
			if(rows.length >0){
				if(queue <= 80) {
					var sql_string = "SELECT * FROM student WHERE student_id = " + sess.studentid + ";";
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
						if (err) {
							res.send({
							"code":400,
							"failed":"error ocurred"
							})
						} else if (ownqueue == null) {
							//change the stdnt to sess.studentid
							var sql_string = "UPDATE student SET counter = 'cashier', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
							con.query(sql_string , function(err, rows1, fields) {
								if (err) {
									res.send({
									"code":400,
									"failed":"error ocurred"
									})
								}else{
									if(rows1.affectedRows == 1){
										var str = "UPDATE cashier SET queue_line = " + queue + "";
										con.query(str , function(err, rows2, fields) {
										if (err) {
											res.send({
											"code":400,
											"failed":"error ocurred"
											})
										}else{
											if(rows1.affectedRows == 1){
												var filename = __dirname + '/newdesign/cashier.ejs';
												var options = {}
												var data = {rel: 'cashier'}
												ejs.renderFile(filename, data, options, function(err, str){
													res.send(str);
												});	
											}
											else{
												console.log();
													res.send({
													"code":204,
													"success":"Email does not exits"
												});
											}
										}
										});
									}
									else{
										res.send({
										"code":204,
										"success":"Email does not exits"
										});
									}
								}
							});
						}else{
							var filename = __dirname + '/newdesign/cashier.ejs';
							var options = {}
							var data = {rel: 'cashier'}
							ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
							});
						}
					});
				}
				else{
					res.send({
					"code":204,
					"success":"Email does not exits"
					});
				}
			}
		}
	});	
});

app.get('/enrollment', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/enrollment', enCoded, function(req,res) {
	var qr =  req.body.qr;
	//Remove comment for session
	sess= req.session;
	console.log(sess.studentid);
	
	//remove this variable
	//var stdnt = "10000125512";
	var sql_string = "SELECT * FROM queue_management WHERE qr_code = " + qr + ";";
	sql_string += "SELECT * FROM enrollment;";
	con.query(sql_string , function(err, rows, fields) {
		var q = rows[1][0].queue_line;
		var queue = parseInt(q) + 1;
		var current_number = rows[1][0].current_number;
		console.log(q,current_number);
		if (err) {
			res.send({
			"code":400,
			"failed":"error ocurred at 1"
			})
		}else{
			if(rows.length >0){
				if(queue <= 80) {
					var sql_string = "SELECT * FROM student WHERE student_id = " + sess.studentid + ";";
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
						if (err) {
							res.send({
							"code":400,
							"failed":"error ocurred"
							})
						} else if (ownqueue == null) {
							//change the stdnt to sess.studentid
							var sql_string = "UPDATE student SET counter = 'enrollment', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
							con.query(sql_string , function(err, rows1, fields) {
								if (err) {
									res.send({
									"code":400,
									"failed":"error ocurred"
									})
								}else{
									if(rows1.affectedRows == 1){
										var str = "UPDATE enrollment SET queue_line = " + queue + "";
										con.query(str , function(err, rows2, fields) {
										if (err) {
											res.send({
											"code":400,
											"failed":"error ocurred"
											})
										}else{
											if(rows1.affectedRows == 1){
												var filename = __dirname + '/newdesign/cashier.ejs';
												var options = {}
												var data = {rel: 'enrollment'}
												ejs.renderFile(filename, data, options, function(err, str){
													res.send(str);
												});	
											}
											else{
												console.log();
													res.send({
													"code":204,
													"success":"Email does not exits"
												});
											}
										}
										});
									}
									else{
										res.send({
										"code":204,
										"success":"Email does not exits"
										});
									}
								}
							});
						}else{
							var filename = __dirname + '/newdesign/cashier.ejs';
							var options = {}
							var data = {rel: 'enrollment'}
							ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
							});
						}
					});
				}
				else{
					res.send({
					"code":204,
					"success":"Email does not exits"
					});
				}
			}
		}
	});	
});

app.get('/registrar', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/registrar', enCoded, function(req,res) {
	var qr =  req.body.qr;
	//Remove comment for session
	sess= req.session;
	console.log(sess.studentid);
	
	//remove this variable
	//var stdnt = "10000125512";
	var sql_string = "SELECT * FROM queue_management WHERE qr_code = " + qr + ";";
	sql_string += "SELECT * FROM registrar;";
	con.query(sql_string , function(err, rows, fields) {
		var q = rows[1][0].queue_line;
		var queue = parseInt(q) + 1;
		var current_number = rows[1][0].current_number;
		console.log(q,current_number);
		if (err) {
			res.send({
			"code":400,
			"failed":"error ocurred at 1"
			})
		}else{
			if(rows.length >0){
				if(queue <= 80) {
					var sql_string = "SELECT * FROM student WHERE student_id = " + sess.studentid + ";";
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
						if (err) {
							res.send({
							"code":400,
							"failed":"error ocurred"
							})
						} else if (ownqueue == null) {
							//change the stdnt to sess.studentid
							var sql_string = "UPDATE student SET counter = 'registrar', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
							con.query(sql_string , function(err, rows1, fields) {
								if (err) {
									res.send({
									"code":400,
									"failed":"error ocurred"
									})
								}else{
									if(rows1.affectedRows == 1){
										var str = "UPDATE registrar SET queue_line = " + queue + "";
										con.query(str , function(err, rows2, fields) {
										if (err) {
											res.send({
											"code":400,
											"failed":"error ocurred"
											})
										}else{
											if(rows1.affectedRows == 1){
												var filename = __dirname + '/newdesign/cashier.ejs';
												var options = {}
												var data = {rel: 'registrar'}
												ejs.renderFile(filename, data, options, function(err, str){
													res.send(str);
												});	
											}
											else{
												console.log();
													res.send({
													"code":204,
													"success":"Email does not exits"
												});
											}
										}
										});
									}
									else{
										res.send({
										"code":204,
										"success":"Email does not exits"
										});
									}
								}
							});
						}else{
							var filename = __dirname + '/newdesign/cashier.ejs';
							var options = {}
							var data = {rel: 'registrar'}
							ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
							});
						}
					});
				}
				else{
					res.send({
					"code":204,
					"success":"Email does not exits"
					});
				}
			}
		}
	});	
});

app.get('/proware', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/proware', enCoded, function(req,res) {
	var qr =  req.body.qr;
	//Remove comment for session
	sess= req.session;
	console.log(sess.studentid);
	
	//remove this variable
	//var stdnt = "10000125512";
	var sql_string = "SELECT * FROM queue_management WHERE qr_code = " + qr + ";";
	sql_string += "SELECT * FROM proware;";
	con.query(sql_string , function(err, rows, fields) {
		var q = rows[1][0].queue_line;
		var queue = parseInt(q) + 1;
		var current_number = rows[1][0].current_number;
		console.log(q,current_number);
		if (err) {
			res.send({
			"code":400,
			"failed":"error ocurred at 1"
			})
		}else{
			if(rows.length >0){
				if(queue <= 80) {
					var sql_string = "SELECT * FROM student WHERE student_id = " + sess.studentid + ";";
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
						if (err) {
							res.send({
							"code":400,
							"failed":"error ocurred"
							})
						} else if (ownqueue == null) {
							//change the stdnt to sess.studentid
							var sql_string = "UPDATE student SET counter = 'proware', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
							con.query(sql_string , function(err, rows1, fields) {
								if (err) {
									res.send({
									"code":400,
									"failed":"error ocurred"
									})
								}else{
									if(rows1.affectedRows == 1){
										var str = "UPDATE proware SET queue_line = " + queue + "";
										con.query(str , function(err, rows2, fields) {
										if (err) {
											res.send({
											"code":400,
											"failed":"error ocurred"
											})
										}else{
											if(rows1.affectedRows == 1){
												var filename = __dirname + '/newdesign/cashier.ejs';
												var options = {}
												var data = {rel: 'proware'}
												ejs.renderFile(filename, data, options, function(err, str){
													res.send(str);
												});	
											}
											else{
												console.log();
													res.send({
													"code":204,
													"success":"Email does not exits"
												});
											}
										}
										});
									}
									else{
										res.send({
										"code":204,
										"success":"Email does not exits"
										});
									}
								}
							});
						}else{
							var filename = __dirname + '/newdesign/cashier.ejs';
							var options = {}
							var data = {rel: 'proware'}
							ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
							});
						}
					});
				}
				else{
					res.send({
					"code":204,
					"success":"Email does not exits"
					});
				}
			}
		}
	});	
});

app.post('/queue', enCoded, function(req,res) {	
	var btn = req.body.Ticket;
	console.log(btn);
	
	var filename = __dirname + '/newdesign/enrollment.ejs';
	var options = {}
	var data = {rel: btn}
	ejs.renderFile(filename, data, options, function(err, str){
		res.send(str);
	});
});	

app.get('/slot', function(req,res) {
		res.render('command', {qs: req.query});
	});
app.post('/slot', enCoded, function(req,res) {
	//Remove comment for session
	sess= req.session;
	console.log(sess.studentid);
	var obj = {
		date:req.body.dte,
		table:req.body.tab,
		validator:req.body.validator
	};
	var date = obj.date;
	var table = obj.table;
	console.log(table,date);
	
	//remove this variable
	//var stdnt = "10000125512";
	//change the stdnt to sess.studentid
	console.log(sess.studentid)
	
	var sql_string = "SELECT * FROM reservation WHERE student_id = " + sess.studentid + ";";
	con.query(sql_string , function(err, rows, fields) {
		var slot = rows[0].slot;
		console.log(slot)
		if (err){
			data = {
				allow: false,
				msg:'No student ID'
			}
			res.send(data)
		} else if (!rows.length) {
			if (obj.validator == 'false') {
						var data = {allow: true}
						res.send(data);
			} else {
				var sql_string3 = "INSERT INTO reservation (slot,date,counter,student_id) VALUES ('','"+date+"','" +table+ "','" +sess.studentid+ "')";
				con.query(sql_string3 , function(err, rows, fields) {
					if (err) {
						data = {
							allow: false,
							msg:'Error inserting into reservation!'
						}
						res.send(data)
					}else{
						var sql_string2 = "SELECT * FROM reservation WHERE student_id = " + sess.studentid + ";";
						con.query(sql_string2 , function(err, rows, fields) {
							var slot = rows.slot;
							if (err) {
								data = {
									allow: false,
									msg:'Error selecting reservation!'
								}
								res.send(data)
							}else{
									var sql_string1 = "UPDATE student SET slot = "+ slot + " WHERE student_id = " + sess.studentid;
									con.query(sql_string1 , function(err, rows, fields) {
										if (err) {
											data = {
												allow: false,
												msg:'Error Updating!'
											}
											res.send(data)
										}else{
												var filename = __dirname + '/newdesign/home.ejs';
												var options = {}
												var data = {studentnumber: '',passwords: ''}
												ejs.renderFile(filename, data, options, function(err, str){
												res.send(str);
												});
										}
									});
							}
						});
					}
				});
			}
		}else{
			if (obj.validator == 'false') {
						var data = {allow: true}
						res.send(data);
			} else {
				var sql_strings = "UPDATE reservation SET date = '"+ date +"' , counter = '"+ table +"' WHERE student_id = '" + sess.studentid+"'";
				con.query(sql_strings , function(err, rows, fields) {
					if (err) {
						data = {
							allow: false,
							msg:'Error updating!'
						}
						res.send(data)
					}else{
						var filename = __dirname + '/newdesign/home.ejs';
						var options = {}
						var data = {studentnumber: '',passwords: ''}
						ejs.renderFile(filename, data, options, function(err, str){
							res.send(str);
						});	
					}
				});
			}
		}
	});
});

app.get('/transactiondone', function(req,res,html) {
	var bt = req.query.cnl;
	
	var str = "UPDATE student SET queue_number = null, counter = null WHERE student_id = "+ sess.studentid +"";
	con.query(str , function(err, rows2, fields) {
		if (err) {
			res.send({
				"code":400,
				"failed":"error ocurred"
			})
		}
		var filename = __dirname + '/newdesign/next.ejs';
		var options = {}
		var data = {rel: bt}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});	
	});
});

app.get('/nexttransaction', function(req,res,html) {
	var bt = req.query.cnl;
	
	sess= req.session;
	console.log(sess.studentid);
	
	//remove this variable
	//var stdnt = "10000125512";
	var sql_string = "SELECT * FROM "+ bt +";";
	con.query(sql_string , function(err, rows, fields) {
		var q = rows[0].queue_line;
		var queue = parseInt(q) + 1;
		var current_number = rows[0].current_number;
		console.log(q,current_number);
		if (err) {
			res.send({
			"code":400,
			"failed":"error ocurred at 1"
			})
		}else{
			if(rows.length >0){
				if(queue <= 80) {
					var sql_string = "SELECT * FROM student WHERE student_id = " + sess.studentid + ";";
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
						if (err) {
							res.send({
							"code":400,
							"failed":"error ocurred"
							})
						} else if (ownqueue == null) {
							//change the stdnt to sess.studentid
							var sql_string = "UPDATE student SET counter = '"+ bt +"', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
							con.query(sql_string , function(err, rows1, fields) {
								if (err) {
									res.send({
									"code":400,
									"failed":"error ocurred"
									})
								}else{
									if(rows1.affectedRows == 1){
										var str = "UPDATE "+ bt +" SET queue_line = " + queue + "";
										con.query(str , function(err, rows2, fields) {
										if (err) {
											res.send({
											"code":400,
											"failed":"error ocurred"
											})
										}else{
											if(rows1.affectedRows == 1){
												var filename = __dirname + '/newdesign/cashier.ejs';
												var options = {}
												var data = {rel: bt}
												ejs.renderFile(filename, data, options, function(err, str){
													res.send(str);
												});	
											}
											else{
												console.log();
													res.send({
													"code":204,
													"success":"Email does not exits"
												});
											}
										}
										});
									}
									else{
										res.send({
										"code":204,
										"success":"Email does not exits"
										});
									}
								}
							});
						}else{
							var filename = __dirname + '/newdesign/cashier.ejs';
							var options = {}
							var data = {rel: bt}
							ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
							});
						}
					});
				}
				else{
					res.send({
					"code":204,
					"success":"Email does not exits"
					});
				}
			}
		}
	});	
});


// socket.io
io.sockets.on('connection', (socket) => {
  //Remove comment for session
  //remove this variable
  //var stdnt = "10000125512";
  //sess= req.session;
  console.log("socket: ", socket.request.session.studentid);
  
  console.log('Socket connected');
  var alll = "SELECT * FROM cashier;";
  alll += "SELECT * FROM enrollment;";
  alll += "SELECT * FROM registrar;";
  alll += "SELECT * FROM proware;";
  alll += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(alll,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  console.log(rows[3][0].queue_line);
	  var rowcashier = rows[0][0].queue_line;
	  var ccashier = rows[0][0].current_number;
	  
	  var rowenroll = rows[1][0].queue_line;
	  var cenroll = rows[1][0].current_number;
	  
	  var rowregistrar = rows[2][0].queue_line;
	  var cregistrar = rows[2][0].current_number;
	  
	  var rowpro = rows[3][0].queue_line;
	  var cpro = rows[3][0].current_number;
	  
	  var qnumber = rows[4][0].queue_number;
	  socket.emit('alll', { rowcashierr: rowcashier,ccashierr: ccashier,rowenrolll: rowenroll,cenrolll: cenroll, rowregistrarr: rowregistrar,cregistrarr: cregistrar, rowproo: rowpro,cproo: cpro, queue: qnumber });
    });
  
  var str = "SELECT * FROM cashier;";
  str += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  socket.emit('currentc', { row: rowcn, current: cnumber, queue: qnumber });
    });
	
  var str1 = "SELECT * FROM enrollment;";
  str1 += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str1,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  socket.emit('currente', { row: rowcn, current: cnumber, queue: qnumber });
    });
	
	
  var str2 = "SELECT * FROM proware;";
  str2 += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str2,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  socket.emit('currentp', { row: rowcn, current: cnumber, queue: qnumber });
    });
	
  var str3 = "SELECT * FROM registrar;";
  str3 += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str3,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  socket.emit('currentr', { row: rowcn, current: cnumber, queue: qnumber });
    });
  var str4 = "SELECT * FROM reservation;";
  con.query(str4,function(err,rows){
      if(err) throw err;
	  for (var i = 0; i < rows.length; i++) {
		  console.log(rows[i].date, rows[i].counter)
	  }
	  socket.emit('showrows', rows);
    });

  var str5 = "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "' ;";
  con.query(str3,function(err,rows){
      if(err) throw err;
	  console.log("TEXT USER")
	  let toNumber = rows[0].phone_number;
	  let text = "You are near";
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
	  
	  socket.emit('text', text);
    });
    
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
});
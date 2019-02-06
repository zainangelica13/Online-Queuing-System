var express         = require('express');
var session = require("express-session");
var app            = express();
var path            = require('path');
var router          = express.Router();
var bodyParser      = require('body-parser');
var ejs 			= require('ejs');
app.set('view engine', 'ejs');
var mysql = require('mysql');
module.exports = router;
const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
var command = require("./mobilecommand.js");
const io = require('socket.io')(server);


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
	if(req.session.studentid) {
		var sql_string = "SELECT * FROM student WHERE student_id = "+ sess.studentid +";";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				res.send({
				"code":400,
				"failed":"error ocurred"
				});
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
	sess = req.session;
	sess.studentid=req.body.studentID;
	req.session.save();
	console.log(req.session.studentid)
	
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
			res.send({
			"code":400,
			"failed":"error ocurred"
			})
		}else{
			if(rows.length >0){
				var str = "UPDATE student SET verification = " + random + " WHERE student_id = " + sess.studentid;
				con.query(str , function(err, rows1, fields) {
				if (err) {
					res.send({
					"code":400,
					"failed":"error ocurred"
					})
				}else{
					if(rows1.affectedRows == 1){
						setValue(sess.studentid);
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
	var verify = req.body.name;
	var sql_string = "SELECT * FROM student WHERE verification = " + verify + ";";
	con.query(sql_string , function(err, rows, fields) {
		if (err) {
		  // console.log("error ocurred",error);
			res.send({
			"code":400,
			"failed":"error ocurred"
			})
		}else{
			// console.log('The solution is: ', results);
			if(rows.length >0){
				var filename = __dirname + '/newdesign/home.ejs';
				var options = {}
				var data = {studentnumber: '',passwords: ''}
				ejs.renderFile(filename, data, options, function(err, str){
					res.send(str);
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
	
	var filename = __dirname + '/newdesign/home.html';
	var options = {}
	var data = {rel: ''}
	ejs.renderFile(filename, data, options, function(err, str){
		res.send(str);
	});
});

app.get('/logout', function(req,res) {
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

app.get('/cancel', function(req,res,html) {
	var bt = req.query.cnl;
	var btn = req.query.counter;
	console.log("counter: ",btn);
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
				var str = "UPDATE student SET queue_number = "+null+", counter = "+null+" WHERE queue_number = "+ rows1[i].queue_number +"";
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
						} else if (ownqueue == 0) {
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
												var data = {rel: 'Enrollment'}
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
							var data = {rel: 'Enrollment'}
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
												var data = {rel: 'Enrollment'}
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
							var data = {rel: 'Enrollment'}
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
					//change the stdnt to sess.studentid
					var sql_string = "UPDATE student SET queue_number = " + queue + " WHERE student_id = " + sess.studentid;
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
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
										var data = {rel: ownqueue, rell: current_number}
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
				}
				else {
					console.log();
						res.send({
						"code":204,
						"success":"Queue line does exceeed the limit"
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
					//change the stdnt to sess.studentid
					var sql_string = "UPDATE student SET queue_number = " + queue + " WHERE student_id = " + sess.studentid;
					con.query(sql_string , function(err, rows1, fields) {
						var ownqueue = rows1[0].queue_number;
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
										var data = {rel: ownqueue, rell: current_number}
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
				}
				else {
					console.log();
						res.send({
						"code":204,
						"success":"Queue line does exceeed the limit"
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
	var date = req.body.dte;
	var table = req.body.tab;
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
			res.send({
				"code":400,
				"failed":"select"
			});
		} else if (!rows.length) {
			var sql_string3 = "INSERT INTO reservation (slot,date,counter,student_id) VALUES ('','"+date+"','" +table+ "','" +sess.studentid+ "')";
			con.query(sql_string3 , function(err, rows, fields) {
				if (err) {
				  // console.log("error ocurred",error);
					res.send({
					"code":400,
					"failed":"error ocurred"
					})
				}else{
					var sql_string2 = "SELECT * FROM reservation WHERE student_id = " + sess.studentid + ";";
					con.query(sql_string2 , function(err, rows, fields) {
						var slot = rows.slot;
						if (err) {
						  // console.log("error ocurred",error);
							res.send({
							"code":400,
							"failed":"error ocurred"
							})
						}else{
								var sql_string1 = "UPDATE student SET slot = "+ slot + " WHERE student_id = " + sess.studentid;
								con.query(sql_string1 , function(err, rows, fields) {
									if (err) {
									  // console.log("error ocurred",error);
										res.send({
										"code":400,
										"failed":"error ocurred"
										})
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
		}else{
			var sql_strings = "UPDATE reservation SET date = '"+ date +"' , counter = '"+ table +"' WHERE student_id = '" + sess.studentid+"'";
			con.query(sql_strings , function(err, rows, fields) {
				if (err) {
				    console.log(err);
					res.send({
					"code":400,
					"failed":"update"
					})
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
});

	var add_status = function (status,callback) {
    var sql_string = "SELECT * FROM queue_management;";
			con.query(sql_string , function(err, rows, fields) {
				var cnum = rows[0].current_number;
				//console.log(cnum)
				if (err) {
				  // console.log("error ocurred",error);
					res.send({
					"code":400,
					"failed":"error ocurred"
					})
				}
			});
}


// socket.io
io.sockets.on('connection', (socket) => {
  //Remove comment for session
  //remove this variable
  //var stdnt = "10000125512";
  //sess= req.session;
  console.log("socket: ", socket.request.session.studentid);
  
  console.log('Socket connected');
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
	
  var str3 = "SELECT * FROM reservation;";
  con.query(str3,function(err,rows){
      if(err) throw err;
	  console.log("throwing errors ata HAHAHA")
	  socket.emit('showrows', rows);
    });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
});
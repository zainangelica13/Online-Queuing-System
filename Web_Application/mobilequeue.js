var express         = require('express');
var session = require("express-session");
var mysql = require('mysql');
var app            = express();
var ejs 			= require('ejs');
var bodyParser      = require('body-parser');
const config = require('./config');
const Nexmo = require('nexmo');
var port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
const io = require('socket.io')(server);
const nexmo = new Nexmo({
  apiKey: config.api_key,
  apiSecret: config.api_secret,
}, {debug: true});

var con = mysql.createPool({
	connectionLimit : 10,
	host: '156.67.222.90',
	user: 'u452013966_qsti',
	password: '1UjcDXOJ7G2T',
	database: 'u452013966_qsti',
	port: 3306,
	multipleStatements: true
});

var middleWare = session({
	name: 'studentid',
	secret: '1234',
	resave: false,
	saveUninitialized: false
});
app.use(middleWare);

io.use(function(socket,next) {
	middleWare(socket.request, socket.request.res, next);
});


var command = require("./mobilecommand.js");
var enCoded = bodyParser.urlencoded({ extended: false });
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/newdesign'));
var sess;
app.get('/', function(req,res){
	sess = req.session;
	console.log(sess.studentid);
	
	if(sess.studentid) {
		var sql_string = "SELECT * FROM student WHERE student_id = "+ sess.studentid +";";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				console.log('Error!');
			}else{
				console.log("1");
				if(rows.length >0){
					console.log(rows[0].queue_number);
					var cnt = rows[0].counter;
					var queue = rows[0].queue_number;
					if (queue == null){
						console.log("2");
						var filename = __dirname + '/newdesign/home.ejs';
						var options = {}
						var data = {studentnumber: '',passwords: ''}
						ejs.renderFile(filename, data, options, function(err, str){
						res.send(str);
						});
					}
					else{
						console.log("3");
						var filename = __dirname + '/newdesign/cashier.ejs';
						var options = {}
						var data = {rel: cnt, queue: queue}
						ejs.renderFile(filename, data, options, function(err, str){
						res.send(str);
						});
					}
				}
				else{			
					console.log("4");
					res.send({
						"code":204,
						"success":"Email does not exits"
					});
				}
			}
		});	
	} else {
		console.log("5");
		//I use home to debug the error in home. Change it into login.ejs 
		var filename = __dirname + '/newdesign/login.ejs';
		var options = {}
		var data = {studentnumber: '',passwords: ''}
		ejs.renderFile(filename, data, options, function(err, str){
		res.send(str);
		});
	}
	
});

app.post('/send', enCoded, function(req,res){
	sess = req.session;
	var obj = {
		sid:req.body.studentID,
		validator:req.body.validator
	};
	sess = req.session;
	sess.studentid=obj.sid;
	//sess.studentid=req.body.studentID;
	req.session.save();
	console.log(sess.studentid)
	
	function getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	
	var random = getRandomInt(3000);
	
	if (random < 1000) {
			return random;
	}
	console.log("SSID  is : "+ sess.studentid);
	console.log("query is : "+ 'SELECT * from student WHERE student_id = "'+ sess.studentid +'"');
		
		
	console.log("Connecting");
	con.getConnection(function(err,con){
		con.query('SELECT * from student WHERE student_id = "'+ sess.studentid +'"', function(err, rows, fields) {		
			if (err) {
				console.log('error: ', err);
				throw err;
			} else {
				if(rows.length > 0){
					if(rows[0].student_id == obj.sid){
						if (obj.validator == 'false') {
							var data = {allow: true}
								console.log("Validator False");
								con.release();	
							res.send(data);
						} else {
							var str = "UPDATE student SET verification = " + random + " WHERE student_id = " + sess.studentid;
							con.query(str , function(err, rows1, fields) {
								if (err) {
									console.log(err)
								}else{
									if(rows1.affectedRows == 1){
										setValue(sess.studentid);
										con.release();	
									}
									else{
										data = {
											allow: false,
											msg:'Try Again!'
										}
										con.release();	
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
						console.log("Closing the Connection");				
						con.release();	
						console.log("Sending No Data");
						res.send(data);
					}
				}
				else{
					data = {
						allow: false,
						msg:'Student ID number does not exist!'
					}
					
					console.log("Closing the Connection");				
					con.release();	
					console.log("Sending No Data");
					res.send(data);
				}		
			}
		});
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

app.post('/login', enCoded, function(req,res) {
	sess = req.session;
	var obj = {
		vfy:req.body.Id,
		validator:req.body.validator,
		cfm:req.body.confirm
	};
	var s = sess.studentid;
	var verify = obj.vfy;
	console.log(verify);
	var vl = parseInt(obj.cfm);
	console.log(obj.cfm);
	console.log(vl);
	con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM student WHERE verification = " + verify + ";";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				data = {
					allow: false,
					msg:'Error'
				}
				con.release();	
				res.send(data)
			}else{
				// console.log('The solution is: ', results);
				if(rows.length >0){
					if(rows[0].verification == verify){
						if (obj.validator == 'false') {
							var data = {allow: true}
							con.release();	
							res.send(data);
						} else {
							con.release();
							var cnt = rows[0].counter;
							var queue = rows[0].queue_number;
							if (queue == null){
								console.log("2");
								var filename = __dirname + '/newdesign/home.ejs';
								var options = {}
								var data = {studentnumber: '',passwords: ''}
								ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
								});
							}
							else{
								console.log("3");
								var filename = __dirname + '/newdesign/cashier.ejs';
								var options = {}
								var data = {rel: cnt, queue: queue}
								ejs.renderFile(filename, data, options, function(err, str){
								res.send(str);
								});
							}
						}
					} else {
						data = {
							allow: false,
							msg:'Wrong verification code!'
						}
						con.release();	
						res.send(data)
						if(vl == 2){
							console.log("Im here");
							//set home.ejs to verifylogin.ejs
							var value = sess.studentid;
							command.Send(value,function(err,results){
							});
						}
					}
				}
				else{
					data = {
						allow: false,
						msg:'Wrong verification code!'
					}
					con.release();	
					res.send(data)
					if(vl == 2){
						console.log("Im here");
						//set home.ejs to verifylogin.ejs
						var value = sess.studentid;
						command.Send(value,function(err,results){
						});
					}
				}
			}
		});	
	});
});

app.post('/slot', enCoded, function(req,res) {
	//Remove comment for session
	sess= req.session;
	console.log(sess.studentid);
	if(sess.studentid) {
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
		
		con.getConnection(function(err,con){
			var sql_string = "SELECT * FROM reservation WHERE student_id = " + sess.studentid + ";";
			con.query(sql_string , function(err, rows, fields) {
				if (err){
					data = {
						allow: false,
						msg:'No student ID'
					}
					con.release();
					res.send(data)
				} else if (!rows.length) {
					if (obj.validator == 'false') {
								var data = {allow: true}
								con.release();
								res.send(data);
					} else {
						var sql_string3 = "INSERT INTO reservation (slot,date,counter,student_id) VALUES ('','"+date+"','" +table+ "','" +sess.studentid+ "')";
						con.query(sql_string3 , function(err, rows, fields) {
							if (err) {
								data = {
									allow: false,
									msg:'Error inserting into reservation!'
								}
								con.release();
								res.send(data)
							}else{
								var sql_string2 = "SELECT * FROM reservation WHERE student_id = " + sess.studentid + ";";
								sql_string2 += "SELECT * FROM "+ table +";";
								con.query(sql_string2 , function(err, rows, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									}else{
										var slot = rows[0][0].slot;
										var slot_reserve = rows[1][0].slot_reservation;
										slot_reserve += 1;
										console.log(slot_reserve);
											var sql_string1 = "UPDATE student SET slot = '"+ slot + "', counter = '"+table+"' WHERE student_id = '" + sess.studentid+ "'";
											sql_string1 += "UPDATE "+table+" SET slot_reservation = '"+ slot_reserve + "'";
											con.query(sql_string1 , function(err, rows, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error Updating!'
													}
													con.release();
													res.send(data)
												}else{
														con.release();
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
								con.release();
								res.send(data);
					} else {	
						var slot = rows[0].slot;
						console.log(slot)
						var sql_strings = "UPDATE reservation SET date = '"+ date +"' , counter = '"+ table +"' WHERE student_id = '" + sess.studentid+"'";
						con.query(sql_strings , function(err, rows, fields) {
							if (err) {
								data = {
									allow: false,
									msg:'Error reservation!'
								}
								con.release();
								res.send(data)
							}else{
								var sql_string2 = "SELECT * FROM reservation WHERE student_id = " + sess.studentid + ";";
								sql_string2 += "SELECT * FROM "+ table +";";
								con.query(sql_string2 , function(err, rows, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									}else{
										var slot = rows[0][0].slot;
										var slot_reserve = rows[1][0].slot_reservation;
											var sql_string1 = "UPDATE student SET slot = '"+ slot + "', counter = '"+table+"' WHERE student_id = '" + sess.studentid+"';";
											sql_string1 += "UPDATE "+table+" SET slot_reservation = '"+ slot_reserve + "'";
											con.query(sql_string1 , function(err, rows, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error Updating!'
													}
													con.release();
													res.send(data)
												}else{
													con.release();
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
				}
			});
		});
		
	} else {
		res.redirect('/');
	}
});

app.post('/queue', enCoded, function(req,res) {	
	sess = req.session;
	if(sess.studentid) {
		var btn = req.body.Ticket;
		console.log(btn);
		
		var filename = __dirname + '/newdesign/enrollment.ejs';
		var options = {}
		var data = {rel: btn}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	} else {
		res.redirect('/');
	}
	
});	

app.get('/logout', function(req,res) {
	req.session.destroy(function(err){
		if (err) {
			console.log(err);
		} else {
			console.log("logging out " + sess.studentid)
			res.redirect('/');
		}
		
	})
});

app.get('/home', function(req,res) {
	sess= req.session;
	if(sess.student_id) {
		var filename = __dirname + '/newdesign/home.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});		
	} else {
		res.redirect('/');
	}
});

app.get('/back', function(req,res,html) {
	sess = req.session;
	if(sess.studentid) {
		var filename = __dirname + '/newdesign/home.ejs';
		var options = {}
		var data = {rel: ''}
		ejs.renderFile(filename, data, options, function(err, str){
			res.send(str);
		});
	} else {
		res.redirect('/');
	}
	
});

app.post('/Cashier', enCoded, function(req,res) {
	sess = req.session;
	if(sess.studentid) {
		var obj = {
		qr:req.body.qr,
		validator:req.body.validator
	};
	var qr =  obj.qr;
	//Remove comment for session
	sess= req.session;
	console.log(qr);
	var date=new Date();
	var datenow = date.toDateString();
	console.log("Cashier " + datenow);
	//comment this variable
	//var stdnt = "10000125512";
	con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM queue_management WHERE qr_code = '" + qr + "';";
		sql_string += "SELECT * FROM cashier;";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				data = {
					allow: false,
					msg:'Wrong QR Code!'
				}
				con.release();
				res.send(data)
			}else{
				if(rows.length >0){
					var day = 0;
					var line = 100;
					var slot = rows[1][0].slot_reservation;
					var q = rows[1][0].queue_line;
					var queue = parseInt(q) + 1;
					var current_number = rows[1][0].current_number;
					var qr_code_ver = (rows[0][0].qr_code == obj.qr);
					console.log(q,current_number);
					if(qr_code_ver){
						if (obj.validator == 'false') {
							var data = {allow: true}
							con.release();
							res.send(data);
						} else {
							if(slot != 0){
								console.log("1")
								var sql_string = "SELECT * FROM reservation WHERE date = '" + datenow + "' and counter = 'cashier';";
								con.query(sql_string , function(err, rows1, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									} else {
										if(rows.length > 0){
											console.log("2")
											for(var i=0; i< rows.length; i++){
												day++;
											}
											if (day != 0) {
												console.log("3")
												var sql_string = "SELECT * FROM reservation WHERE student_id = '"+ sess.studentid +"' and date = '" + datenow + "' and counter = 'cashier';";
												con.query(sql_string , function(err, rows1, fields) {
													if (err) {
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													} else {
														if(rows.length > 0){
															if(queue <= day) {
																console.log("4")
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("5")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'cashier', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("6")
																					var str = "UPDATE cashier SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																						if (err) {
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}else{
																							if(rows1.affectedRows == 1){
																								if (obj.validator == 'false') {
																									var data = {allow: true}
																									con.release();
																									res.send(data);
																								} else {
																									console.log("7")
																									con.release();
																									var filename = __dirname + '/newdesign/cashier.ejs';
																									var options = {}
																									var data = {rel: 'cashier', queue: queue}
																									ejs.renderFile(filename, data, options, function(err, str){
																										res.send(str);
																									});	
																								}
																							}
																							else{
																								data = {
																									allow: false,
																									msg:'Error!'
																								}
																								con.release();
																								res.send(data)
																							}
																						}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'cashier', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														} else { 
															console.log("8")
															line -= day;
															if(queue <= line) {
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("9")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'cashier', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("10")
																					var str = "UPDATE cashier SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																						if (err) {
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}else{
																							if(rows1.affectedRows == 1){
																								console.log("11")
																								if (obj.validator == 'false') {
																									var data = {allow: true}
																									con.release();
																									res.send(data);
																								} else {
																									var filename = __dirname + '/newdesign/cashier.ejs';
																									var options = {}
																									var data = {rel: 'cashier', queue: queue}
																									con.release();
																									ejs.renderFile(filename, data, options, function(err, str){
																										res.send(str);
																									});	
																								}
																							}
																							else{
																								data = {
																									allow: false,
																									msg:'Error!'
																								}
																								con.release();
																								res.send(data)
																							}
																						}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'cashier', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														}
													}
												});
											} else {
												if(queue <= line) {
													console.log("12")
													var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
													con.query(sql_string , function(err, rows1, fields) {
														var ownqueue = rows1[0].queue_number;
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														} else if (ownqueue == null) {
															console.log("13")
															//change the stdnt to sess.studentid
															var sql_string = "UPDATE student SET counter = 'cashier', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
															con.query(sql_string , function(err, rows1, fields) {
																if (err) {
																	data = {
																		allow: false,
																		msg:'Error!'
																	}
																	con.release();
																	res.send(data)
																}else{
																	if(rows1.affectedRows == 1){
																		console.log("14")
																		var str = "UPDATE cashier SET queue_line = '" + queue + "'";
																		con.query(str , function(err, rows2, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("15")
																					if (obj.validator == 'false') {
																						var data = {allow: true}
																						con.release();
																						res.send(data);
																					} else {
																						var filename = __dirname + '/newdesign/cashier.ejs';
																						var options = {}
																						var data = {rel: 'cashier', queue: queue}
																						con.release();
																						ejs.renderFile(filename, data, options, function(err, str){
																							res.send(str);
																						});	
																					}
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}
																	else{
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	}
																}
															});
														}else{
															var filename = __dirname + '/newdesign/cashier.ejs';
															var options = {}
															con.release();
															var data = {rel: 'cashier', queue: queue}
															ejs.renderFile(filename, data, options, function(err, str){
																res.send(str);
															});
														}
													});
												}
												else {
													data = {
														allow: false,
														msg:'Full!'
													}
													con.release();
													res.send(data)
												}
											}
										} else {
											data = {
												allow: false,
												msg:'No reservation!'
											}
											con.release();
											res.send(data)
										}
									}
								});
							} else {
								if(queue <= line) {
									console.log("16")
									var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
									con.query(sql_string , function(err, rows1, fields) {
										var ownqueue = rows1[0].queue_number;
										if (err) {
											data = {
												allow: false,
												msg:'Error!'
											}
											con.release();
											res.send(data)
										} else if (ownqueue == null) {
											console.log("17")
											//change the stdnt to sess.studentid
											var sql_string = "UPDATE student SET counter = 'cashier', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
											con.query(sql_string , function(err, rows1, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error!'
													}
													con.release();
													res.send(data)
												}else{
													if(rows1.affectedRows == 1){
														console.log("18")
														var str = "UPDATE cashier SET queue_line = '" + queue + "'";
														con.query(str , function(err, rows2, fields) {
															if (err) {
																data = {
																	allow: false,
																	msg:'Error!'
																}
																con.release();
																res.send(data)
															}else{
																if(rows1.affectedRows == 1){
																	if (obj.validator == 'false') {
																		var data = {allow: true}
																		con.release();
																		res.send(data);
																	} else {
																		console.log("19")
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'cashier', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});	
																	}
																}
																else{
																	data = {
																		allow: false,
																		msg:'Error!'
																	}
																	con.release();
																	res.send(data)
																}
															}
														});
													}
													else{
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													}
												}
											});
										}else{
											var filename = __dirname + '/newdesign/cashier.ejs';
											var options = {}
											var data = {rel: 'cashier', queue: queue}
											con.release();
											ejs.renderFile(filename, data, options, function(err, str){
												res.send(str);
											});
										}
									});
								}
								else {
									data = {
										allow: false,
										msg:'Full!'
									}
									con.release();
									res.send(data)
								}
							}
						}
					}
					else{
						data = {
							allow: false,
							msg:'Error!'
						}
						con.release();
						res.send(data)
					}
				} else {
					data = {
						allow: false,
						msg:'No QR Code Today!!'
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

app.post('/enrollment', enCoded, function(req,res) {
	sess = req.session;
	if(sess.studentid){
		var obj = {
		qr:req.body.qr,
		validator:req.body.validator
	};
	var qr =  obj.qr;
	//Remove comment for session
	sess= req.session;
	console.log(qr);
	var date=new Date();
	var datenow = date.toDateString();
	console.log("Enrollment " + datenow);
	//comment this variable
	//var stdnt = "10000125512";
	con.getConnection(function(err,con){
		
		var sql_string = "SELECT * FROM queue_management WHERE qr_code = '" + qr + "';";
		sql_string += "SELECT * FROM enrollment;";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				data = {
					allow: false,
					msg:'Wrong QR Code!'
				}
				con.release();
				res.send(data)
			}else{
				if(rows.length >0){
					var day = 0;
					var line = 100;
					var slot = rows[1][0].slot_reservation;
					var q = rows[1][0].queue_line;
					var queue = parseInt(q) + 1;
					var current_number = rows[1][0].current_number;
					console.log(rows[0][0]);
					var hasqr = (rows[0][0].qr_code == obj.qr);
					console.log(q,current_number);
					if(hasqr){
						if (obj.validator == 'false') {
							var data = {allow: true}
							con.release();
							res.send(data);
						} else {
							if(slot != 0){
								console.log("1")
								var sql_string = "SELECT * FROM reservation WHERE date = '" + datenow + "' and counter = 'enrollment';";
								con.query(sql_string , function(err, rows1, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									} else {
										if(rows.length > 0){
											console.log("2")
											for(var i=0; i< rows.length; i++){
												day++;
											}
											if (day != 0) {
												console.log("3")
												var sql_string = "SELECT * FROM reservation WHERE student_id = '"+ sess.studentid +"' and date = '" + datenow + "' and counter = 'enrollment';";
												con.query(sql_string , function(err, rows1, fields) {
													if (err) {
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													} else {
														if(rows.length > 0){
															if(queue <= day) {
																console.log("4")
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("5")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'enrollment', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("6")
																					var str = "UPDATE enrollment SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								console.log("7")
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: 'enrollment', queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'enrollment', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														} else { 
															console.log("8")
															line -= day;
															if(queue <= line) {
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("9")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'enrollment', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("10")
																					var str = "UPDATE enrollment SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							console.log("11")
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: 'enrollment', queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'enrollment', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														}
													}
												});
											} else {
												if(queue <= line) {
													console.log("12")
													var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
													con.query(sql_string , function(err, rows1, fields) {
														var ownqueue = rows1[0].queue_number;
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														} else if (ownqueue == null) {
															console.log("13")
															//change the stdnt to sess.studentid
															var sql_string = "UPDATE student SET counter = 'enrollment', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
															con.query(sql_string , function(err, rows1, fields) {
																if (err) {
																	data = {
																		allow: false,
																		msg:'Error!'
																	}
																	con.release();
																	res.send(data)
																}else{
																	if(rows1.affectedRows == 1){
																		console.log("14")
																		var str = "UPDATE enrollment SET queue_line = '" + queue + "'";
																		con.query(str , function(err, rows2, fields) {
																		if (err) {
																			data = {
																				allow: false,
																				msg:'Error!'
																			}
																			con.release();
																			res.send(data)
																		}else{
																			if(rows1.affectedRows == 1){
																				console.log("15")
																				if (obj.validator == 'false') {
																					var data = {allow: true}
																					con.release();
																					res.send(data);
																				} else {
																					var filename = __dirname + '/newdesign/cashier.ejs';
																					var options = {}
																					var data = {rel: 'enrollment', queue: queue}
																					con.release();
																					ejs.renderFile(filename, data, options, function(err, str){
																						res.send(str);
																					});	
																				}
																			}
																			else{
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}
																		}
																		});
																	}
																	else{
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	}
																}
															});
														}else{
															var filename = __dirname + '/newdesign/cashier.ejs';
															var options = {}
															var data = {rel: 'enrollment', queue: queue}
															con.release();
															ejs.renderFile(filename, data, options, function(err, str){
																res.send(str);
															});
														}
													});
												}
												else {
													data = {
														allow: false,
														msg:'Full!'
													}
													con.release();
													res.send(data)
												}
											}
										} else {
											data = {
												allow: false,
												msg:'No reservation!'
											}
											con.release();
											res.send(data)
										}
									}
								});
							} else {
								if(queue <= line) {
									console.log("16")
									var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
									con.query(sql_string , function(err, rows1, fields) {
										var ownqueue = rows1[0].queue_number;
										if (err) {
											data = {
												allow: false,
												msg:'Error!'
											}
											con.release();
											res.send(data)
										} else if (ownqueue == null) {
											console.log("17")
											//change the stdnt to sess.studentid
											var sql_string = "UPDATE student SET counter = 'enrollment', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
											con.query(sql_string , function(err, rows1, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error!'
													}
													con.release();
													res.send(data)
												}else{
													if(rows1.affectedRows == 1){
														console.log("18")
														var str = "UPDATE enrollment SET queue_line = '" + queue + "'";
														con.query(str , function(err, rows2, fields) {
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														}else{
															if(rows1.affectedRows == 1){
																if (obj.validator == 'false') {
																	var data = {allow: true}
																	con.release();
																	res.send(data);
																} else {
																	console.log("19")
																	var filename = __dirname + '/newdesign/cashier.ejs';
																	var options = {}
																	var data = {rel: 'enrollment', queue: queue}
																	con.release();
																	ejs.renderFile(filename, data, options, function(err, str){
																		res.send(str);
																	});	
																}
															}
															else{
																data = {
																	allow: false,
																	msg:'Error!'
																}
																con.release();
																res.send(data)
															}
														}
														});
													}
													else{
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													}
												}
											});
										}else{
											var filename = __dirname + '/newdesign/cashier.ejs';
											var options = {}
											var data = {rel: 'enrollment', queue: queue}
											con.release();
											ejs.renderFile(filename, data, options, function(err, str){
												res.send(str);
											});
										}
									});
								}
								else {
									data = {
										allow: false,
										msg:'Full!'
									}
									con.release();
									res.send(data)
								}
							}
						}
					}
					else{
						data = {
							allow: false,
							msg:'Error!'
						}
						con.release();
						res.send(data)
					}
				} else {
					data = {
						allow: false,
						msg:'No QR Code Today!!'
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

app.post('/registrar', enCoded, function(req,res) {
	sess = req.session;
	if(sess.studentid) {
		var obj = {
		qr:req.body.qr,
		validator:req.body.validator
	};
	var qr =  obj.qr;
	//Remove comment for session
	sess= req.session;
	console.log(qr);
	var date=new Date();
	var datenow = date.toDateString();	
	console.log("registrar " + datenow);
	//comment this variable
	//var stdnt = "10000125512";
	con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM queue_management WHERE qr_code = '" + qr + "';";
		sql_string += "SELECT * FROM registrar;";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				data = {
					allow: false,
					msg:'Wrong QR Code!'
				}
				con.release();
				res.send(data)
			}else{
				if(rows.length >0){
					var day = 0;
					var line = 100;
					var slot = rows[1][0].slot_reservation;
					var q = rows[1][0].queue_line;
					var queue = parseInt(q) + 1;
					var current_number = rows[1][0].current_number;
					var hasqr = (rows[0][0].qr_code == obj.qr);
					console.log(q,current_number);
					if(hasqr){
						if (obj.validator == 'false') {
							var data = {allow: true}
							con.release();
							res.send(data);
						} else {
							if(slot != 0){
								console.log("1")
								var sql_string = "SELECT * FROM reservation WHERE date = '" + datenow + "' and counter = 'registrar';";
								con.query(sql_string , function(err, rows1, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									} else {
										if(rows.length > 0){
											console.log("2")
											for(var i=0; i< rows.length; i++){
												day++;
											}
											if (day != 0) {
												console.log("3")
												var sql_string = "SELECT * FROM reservation WHERE student_id = '"+ sess.studentid +"' and date = '" + datenow + "' and counter = 'registrar';";
												con.query(sql_string , function(err, rows1, fields) {
													if (err) {
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													} else {
														if(rows.length > 0){
															if(queue <= day) {
																console.log("4")
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("5")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'registrar', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("6")
																					var str = "UPDATE registrar SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								console.log("7")
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: 'registrar', queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'registrar', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														} else { 
															console.log("8")
															line -= day;
															if(queue <= line) {
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("9")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'registrar', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("10")
																					var str = "UPDATE registrar SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							console.log("11")
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: 'registrar', queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'registrar', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														}
													}
												});
											} else {
												if(queue <= line) {
													console.log("12")
													var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
													con.query(sql_string , function(err, rows1, fields) {
														var ownqueue = rows1[0].queue_number;
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														} else if (ownqueue == null) {
															console.log("13")
															//change the stdnt to sess.studentid
															var sql_string = "UPDATE student SET counter = 'registrar', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
															con.query(sql_string , function(err, rows1, fields) {
																if (err) {
																	data = {
																		allow: false,
																		msg:'Error!'
																	}
																	con.release();
																	res.send(data)
																}else{
																	if(rows1.affectedRows == 1){
																		console.log("14")
																		var str = "UPDATE registrar SET queue_line = '" + queue + "'";
																		con.query(str , function(err, rows2, fields) {
																		if (err) {
																			data = {
																				allow: false,
																				msg:'Error!'
																			}
																			con.release();
																			res.send(data)
																		}else{
																			if(rows1.affectedRows == 1){
																				console.log("15")
																				if (obj.validator == 'false') {
																					var data = {allow: true}
																					con.release();
																					res.send(data);
																				} else {
																					var filename = __dirname + '/newdesign/cashier.ejs';
																					var options = {}
																					var data = {rel: 'registrar', queue: queue}
																					con.release();
																					ejs.renderFile(filename, data, options, function(err, str){
																						res.send(str);
																					});	
																				}
																			}
																			else{
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}
																		}
																		});
																	}
																	else{
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	}
																}
															});
														}else{
															var filename = __dirname + '/newdesign/cashier.ejs';
															var options = {}
															var data = {rel: 'registrar', queue: queue}
															con.release();
															ejs.renderFile(filename, data, options, function(err, str){
																res.send(str);
															});
														}
													});
												}
												else {
													data = {
														allow: false,
														msg:'Full!'
													}
													con.release();
													res.send(data)
												}
											}
										} else {
											data = {
												allow: false,
												msg:'No reservation!'
											}
											con.release();
											res.send(data)
										}
									}
								});
							} else {
								if(queue <= line) {
									console.log("16")
									var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
									con.query(sql_string , function(err, rows1, fields) {
										var ownqueue = rows1[0].queue_number;
										if (err) {
											data = {
												allow: false,
												msg:'Error!'
											}
											con.release();
											res.send(data)
										} else if (ownqueue == null) {
											console.log("17")
											//change the stdnt to sess.studentid
											var sql_string = "UPDATE student SET counter = 'registrar', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
											con.query(sql_string , function(err, rows1, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error!'
													}
													con.release();
													res.send(data)
												}else{
													if(rows1.affectedRows == 1){
														console.log("18")
														var str = "UPDATE registrar SET queue_line = '" + queue + "'";
														con.query(str , function(err, rows2, fields) {
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														}else{
															if(rows1.affectedRows == 1){
																if (obj.validator == 'false') {
																	var data = {allow: true}
																	con.release();
																	res.send(data);																	
																} else {
																	console.log("19")
																	var filename = __dirname + '/newdesign/cashier.ejs';
																	var options = {}
																	var data = {rel: 'registrar', queue: queue}
																	con.release();
																	ejs.renderFile(filename, data, options, function(err, str){
																		res.send(str);
																	});	
																}
															}
															else{
																data = {
																	allow: false,
																	msg:'Error!'
																}
																con.release();
																res.send(data)
															}
														}
														});
													}
													else{
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													}
												}
											});
										}else{
											var filename = __dirname + '/newdesign/cashier.ejs';
											var options = {}
											var data = {rel: 'registrar', queue: queue}
											con.release();
											ejs.renderFile(filename, data, options, function(err, str){
												res.send(str);
											});
										}
									});
								}
								else {
									data = {
										allow: false,
										msg:'Full!'
									}
									con.release();
									res.send(data)
								}
							}
						}
					}
					else{
						data = {
							allow: false,
							msg:'Error!'
						}
						con.release();
						res.send(data)
					}
				} else {
					data = {
						allow: false,
						msg:'No QR Code Today!!'
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

app.post('/proware', enCoded, function(req,res) {
	sess = req.session;
	if(sess.studentid) {
		var obj = {
		qr:req.body.qr,
		validator:req.body.validator
	};
	var qr =  obj.qr;
	//Remove comment for session
	sess= req.session;
	console.log(qr);
	var date=new Date();
	var datenow = date.toDateString();
	console.log("proware " + datenow);
	//comment this variable
	//var stdnt = "10000125512";
	con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM queue_management WHERE qr_code = '" + qr + "';";
		sql_string += "SELECT * FROM proware;";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				data = {
					allow: false,
					msg:'Wrong QR Code!'
				}
				con.release();
				res.send(data)
			}else{
				if(rows.length >0){
					var day = 0;
					var line = 100;
					var slot = rows[1][0].slot_reservation;
					var q = rows[1][0].queue_line;
					var queue = parseInt(q) + 1;
					var current_number = rows[1][0].current_number;
					var haqr = (rows[0][0].qr_code == obj.qr);
					console.log(q,current_number);
					if(haqr){
						if (obj.validator == 'false') {
							var data = {allow: true}
							con.release();
							res.send(data);
						} else {
							if(slot != 0){
								console.log("1")
								var sql_string = "SELECT * FROM reservation WHERE date = '" + datenow + "' and counter = 'proware';";
								con.query(sql_string , function(err, rows1, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									} else {
										if(rows.length > 0){
											console.log("2")
											for(var i=0; i< rows.length; i++){
												day++;
											}
											if (day != 0) {
												console.log("3")
												var sql_string = "SELECT * FROM reservation WHERE student_id = '"+ sess.studentid +"' and date = '" + datenow + "' and counter = 'proware';";
												con.query(sql_string , function(err, rows1, fields) {
													if (err) {
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													} else {
														if(rows.length > 0){
															if(queue <= day) {
																console.log("4")
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("5")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'proware', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("6")
																					var str = "UPDATE proware SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								console.log("7")
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: 'proware', queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'proware', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														} else { 
															console.log("8")
															line -= day;
															if(queue <= line) {
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("9")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = 'proware', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("10")
																					var str = "UPDATE proware SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							console.log("11")
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: 'proware', queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: 'proware', queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														}
													}
												});
											} else {
												if(queue <= line) {
													console.log("12")
													var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
													con.query(sql_string , function(err, rows1, fields) {
														var ownqueue = rows1[0].queue_number;
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														} else if (ownqueue == null) {
															console.log("13")
															//change the stdnt to sess.studentid
															var sql_string = "UPDATE student SET counter = 'proware', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
															con.query(sql_string , function(err, rows1, fields) {
																if (err) {
																	data = {
																		allow: false,
																		msg:'Error!'
																	}
																	con.release();
																	res.send(data)
																}else{
																	if(rows1.affectedRows == 1){
																		console.log("14")
																		var str = "UPDATE proware SET queue_line = '" + queue + "'";
																		con.query(str , function(err, rows2, fields) {
																		if (err) {
																			data = {
																				allow: false,
																				msg:'Error!'
																			}
																			con.release();
																			res.send(data)
																		}else{
																			if(rows1.affectedRows == 1){
																				console.log("15")
																				if (obj.validator == 'false') {
																					var data = {allow: true}
																					con.release();
																					res.send(data);
																				} else {
																					var filename = __dirname + '/newdesign/cashier.ejs';
																					var options = {}
																					var data = {rel: 'proware', queue: queue}
																					con.release();
																					ejs.renderFile(filename, data, options, function(err, str){
																						res.send(str);
																					});	
																				}
																			}
																			else{
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}
																		}
																		});
																	}
																	else{
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	}
																}
															});
														}else{
															var filename = __dirname + '/newdesign/cashier.ejs';
															var options = {}
															var data = {rel: 'proware', queue: queue}
															con.release();
															ejs.renderFile(filename, data, options, function(err, str){
																res.send(str);
															});
														}
													});
												}
												else {
													data = {
														allow: false,
														msg:'Full!'
													}
													con.release();
													res.send(data)
												}
											}
										} else {
											data = {
												allow: false,
												msg:'No reservation!'
											}
											con.release();
											res.send(data)
										}
									}
								});
							} else {
								if(queue <= line) {
									console.log("16")
									var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
									con.query(sql_string , function(err, rows1, fields) {
										var ownqueue = rows1[0].queue_number;
										if (err) {
											data = {
												allow: false,
												msg:'Error!'
											}
											con.release();
											res.send(data)
										} else if (ownqueue == null) {
											console.log("17")
											//change the stdnt to sess.studentid
											var sql_string = "UPDATE student SET counter = 'proware', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
											con.query(sql_string , function(err, rows1, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error!'
													}
													con.release();
													res.send(data)
												}else{
													if(rows1.affectedRows == 1){
														console.log("18")
														var str = "UPDATE proware SET queue_line = '" + queue + "'";
														con.query(str , function(err, rows2, fields) {
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														}else{
															if(rows1.affectedRows == 1){
																if (obj.validator == 'false') {
																	var data = {allow: true}
																	con.release();
																	res.send(data);
																} else {
																	console.log("19")
																	var filename = __dirname + '/newdesign/cashier.ejs';
																	var options = {}
																	var data = {rel: 'proware', queue: queue}
																	con.release();
																	ejs.renderFile(filename, data, options, function(err, str){
																		res.send(str);
																	});	
																}
															}
															else{
																data = {
																	allow: false,
																	msg:'Error!'
																}
																con.release();
																res.send(data)
															}
														}
														});
													}
													else{
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													}
												}
											});
										}else{
											var filename = __dirname + '/newdesign/cashier.ejs';
											var options = {}
											var data = {rel: 'proware', queue: queue}
											con.release();
											ejs.renderFile(filename, data, options, function(err, str){
												res.send(str);
											});
										}
									});
								}
								else {
									data = {
										allow: false,
										msg:'Full!'
									}
									con.release();
									res.send(data)
								}
							}
						}
					}
					else{
						data = {
							allow: false,
							msg:'Error!'
						}
						con.release();
						res.send(data)
					}
				} else {
					data = {
						allow: false,
						msg:'No QR Code Today!!'
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

app.get('/transactiondone', function(req,res,html) {
	sess = req.session;
	if(sess.studentid){
		var bt = req.query.cnl;
	
	con.getConnection(function(err,con){
		var str = "UPDATE student SET queue_number = null, counter = null, near = '0', wait = '0' WHERE student_id = "+ sess.studentid +"";
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
			con.release();
			ejs.renderFile(filename, data, options, function(err, str){
				res.send(str);
			});	
		});
	});
	} else {
		res.redirect('/');
	}
	
});

app.get('/nexttransaction', function(req,res,html) {
	sess = req.session;
	if(sess.studentid) {
		var obj = {
		validator:req.query.validator
	};
	var bt = req.query.cnl;
	//Remove comment for session
	sess= req.session;
	var date=new Date();
	var datenow = date.toDateString();
	console.log(datenow);
	//comment this variable
	//var stdnt = "10000125512";
	con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM "+ bt +";";
		con.query(sql_string , function(err, rows, fields) {
			if (err) {
				data = {
					allow: false,
					msg:'Wrong QR Code!'
				}
				con.release();
				res.send(data)
			}else{
				if(rows.length >0){
					var day = 0;
					var line = 100;
					var slot = rows[0].slot_reservation;
					var q = rows[0].queue_line;
					var queue = parseInt(q) + 1;
					var current_number = rows[0].current_number;
					console.log(q,current_number);
						if (obj.validator == 'false') {
							var data = {allow: true}
							con.release();
							res.send(data);
						} else {
							if(slot != 0){
								console.log("1")
								var sql_string = "SELECT * FROM reservation WHERE date = '" + datenow + "' and counter = '"+ bt +"';";
								con.query(sql_string , function(err, rows1, fields) {
									if (err) {
										data = {
											allow: false,
											msg:'Error!'
										}
										con.release();
										res.send(data)
									} else {
										if(rows.length > 0){
											console.log("2")
											for(var i=0; i< rows.length; i++){
												day++;
											}
											if (day != 0) {
												console.log("3")
												var sql_string = "SELECT * FROM reservation WHERE student_id = '"+ sess.studentid +"' and date = '" + datenow + "' and counter = '"+ bt +"';";
												con.query(sql_string , function(err, rows1, fields) {
													if (err) {
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													} else {
														if(rows.length > 0){
															if(queue <= day) {
																console.log("4")
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("5")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = '"+ bt +"', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("6")
																					var str = "UPDATE "+ bt +" SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								console.log("7")
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: bt, queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: bt, queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														} else { 
															console.log("8")
															line -= day;
															if(queue <= line) {
																var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
																con.query(sql_string , function(err, rows1, fields) {
																	var ownqueue = rows1[0].queue_number;
																	if (err) {
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	} else if (ownqueue == null) {
																		console.log("9")
																		//change the stdnt to sess.studentid
																		var sql_string = "UPDATE student SET counter = '"+ bt +"', queue_number = " + queue + " WHERE student_id = " + sess.studentid;
																		con.query(sql_string , function(err, rows1, fields) {
																			if (err) {
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}else{
																				if(rows1.affectedRows == 1){
																					console.log("10")
																					var str = "UPDATE "+ bt +" SET queue_line = '" + queue + "'";
																					con.query(str , function(err, rows2, fields) {
																					if (err) {
																						data = {
																							allow: false,
																							msg:'Error!'
																						}
																						con.release();
																						res.send(data)
																					}else{
																						if(rows1.affectedRows == 1){
																							console.log("11")
																							if (obj.validator == 'false') {
																								var data = {allow: true}
																								con.release();
																								res.send(data);
																							} else {
																								var filename = __dirname + '/newdesign/cashier.ejs';
																								var options = {}
																								var data = {rel: bt, queue: queue}
																								con.release();
																								ejs.renderFile(filename, data, options, function(err, str){
																									res.send(str);
																								});	
																							}
																						}
																						else{
																							data = {
																								allow: false,
																								msg:'Error!'
																							}
																							con.release();
																							res.send(data)
																						}
																					}
																					});
																				}
																				else{
																					data = {
																						allow: false,
																						msg:'Error!'
																					}
																					con.release();
																					res.send(data)
																				}
																			}
																		});
																	}else{
																		var filename = __dirname + '/newdesign/cashier.ejs';
																		var options = {}
																		var data = {rel: bt, queue: queue}
																		con.release();
																		ejs.renderFile(filename, data, options, function(err, str){
																			res.send(str);
																		});
																	}
																});
															}
															else {
																data = {
																	allow: false,
																	msg:'Full!'
																}
																con.release();
																res.send(data)
															}
														}
													}
												});
											} else {
												if(queue <= line) {
													console.log("12")
													var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
													con.query(sql_string , function(err, rows1, fields) {
														var ownqueue = rows1[0].queue_number;
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														} else if (ownqueue == null) {
															console.log("13")
															//change the stdnt to sess.studentid
															var sql_string = "UPDATE student SET counter = '"+ bt +"', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
															con.query(sql_string , function(err, rows1, fields) {
																if (err) {
																	data = {
																		allow: false,
																		msg:'Error!'
																	}
																	con.release();
																	res.send(data)
																}else{
																	if(rows1.affectedRows == 1){
																		console.log("14")
																		var str = "UPDATE "+ bt +" SET queue_line = '" + queue + "'";
																		con.query(str , function(err, rows2, fields) {
																		if (err) {
																			data = {
																				allow: false,
																				msg:'Error!'
																			}
																			con.release();
																			res.send(data)
																		}else{
																			if(rows1.affectedRows == 1){
																				console.log("15")
																				if (obj.validator == 'false') {
																					var data = {allow: true}
																					con.release();
																					res.send(data);
																				} else {
																					var filename = __dirname + '/newdesign/cashier.ejs';
																					var options = {}
																					var data = {rel: bt, queue: queue}
																					con.release();
																					ejs.renderFile(filename, data, options, function(err, str){
																						res.send(str);
																					});	
																				}
																			}
																			else{
																				data = {
																					allow: false,
																					msg:'Error!'
																				}
																				con.release();
																				res.send(data)
																			}
																		}
																		});
																	}
																	else{
																		data = {
																			allow: false,
																			msg:'Error!'
																		}
																		con.release();
																		res.send(data)
																	}
																}
															});
														}else{
															var filename = __dirname + '/newdesign/cashier.ejs';
															var options = {}
															var data = {rel: bt, queue: queue}
															con.release();
															ejs.renderFile(filename, data, options, function(err, str){
																res.send(str);
															});
														}
													});
												}
												else {
													data = {
														allow: false,
														msg:'Full!'
													}
													con.release();
													res.send(data)
												}
											}
										} else {
											data = {
												allow: false,
												msg:'No reservation!'
											}
											con.release();
											res.send(data)
										}
									}
								});
							} else {
								if(queue <= line) {
									console.log("16")
									var sql_string = "SELECT * FROM student WHERE student_id = '" + sess.studentid + "';";
									con.query(sql_string , function(err, rows1, fields) {
										var ownqueue = rows1[0].queue_number;
										if (err) {
											data = {
												allow: false,
												msg:'Error!'
											}
											con.release();
											res.send(data)
										} else if (ownqueue == null) {
											console.log("17")
											//change the stdnt to sess.studentid
											var sql_string = "UPDATE student SET counter = '"+ bt +"', queue_number = '" + queue + "' WHERE student_id = " + sess.studentid;
											con.query(sql_string , function(err, rows1, fields) {
												if (err) {
													data = {
														allow: false,
														msg:'Error!'
													}
													con.release();
													res.send(data)
												}else{
													if(rows1.affectedRows == 1){
														console.log("18")
														var str = "UPDATE "+ bt +" SET queue_line = '" + queue + "'";
														con.query(str , function(err, rows2, fields) {
														if (err) {
															data = {
																allow: false,
																msg:'Error!'
															}
															con.release();
															res.send(data)
														}else{
															if(rows1.affectedRows == 1){
																if (obj.validator == 'false') {
																	var data = {allow: true}
																	con.release();
																	res.send(data);
																} else {
																	console.log("19")
																	var filename = __dirname + '/newdesign/cashier.ejs';
																	var options = {}
																	var data = {rel: bt, queue: queue}
																	con.release();
																	ejs.renderFile(filename, data, options, function(err, str){
																		res.send(str);
																	});	
																}
															}
															else{
																data = {
																	allow: false,
																	msg:'Error!'
																}
																con.release();
																res.send(data)
															}
														}
														});
													}
													else{
														data = {
															allow: false,
															msg:'Error!'
														}
														con.release();
														res.send(data)
													}
												}
											});
										}else{
											var filename = __dirname + '/newdesign/cashier.ejs';
											var options = {}
											var data = {rel: bt, queue: queue}
											con.release();
											ejs.renderFile(filename, data, options, function(err, str){
												res.send(str);
											});
										}
									});
								}
								else {
									data = {
										allow: false,
										msg:'Full!'
									}
									con.release();
									res.send(data)
								}
							}
						}
				} else {
					data = {
						allow: false,
						msg:'Error!'
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

app.get('/done', function(req,res,html) {
	sess = req.session;
	if(sess.studentid) {
		con.getConnection(function(err,con){
		var str = "UPDATE student SET queue_number = null, counter = null, near = '0', wait = '0' WHERE student_id = "+ sess.studentid +"";
		con.query(str , function(err, rows2, fields) {
			if (err) {
				con.release();
				res.send({
					"code":204,
					"success":"Email does not exits"
				});
			}
			else {
				var filename = __dirname + '/newdesign/home.ejs';
				var options = {}
				var data = {rel: ''}
				con.release();
				ejs.renderFile(filename, data, options, function(err, str){
					res.send(str);
				});
			}
				
		});	
	});
	} else {
		res.redirect('/');
	}
	
});

app.get('/cancel', function(req,res,html) {
	sess = req.session;
	if(sess.studentid) {
		var bt = req.query.cnl;
		var btn = req.query.counter;
		console.log("counter: ",btn);
		con.getConnection(function(err,con){
		var sql_string = "SELECT * FROM student";
		con.query(sql_string , function(err, rows1, fields) {
			if (err) {
				con.release();
				res.send({
					"code":204,
					"success":"Email does not exits"
				});
			}
			else
			{				
				for (var i = 0; i < rows1.length; i++) {
					if(rows1[i].queue_number > btn){
						var x = rows1[i].queue_number - 1;
						con.getConnection(function(err,con){
							var str = "UPDATE student SET queue_number = " + x + " WHERE queue_number = "+ rows1[i].queue_number +"";
							con.query(str , function(err, rows2, fields) {
								if (err) {
									con.release();
									res.send({
										"code":204,
										"success":"Email does not exits"
									});
								}
								else
								{
									con.release();
								}
							});	
						});
					}
		
					if(rows1[i].queue_number == btn){
						
							var str = "UPDATE student SET queue_number = null, counter = null,near = '0', wait = '0' WHERE queue_number = "+ rows1[i].queue_number +"";
							con.query(str , function(err, rows2, fields) {
								if (err) {
									con.release();
									res.send({
										"code":204,
										"success":"Email does not exits"
									});
								}
							
							});	
						
					}
				}
				
				
					var str = "SELECT * FROM "+ bt +"";
					con.query(str , function(err, rows2, fields) {
						var x = rows2[0].queue_line - 1;
						if (err) {
							con.release();	
							res.send({
								"code":204,
								"success":"Email does not exits"
							});
						} else {
							var str = "UPDATE "+ bt +" SET queue_line = " + x + "";
							con.query(str , function(err, rows, fields) {
								if (err) {
									con.release();	
									res.send({
										"code":204,
										"success":"Email does not exits"
									});
								}
								else {
									var filename = __dirname + '/newdesign/home.ejs';
									var options = {}
									var data = {rel: ''}
									con.release();	
									ejs.renderFile(filename, data, options, function(err, str){
										res.send(str);
									});
								}
							});
						}
					});	
							
			}								
		});
	});
	} else {
		res.redirect('/');
	}
	
});

io.sockets.on('connection', (socket) => {
  //Remove comment for session
  //remove this variable
  //var stdnt = "10000125512";
  //sess= req.session;
  console.log("socket: ", socket.request.session.studentid);
  
  console.log('Socket connected');
  con.getConnection(function(err,con){
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
	  con.release();
	  socket.emit('alll', { rowcashierr: rowcashier,ccashierr: ccashier,rowenrolll: rowenroll,cenrolll: cenroll, rowregistrarr: rowregistrar,cregistrarr: cregistrar, rowproo: rowpro,cproo: cpro, queue: qnumber });
    });
  });
  
  con.getConnection(function(err,con){
  var str = "SELECT * FROM cashier;";
  str += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  con.release();
	  socket.emit('currentc', { row: rowcn, current: cnumber, queue: qnumber });
    });
  });
	
  con.getConnection(function(err,con){
  var str1 = "SELECT * FROM enrollment;";
  str1 += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str1,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  con.release();
	  socket.emit('currente', { row: rowcn, current: cnumber, queue: qnumber });
    });
  });
	
  con.getConnection(function(err,con){
  var str2 = "SELECT * FROM proware;";
  str2 += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str2,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  con.release();
	  socket.emit('currentp', { row: rowcn, current: cnumber, queue: qnumber });
    });
  });
	
  con.getConnection(function(err,con){
  var str3 = "SELECT * FROM registrar;";
  str3 += "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "';";
  con.query(str3,function(err,rows){
      if(err) throw err;
	  var rowc = '';
	  var rowcn = rows[0][0].queue_line;
	  var cnumber = rows[0][0].current_number;
	  var qnumber = rows[1][0].queue_number;
	  con.release();
	  socket.emit('currentr', { row: rowcn, current: cnumber, queue: qnumber });
    });
  });
  
  con.getConnection(function(err,con){
  var str4 = "SELECT * FROM reservation;";
  con.query(str4,function(err,rows){
      if(err) throw err;
	  for (var i = 0; i < rows.length; i++) {
		  console.log(rows[i].date, rows[i].counter)
	  }
	  con.release();
	  socket.emit('showrows', rows);
    });
  });

  
  
  con.getConnection(function(err,con){
  var str5 = "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "' ;";
	con.query(str5,function(err,rows){
      if(err) throw err;
	  else{
		  if(rows.length > 0){
				let q = rows[0].queue_number;
				let noQueue = (q === null);
				if(noQueue)
				{
					con.release();
					console.log("No queue number.");
				}
				else
				{
					let near = rows[0].near;
					let cnt = rows[0].counter;
					var str9 = "SELECT * FROM "+ cnt +";";
					con.query(str9,function(err,rows){
						if(err) throw err;
						else {
							if(rows.length > 0){
								console.log("TEXT USER")
								let toNumber = rows[0].phone_number;
								let text = "Hi! Your queue number is near, thankyou.";
								let data = {};
								let c = rows[0].current_number;
								let n1 = parseInt(q) - 5;
								let n2 = parseInt(q) - 2;
								// Sending SMS via Nexmo
								//dito lalagyan ng if
									if(c == n1){
										if(near == "0"){
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
											
											var str8 = "UPDATE student SET near = '1' WHERE student_id = '" + socket.request.session.studentid + "' ;";
											con.query(str8,function(err,rows){
												if(err) throw err;
												else{
													if(rows.affectedRows == 1){
														con.release()
														console.log("update successfully");
													} else {
														con.release()
														console.log("Error");
													}
												}
											});
										}
										else{
											con.release();
											console.log("You already text the user");
										}
									} else {
										con.release();
										console.log("Too early to text the user");
									}
								socket.emit('text', text);
							}
							else {
								con.release();
							}
						}
					});
				}
			}
			else {
				con.release();
			}
		}
	});
  });
  
  con.getConnection(function(err,con){
  var str6 = "SELECT * FROM student WHERE student_id = '" + socket.request.session.studentid + "' ;";
	con.query(str6,function(err,rows){
      if(err) throw err;
	  else{
		  if(rows.length > 0){
				let q = rows[0].queue_number;
				let noQueue = (q === null);
				if(noQueue)
				{
					con.release();
					console.log("No queue number.");
				}
				else
				{
					let wait = rows[0].wait;
					let cnt = rows[0].counter;
					var str9 = "SELECT * FROM "+ cnt +";";
					con.query(str9,function(err,rows){
						if(err) throw err;
						else {
							if(rows.length > 0){
								console.log("TEXT USER")
								let toNumber = rows[0].phone_number;
								let text1 = "Hi! Your queue number is near, thankyou.";
								let data = {};
								let c = rows[0].current_number;
								let n1 = parseInt(q) - 5;
								let n2 = parseInt(q) - 2;
								// Sending SMS via Nexmo
								//dito lalagyan ng if
									if(c == n1){
										if(wait == "0"){
											nexmo.message.sendSms(
											config.number, toNumber, text1, {type: 'unicode'},
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
											
											var str8 = "UPDATE student SET wait = '1' WHERE student_id = '" + socket.request.session.studentid + "' ;";
											con.query(str8,function(err,rows){
												if(err) throw err;
												else{
													if(rows.affectedRows == 1){
														con.release()
														console.log("update successfully");
													} else {
														con.release()
														console.log("Error");
													}
												}
											});
										}
										else{
											con.release();
											console.log("You already text the user");
										}
									} else {
										con.release();
										console.log("Too early to text the user");
									}
								socket.emit('text1', text1);
							}
							else {
								con.release();
							}
						}
					});
				}
			}
			else {
				con.release();
			}
		}
	});
  });
   
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
});

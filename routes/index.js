//from http://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619
var express = require('express');
var router = express.Router();

//need to add isAuthenticated
var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated()){
		console.log("is authenticated")
		return next();
	}
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}


module.exports = function(passport){
	// router.post('/login',
	//  	passport.authenticate('login'), 
	//  	function(req, res){
	//  		res.send(req.user);
	// 	}
	// );

/* Responds with an object guaranteed to have a 'status' property that is true or false. If true, 
the response object includes the 'uid' property that is the id of the user that is logged in. If false,
there is a msg property containing an error message. 

This method uses passportjs to handle authorization and sessions. 
*/
	router.post('/login', function(req, res, next) {
  		passport.authenticate('login', function(err, user, info) {
    		if (err) { 
    			return next(err); 
    		}
    		if (!user) { 
    			res.send({status: false, msg: "Username and password combination incorrect. Try again or register."});
    		}
   			req.logIn(user, function(err) {
     			if (err) { 
     				return next(err); 
     			}
      			res.send({status: true, uid: req.user._id});
    		});
  		})(req, res, next);
	});

/* Responds with an object guaranteed to have a 'status' property that is true or false. If true, 
the response object includes the 'uid' property that is the id of the user that is logged in. If false,
there is a msg property containing an error message. 

This method uses passportjs to handle authorization and sessions. 
*/
	router.post('/register', function(req, res, next) {
  		passport.authenticate('register', function(err, user, info) {
    		if (err) { 
    			return next(err); 
    		}
    		if (!user) { 
    			res.send({status: false, msg: "User may already be registered. Try logging in."});
    		}
   			req.logIn(user, function(err) {
     			if (err) { 
     				return next(err); 
     			}
      			res.send({status: true, uid: req.user._id});
    		});
  		})(req, res, next);
	});

	
	router.get('/logout', function(req, res) {
  		req.logout();
  		res.redirect('/');
	});
	
	router.get('/home', isAuthenticated, function(req, res){
		
		var id = req.user._id;
		var path = '/'// + id;
		//console.log("home path : " + path);
		//res.sendfile(path, {root: 'public'});
		res.redirect('/home/' + id)
	});


	router.get('/home/:uid', isAuthenticated, function(req, res){
		console.log("trying to get home " + req.body.uid);
		//res.sendfile('public/index.html');
		res.render('pages/home', { user: req.user });

	});

	return router;
}
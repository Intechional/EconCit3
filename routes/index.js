//auth logic is from http://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619
var express = require('express');
//var User = require('../models/user.js');
var UserModel = require('../models/models.js').UserModel;
var UserRoutes = require('./user.js');
var EconCitEntry = require('../models/models.js').EconCitEntryModel;
//EconCit module is stored in public so it is also accessible in the browser. Later this can be cleaned up with requirejs.
var EconCit = require('../public/js/econ-cit.js');
var router = express.Router();

/*isAuthenticated can be called as middleware for any route that only authorized users should have access to. 
*/
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

/* Responds with an object guaranteed to have a 'status' property that is true or false. If true, 
the response object includes the 'uid' property that is the id of the user that is logged in. If false,
there is a msg property containing an error message. 

This method uses passportjs to handle authorization and sessions. 
*/
	router.post('/login', function(req, res, next) {
  		passport.authenticate('login', function(err, user, info) {
    		if (err) { 
    			console.log(JSON.stringify(err));
    			return next(err); 
    		}
    		if (!user) { 
    			res.send({status: false, msg: "Username and password combination incorrect. Try again or register."});
    		}
   			req.logIn(user, function(err) {
     			if (err) { 
     				console.log(JSON.stringify(err));
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
    			console.log(JSON.stringify(err));
    			return next(err); 
    		}
    		if (!user) { 
    			res.send({status: false, msg: "User may already be registered. Try logging in."});
    		}
   			req.logIn(user, function(err) {
     			if (err) { 
     				console.log(JSON.stringify(err));
     				return next(err); 
     			}
      			res.send({status: true, uid: req.user._id});
    		});
  		})(req, res, next);
	});

	//this needs to end. 
	router.get('/logout', function(req, res) {
  		req.logout();
  		res.send({status:true});
	});
	
	router.get('/users/:uid', isAuthenticated, UserRoutes.getUser);
	//router.get('/createEntry/:uid', isAuthenticated, UserRoutes.createEntry);
	router.get('/getEntry/:uid/:entry_id', isAuthenticated, UserRoutes.getEntry);
//try posting for createntry:


router.post('/createEntry/:uid', isAuthenticated, UserRoutes.createEntry);

/*This method currently  assumes only one entry per user, and only updates category info. 
It needs to be generalized to handle updates to other entry attributes, choose a specific entry,
and update other user info.*/

	router.post('/updateEntryData/:uid/:entry_id', isAuthenticated, UserRoutes.updateEntryData);
	

	//must initialize the EconCit module to be available on the server side
	console.log("initing EconCit from routes/index.js");
	EconCit.init();

	return router;
}
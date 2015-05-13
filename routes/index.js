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
	router.get('/createEntry/:uid', isAuthenticated, UserRoutes.createEntry);
	router.get('/getEntry/:uid/:entry_id', isAuthenticated, UserRoutes.getEntry);
	// router.post('/updateEntry2/:uid', isAuthenticated, function(req, res){
	// 	var uid = req.params.uid;
	// 	var entry_id = req.params.entry_id;
	// 	console.log("updating user: " + uid + ", entry: " + entry_id);
	// 	UserModel.findById(uid, function(err, foundUser){
	// 		if(!err){
	// 			var entries = foundUser["entries"]; //need to check it's not undefined
	// 			var oldEntry =_und.findWhere(entries, {_id: entry_id})//need to check it's not undefined
	// 			var index =  entries.map(function(e) { return e._id; }).indexOf(entry_id);
	// 			var cat_name = Object.keys(req.body)[0];
	// 			var cat_names = EconCit.getCategoriesShallow();
	// 			if(EconCit.getCategoriesShallow().indexOf(cat_name) > -1){ // lazy validation
	// 				oldEntry["data"][cat_name] = req.body[cat_name];//coupled with schema
	// 				foundUser.entries[index] = oldEntry;
	// 				//attempt save
	// 				foundUser.markModified('entries'); //necessary to update this object that is a property of foundUser
	// 				foundUser.save(function (err) {
	//   					if (!err){
	//   						console.log("Updated user info. Id: " + uid);
	//   						return res.send({status: true, msg: "Entry updated."});
	//   					}else{
	//   						console.log("ERROR: failed to update user. Id: " + uid);
	//   						return res.send({status: false, msg: "Entry update failed."});
	//   					}
	//   				});
	// 			}else{
	// 				console.log("invalid category name in updateUserData request: " + cat_name);
	// 			}
	// 		}else{ //err on UserModel.findById
	// 			console.log("ERROR: user not found in db after auth, in updateEntry. Id: " + uid);
	// 			console.log(JSON.stringify(err));
	// 			return res.send({status: false, msg: "User not found. Database error."});
	// 		}
	// 	});	
	// });

/*This method currently  assumes only one entry per user, and only updates category info. 
It needs to be generalized to handle updates to other entry attributes, choose a specific entry,
and update other user info.*/

	router.post('/updateEntry/:uid/:entry_id', isAuthenticated, UserRoutes.updateEntry);
	// router.post('/updateUserData/:uid', isAuthenticated, function(req, res){
	// 	var uid = req.params.uid;
	// 	console.log("updating user: " + uid);
	// 	UserModel.findById(uid, function(err, foundUser){
	// 		if(!err){
	// 			console.log("found user to update: " + JSON.stringify(foundUser));
	// 			console.log(JSON.stringify(req.body));
	// 			if(foundUser.econCitData === undefined){
	// 				foundUser["econCitData"] = {};
	// 			}
	// 			var oldData = foundUser.econCitData;
	// 			var entry;
	// 			//assumes only one cat updated at a time
	// 			//needs validation
	// 			console.log("req body: " + JSON.stringify(req.body));
	// 			var cat_name = Object.keys(req.body)[0];
	// 			console.log("cat_name: " + cat_name);
	// 			var cat_names = EconCit.getCategoriesShallow();
	// 			console.log("cat names: " + cat_names);
	// 			if(EconCit.getCategoriesShallow().indexOf(cat_name) > -1){ // lazy validation
	// 				oldData[cat_name] = req.body[cat_name];
	// 				foundUser.econCitData = oldData;
	// 				//attempt save
	// 				foundUser.markModified('econCitData'); //necessary to update this object that is a property of foundUser
	// 				foundUser.save(function (err) {
	// 				//for now, assume only one entry. Only cases are zero or 1 entries
	//   					if (!err){
	//   						console.log("Updated user info. Id: " + uid);
	//   						return res.send({status: true, msg: "User data updated."});
	//   					}else{
	//   						console.log("ERROR: failed to update user. Id: " + uid);
	//   						return res.send({status: false, msg: "User data update failed."});
	//   					}
	//   				});
	// 			}else{
	// 				console.log("invalid category name in updateUserData request: " + cat_name);
	// 			}
	// 		}else{
	// 			console.log("ERROR: user not found in db after auth. Id: " + uid);
	// 			console.log(JSON.stringify(err));
	// 			return res.send({status: false, msg: "User not found. Database error."});
	// 		}
	// 	});
	// });

	//must initialize the EconCit module to be available on the server side
	console.log("initing EconCit from routes/index.js");
	EconCit.init();

	return router;
}
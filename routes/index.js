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
	//get basic
	router.get('/', function(req, res) {
	  res.render('pages/index');
	});

	//handle login post
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash: true
	}));

	router.get('/signup', function(req, res){
		res.render('pages/register', {message: req.flash('message')});
	});

	router.post('/signup', passport.authenticate('signup',{
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}))
	

	router.get('/home', isAuthenticated, function(req, res){
		res.render('pages/home', { user: req.user });
	});

	return router;
}
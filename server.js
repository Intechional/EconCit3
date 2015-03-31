var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var _und = require('underscore-node');

//DATABASE
console.log("DB creds: " + process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGOLAB_URI)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error:'));
db.once('open', function(callback){
	console.log("connected to db")
	
})

//APP basics
var app = express();
//use ejs as view engine, so view files are ejs
app.set('view engine', 'ejs');


//PASSPORT
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'})); //learn more about mySecretKey
app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());

var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);

//MAKE AVAILABLE
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
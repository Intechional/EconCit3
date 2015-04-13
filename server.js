var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var _und = require('underscore-node');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


//DATABASE

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

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cookieParser())

//PASSPORT
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mint icecream'})); //learn more about mySecretKey
app.use(passport.initialize());
app.use(passport.session());
var flash = require('connect-flash');
app.use(flash());
console.log("attempt to init passport:");
var initPassport = require('./passport/init.js');
initPassport(passport);

//routes
app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/public/js '))
var routes = require('./routes/index')(passport);
app.use('/', routes);

//MAKE AVAILABLE
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var _und = require('underscore-node');

//DATABASE
mongoose.connect(process.env.MONGOLAB_URI)
var db - mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback){
	var userSchema = mongoose.Schema({
		name: String,
		password: String,
		email: String,
		county:String
	});

	var User = mongoose.model('User', userSchema);
	var testUser = new User({name: "test", password: "secret", email: "h@mail.com", county: "Alameda"})
	userSchema.methods.validPassword =function(guess){
		var isValid = (guess === this.password);
		console.log("password is valid?" + isValid);
		return isValid;
	}
})

//SERVER
var app = express();
app.set('port', (process.env.PORT || 5005));
app.use(express.static(__dirname + '/public'));

//routes
app.get('/', function(request, response) {
  response.send('Hello World!');
});
app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect:'/login'}));

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
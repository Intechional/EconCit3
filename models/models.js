/*This file contains all models so it's easier to see how they relate. 
* To make the user model available in another file, use var User = require('../models/models.js').UserModel;
*/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EconCitEntry = new Schema({
		name: {type:String, default: "Untitled Entry"},
		start_date: Date, 
		end_date: Date,
		created: {type:Date, default: Date.now},
		data: {type:Object, default: {}}
	},
	{minimize:false}//allows data's default to be empty object
		//score: Number //this may be an object later
);

var UserSchema = new Schema({
		id:String,
		username: String,
		password: String,
		email: String,
		county:String,
		entries: [EconCitEntry] 
})

module.exports.UserModel = mongoose.model('User', UserSchema);
module.exports.EconCitEntryModel = mongoose.model('EconCitEntry', EconCitEntry);
var mongoose = require('mongoose');

//an EconCitScore belongs to a User. At the moment, a User has one EconCitScore, 
//but in the future a user can have multiple
module.exports = mongoose.model('EconCitEntry',{
		start: Date, 
		end: Date,
		created: Date,
		data: Schema.Types.ObjectId, 
		score: Number //this may be an object later
});


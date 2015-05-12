/*Defines routes for a user that is authenticated in passport
*/
var _und = require("underscore-node");
var EconCit = require('../public/js/econ-cit.js');
var UserModel = require('../models/models.js').UserModel;
var EconCitEntryModel = require('../models/models.js').EconCitEntryModel;

/*This function edits an existing entry that belongs to a user. 
*/
module.exports.updateEntry = function(req, res){
	//should have user id and entry id
	var uid = req.params.uid;
	var entry_id = req.params.entry_id;

};


exports.getUser = function(req, res){
		var uid = req.params.uid;
		console.log("getting user: " + uid);
		UserModel.findById(uid, function(err, foundUser){
			if(!err){
				console.log("found user: " + JSON.stringify(foundUser));
				return res.send(foundUser);
			}else{
				console.log("ERROR: user not found in db after auth. Id: " + uid);
				return res.send({status: false, msg: "User not found. Database error."});
			}
		});
}



/* createEntry requires a uid to be available in the request body. 
* creates an empty {} and pushes it into the user's "entries" attribute
* response sends the new entry as 'data' or error information
*/
exports.createEntry = function(req, res){
	var uid = req.params.uid;
	console.log("creating entry for user: " + uid);
	UserModel.findById(uid, function(err, foundUser){
			if(!err){
				//console.log("found user: " + JSON.stringify(foundUser));
				//console.log("Entries before push: " + JSON.stringify(entries));
				var new_entry = new EconCitEntryModel;
				foundUser.entries.push(new_entry);
				//console.log("Entries after push: " + JSON.stringify(entries));
				foundUser.save(function (err) {
  					if (!err){
  						console.log("Created entry for user with id: " + uid);
  						var new_entry = _und.last(foundUser["entries"]);//see if this gives us the new entry
  						return res.send({status: true, data: new_entry});
  					}else{
  						console.log("ERROR: failed to create entry for user with id: " + uid);
  						console.log(JSON.stringify(err));
  						return res.send({status: false, msg: "There was a problem creating a new entry."});
  					}
  				});				
			}else{
				console.log("ERROR: user not found in db after auth. Id: " + uid);
				return res.send({status: false, msg: "User not found. Entry not created. Database error."});
			}
		});

}


/*deleteEntry requires a uid and an entry_id to be available in the request body.
removes the entry from the user's "entries" attribute. 
response reports success or failure
*/
exports.deleteEntry = function(req, res){

}

/* getEntries requires a uid to be available in the request body. 
* If successful, sends a response containing the user's entries. (not necessarily necessary?)
*getUser covers this. 
*/
exports.getEntries = function(req, res){

}
/* getEntry requires a uid and an entry_id to be available in the request body. 
* If successful, sends a response containing that entry (not necessarily necessary?)
* getUser covers this. 
*/
exports.getEntry = function(req, res){
	console.log("in getEntry");
	var uid = req.body.uid;
	var entry_id = req.body.entry_id;
	console.log("user id: " + uid + " entry_id: " + entry_id);
	UserModel.findById(uid, function(err, foundUser){
		if(!err){
			var entries = foundUser["entries"]; 
			var entry = _und.findWhere(entries, {_id: entry_id})
			if(!(entry === undefined)){
				return res.send(entry);
			}else{
				console.log("ERROR: Entry not found");
				console.log(JSON.stringify(err));
				return res.send({status: false, msg: "Entry not found."});
			}
		}else{
			console.log("ERROR: db error when fetching user in getEntry");
			return res.send({status: false, msg: "Entry not found. Database error."});
		}
	});
}

/*updateEntry requires a uid and an entry_id to be available in the request body.
Updates the entry. Response contains updated entry. 

PSUEDOCODE. NOT TESTED. 
*/
exports.updateEntry = function(req, res){
	var uid = req.params.uid;
	var entry_id = req.params.entry_id;
	console.log("updating user: " + uid + ", entry: " + entry_id);
	UserModel.findById(uid, function(err, foundUser){
		if(!err){
			var entries = foundUser["entries"]; //need to check it's not undefined
			var oldEntry =_und.findWhere(entries, {_id: entry_id})//need to check it's not undefined
			var index =  entries.map(function(e) { return e._id; }).indexOf(entry_id);
			var cat_name = Object.keys(req.body)[0];
			var cat_names = EconCit.getCategoriesShallow();
			if(EconCit.getCategoriesShallow().indexOf(cat_name) > -1){ // lazy validation
				oldEntry["data"][cat_name] = req.body[cat_name];//coupled with schema
				foundUser.entries[index] = oldEntry;
				//attempt save
				foundUser.markModified('entries'); //necessary to update this object that is a property of foundUser
				foundUser.save(function (err) {
  					if (!err){
  						console.log("Updated user info. Id: " + uid);
  						return res.send({status: true, msg: "Entry updated."});
  					}else{
  						console.log("ERROR: failed to update user. Id: " + uid);
  						return res.send({status: false, msg: "Entry update failed."});
  					}
  				});
			}else{
				console.log("invalid category name in updateUserData request: " + cat_name);
			}
		}else{ //err on UserModel.findById
			console.log("ERROR: user not found in db after auth, in updateEntry. Id: " + uid);
			console.log(JSON.stringify(err));
			return res.send({status: false, msg: "User not found. Database error."});
		}
	});
}


//temp fn to test exporting fns from here to index.js
/*This method currently  assumes only one entry per user, and only updates category info. 
It needs to be generalized to handle updates to other entry attributes, choose a specific entry,
and update other user info.*/
exports.updateUserData= function(req, res){
	var uid = req.params.uid;
	console.log("updating user: " + uid);
	UserModel.findById(uid, function(err, foundUser){
		if(!err){
			console.log("found user to update: " + JSON.stringify(foundUser));
			console.log(JSON.stringify(req.body));
			if(foundUser.entries.length === 0){
				foundUser["entries"].push({});
			}
			var oldData = foundUser.entries[0]; //temporary - testing array in schema
			//assumes only one cat updated at a time
			//needs validation
			console.log("req body: " + JSON.stringify(req.body));
			var cat_name = Object.keys(req.body)[0];
			console.log("cat_name: " + cat_name);
			var cat_names = EconCit.getCategoriesShallow();
			console.log("cat names: " + cat_names);
			if(EconCit.getCategoriesShallow().indexOf(cat_name) > -1){ // lazy validation
				oldData[cat_name] = req.body[cat_name];
				foundUser.entries[0] = (oldData);
				//attempt save
				foundUser.markModified('entries'); //necessary to update this object that is a property of foundUser
				foundUser.save(function (err) {
				//for now, assume only one entry. Only cases are zero or 1 entries
  					if (!err){
  						console.log("Updated user info. Id: " + uid);
  						return res.send({status: true, msg: "User data updated."});
  					}else{
  						console.log("ERROR: failed to update user. Id: " + uid);
  						return res.send({status: false, msg: "User data update failed."});
  					}
  				});
			}else{
				console.log("invalid category name in updateUserData request: " + cat_name);
			}
		}else{
			console.log("ERROR: user not found in db after auth. Id: " + uid);
			console.log(JSON.stringify(err));
			return res.send({status: false, msg: "User not found. Database error."});
		}
	});
};

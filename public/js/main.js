(function($){
	//for now, implement LoginView here
	var LoginView = Backbone.View.extend({
		el: '#user-home-container',
		template: window.JST['login'],
		initialize: function(){
			this.render();
		},
		render: function(){
			var html = this.template();
			$(this.el).html(html);
		},
		events :{
			"click button#register-button" : "goToRegister",
			"click button#login-submit-button" : "attemptLogin"
		},
		goToRegister : function(){
			app.navigate("signup", {trigger: true});
		},
		attemptLogin : function(){
			var url = CONFIG.base_url + "login";
			var data ={
				"username" : $('#login-username').val(),
				"password" : $('#login-password').val()
			};
			console.log("login post url: " + url );
			$("#login-form").ajaxForm({
					url: url, 
					type: 'post', 
					success: function(data){
						if(data.status === true){
							$(".error-container").html(""); //clear any error message
							app.navigate("home/" + data.uid, {trigger: true});
						}else{
							$(".error-container").html("Incorrect username or password.");
						}
					},
					error :function(jqXHR,textStatus, errorThrown){
						console.log("Error: " + errorThrown);
						console.log("jqXHR " + JSON.stringify(jqXHR));
						console.log("textStatus" + textStatus);

						$(".error-container").html("There was a server error. Please try again later.");
					}
			});
		}
	});

	//for now, implement RegisterView here
	var RegisterView = Backbone.View.extend({
		el: '#user-home-container',
		template: window.JST['register'],
		initialize: function(){
			this.render();
		},
		render: function(){
			var html = this.template();
			$(this.el).html(html);
		},
		events :{
			"click button#login-button" : "goToLogin",
			"click button#register-submit-button" : "attemptRegister", 
		},
		goToLogin : function(){
			app.navigate("",{trigger: true});
		}, 
		attemptRegister : function(e){
			var url = CONFIG.base_url + "register";
			console.log("register post url: " + url );
			var data ={
				"username" : $('#register-username').val(),
				"password" : $('#register-password').val(),
				"email" : $('#register-email').val(),
				"county" : $('#register-county').val()
			};
			console.log("registering " + JSON.stringify(data));
			//not sure why this is causing problems. Possible to ask people to manually go back to home for the demo purpose. 
			$("#register-form").ajaxForm({
					url: url, 
					type: 'post', 
					success: function(data){
						console.log("success returned from register ajax")
						if(data.status === true){
							$(".error-container").html(""); //clear any error message
							app.navigate("home/" + data.uid, {trigger: true});
						}else{
							$(".error-container").html(data.msg);
						}
					},
					error :function(){
						console.log("error returned from register ajax");
						$(".error-container").html("There was a server error. Please try again later.");
					}
			});
			console.log("ajax called, maybe not returned");
		}
	})

	var EconCitCategory = Backbone.Model.extend({
		/*an EconCitCategory model is constructed
		by passing this constructor an object that 
		is a category object from the EconCit module, 
		with the added property 'user.' The 'user' property
		should be filled with the object of the current user.
		*/
	});

	/*An EconCitCategoryView is created for each 
	category in the EconCit module. It is called from within
	the UserView, at the moment. 
	*/
	var EconCitCategoryView = Backbone.View.extend({
		model: EconCitCategory,
		initialize: function(){
			_.bindAll(this, 'render', 'saveCategoryInfo');
			this.render();
		},
		render: function(){
			var tab_info = {"tab_title": this.model.get("name"), 
							"display_name" : this.model.get("displayName"),
							"instructions": this.model.get("instructions")};
			//the following code is coupled with the econ_cit_input_skeleton template in jst.js
			var tab_nav_template = window.JST['tab_nav_basic'];
			var tab_pane_template = window.JST['tab_pane_basic'];
			$('.nav-tabs').append(tab_nav_template(tab_info));
			$('.tab-content').append(tab_pane_template(tab_info));
			//handle inputs. Kinda messy. Move to own model & view?
			var cat_inputs = this.model.get("inputs");
	        var input_keys = Object.keys(cat_inputs);
	        var selector = "#" + this.model.get("name") + "_inputs_container"
	        var input_template = window.JST['input_basic'] ;
	        var cat_name = this.model.get("name");
	        var user_data = this.model.get("user_data");
	        _.each(input_keys, function(input_key, index, list){
	        	var input_value = cat_inputs[input_key];//input value is default
	        	/*note: we do all this checking here so that we can save init the "data" field of an economic citizenship entry 
	        	to empty (so that the server's model code, and code here, is not coupled with the econ-cit.js module). JS tends to ignore fields whose values are empty objects*/
	        	if(!(user_data === undefined)){//replace input value with user's saved value, if available
	        		if(!(user_data[cat_name] === undefined)){
	        			if(!(user_data[cat_name][input_key] === undefined)){
	        				input_value = user_data[cat_name][input_key];
	        			}
	        		}
	        	}
	            var input_info = {"tab_title": cat_name,"input_key" : input_key, "input_value": input_value};     
	            $(selector).append(input_template(input_info));
	        });
	        var button_selector = "#" + this.model.get("name") + "_save_button"; //has to match buttton id in template
	        //bind the save button
	        $(button_selector).click(this.saveCategoryInfo);
		},
		infoIsValid: function(cat_info){
			var cat_name = this.model.get("name");
			var validationResult = EconCit.validate(cat_name, cat_info);
			//console.log(validationResult)
			var validationStatus = validationResult["status"];
			var error_selector = "#" + cat_name + "_error_container"
			if(!validationStatus){
				$(error_selector).html("") //clear
	            _.each(validationResult["messages"], function(element){
	                console.log(element);
	                $(error_selector).append("<p>" + element + "</p>");
	            });
	            return false;
			}else{
				 $(error_selector).html(""); //clear error messages
				 return true;
			}
		},
		saveCategoryInfo: function(e){
			e.stopImmediatePropagation();
        	e.preventDefault();
        	var uid = this.model.get("uid");
        	var entry_id = this.model.get("entry_id");
	        var cat_name = this.model.get("name");
	        var cat_inputs = this.model.get("inputs");
	        var cat_info ={}; 
			var input_keys = Object.keys(cat_inputs)
	        _.each(input_keys, function(input_key, index, list){
	            var input_selector = '#' + input_key + "_input"; //has to match input id in template
	            var input_value = $(input_selector).val()
	            cat_info[input_key] = input_value; //needs some validation   
        	});
        	//assume valid for now:
        	if(this.infoIsValid(cat_info)){
	        	//var save_data_url_base =  CONFIG.base_url + "updateUserData/";
	        	var save_data_url_base = CONFIG.base_url + "updateEntryData/";
	            var save_data_url = save_data_url_base + uid+ "/" + entry_id;
	           	console.log("save_data_url: " + save_data_url);
	            var data_to_send = {};
	            data_to_send[cat_name] = cat_info;
	            var catView = this;
	            $.ajax( {
	            	url: save_data_url,
	                type: "POST",
	                //dataType: "json",
	                data: data_to_send,
	                success: function(response){
	                    console.log(response);
	                    //show success message in error container.
	                    catView.updateScore(cat_name, cat_info);
	                }, 
	                error: function(response){
	                	console.log(response);
	                	//show error message in error container. 
	                }
	            });
	        }
		},
		updateScore: function(cat_name, cat_info){
			//var user = new User({_id: this.model.get("uid")});
			//user.fetch({
				//success: function(){
					console.log("fetched user, updating score");
					var el = "#score-container";
					var score = EconCit.getSubScore(cat_name, cat_info);
					var score_html = "<p>Your subscore for the " + cat_name + " category is: " + score + "</p>";
					$(el).append(score_html);
					console.log("update score");
				//},
				// error: function(){
				// 	console.log("error fetching user on updateScore");
				// }
			//});

		}
	});

	//for now, implement User model here (for Backbone)
	var User = Backbone.Model.extend({
		url : function(){
			var base_url = CONFIG.base_url;
			var id = this.get("_id");
			//if id is available, use 'users/:id' else just use "users/""
			return id ? base_url + 'users/' + id : base_url + 'users';
		}
	});


/* The Entry model just allows us to make an Entry-based views. 
*/
	var Entry = Backbone.Model.extend({
		//create by passing the user's entry object, which is already json
	});

/*Assumes this must be passed an Entry model that is composed of an entry from
the user's entry list, AUGMENTED with a 'uid' field that is the user's id. 
*/
	var EntryDisplayView = Backbone.View.extend({
		initialize: function(){
			_.bindAll(this, 'render', 'goToEdit');
			this.render();
		},
		render: function(){
			var entry_id = this.model.get("_id");
			var uid = this.model.get("uid");
			var info_string = JSON.stringify(this.model);
			var entry_name = this.model.get("name");
			var start_date = (new Date(this.model.get("start_date"))).toDateString();
			var end_date = (new Date(this.model.get("end_date"))).toDateString();
			var entry_data = {"entry_name": entry_name, "start_date": start_date, "end_date": end_date, "entry_id": entry_id}
			var entry_display_template  = window.JST['entry_display'];
			var html = entry_display_template(entry_data);
			$("#entry-list").append(html);
			var button_selector = "#edit-" + entry_id;
			$(button_selector).click(this.goToEdit);
		}, 
		goToEdit :function(){
			console.log("So you want to edit entry id: " + this.model.get("_id"));
			//var navigation_string = "editEntry/" + this.model.get("uid") + "/" + this.model.get("_id"); 
			//app.navigate(navigation_string, {trigger: true});
			app.editEntry(this.model.get("uid"), this.model.get("_id") );
		}
	})



/* To avoid having to deal with a collection view, the model for EntriesDisplayView is 
actually a User. afterRender treats the user's entries as a collection without having
to mess with collection views. 
*/
	var UserEntriesDisplayView = Backbone.View.extend({
		el: $('#econ-cit-container')
	,   initialize: function(){
			_.bindAll(this, 'render', 'createEntry'); 
            this.render = _.wrap(this.render, function(render) {	//keeps 'this' this in afterRender
                render();
                this.afterRender();
            });
			this.render(); 
		}
	,   render: function(){
			var display_skeleton_html = window.JST['display_skeleton'];
			$('#econ-cit-container').html(display_skeleton_html);
			var create_entry_html = window.JST['create_entry'];
			$('#create_entry_container').html(create_entry_html);
			$('#create-entry-button').click(this.createEntry);
		}
	, 	afterRender: function(){
			var entries = this.model.get("entries");
			var uid = this.model.get("_id");
			_.each(entries, function(entry, index, list){
					entry["uid"] = uid;
					var entry_model = new Entry(entry);
					var entry_display_view = new EntryDisplayView({model: entry_model})
			});
		}
	, 	createEntry: function(e){
			e.preventDefault();
			console.log("so you wanna make a new entry?");
			var uid = this.model.get("_id")
			var url = CONFIG.base_url + "createEntry/" + uid;
			var name = $('#new-entry-name').val();
			var start_date =  $('#start-date').val();
			var end_date = $('#end-date').val();
			var data = {"name" : name, "start_date": start_date, "end_date": end_date}
			console.log(url);
			$.ajax({
				url: url, 
				type: 'post',
				data: data, 
				success : function(data, status, jqXHR){
					var new_entry = data["data"];
					var entry_id = new_entry["_id"];
					app.editEntry(uid,entry_id);
				},
				error: function(jqXHR, status, errorThrown){
					console.log("ERROR: " + JSON.stringify(jqXHR) + status + JSON.stringify(errorThrown));
				}
			});
		}
	});

	var UserHomeView = Backbone.View.extend({
		el: $('#user-home-container')
	,	initialize : function(){
			console.log("init user view");
			//the following lines allow us to render category views after the user view is rendered. 
			_.bindAll(this, 'render'); //keeps 'this' this in afterRender
			this.render(); 
		}
	,	render: function(){
			var username = this.model.get("username");
			var skeleton_template = window.JST['user_skeleton'];
			$(this.el).html(skeleton_template({"username" : username}));
			$('#logout-button').click(this.logout);
			var entries_display = new UserEntriesDisplayView({model: this.model}); //pass user as model to entriesDisplayView
		}
	,   logout : function(e){
        	var url = CONFIG.base_url + "logout";
			$.ajax({
				url: url,
				success: function(){
					alert("You're logged out.");
					app.navigate("", {trigger: true});
					
				},
				error : function(){
					alert("Please close your browser to logout.");
					app.navigate("", {trigger: true});
				}
			});
		}
	})

/*EntryEditView assumes it is  passed an Entry model that is composed of an entry from
the user's entry list, AUGMENTED with a 'uid' field that is the user's id
*/
	var EntryEditView = Backbone.View.extend({
		el: $('#econ-cit-container')
	,	initialize: function(){
			_.bindAll(this, 'render', 'calculateTotalScore', 'clearScoreInfo'); 
            this.render = _.wrap(this.render, function(render) {//keeps 'this' this in afterRender
                render();
                this.afterRender();
            });
			this.render(); 
		}
	,	render: function(){
			var entry_name = this.model.get("name");
			var start_date = (new Date(this.model.get("start_date"))).toDateString();
			var end_date = (new Date(this.model.get("end_date"))).toDateString();
			var entry_data = {"entry_name": entry_name, "start_date": start_date, "end_date": end_date}
			var econ_cit_input_skeleton_html = window.JST['econ_cit_input_skeleton'];
			$("#econ-cit-container").html(econ_cit_input_skeleton_html(entry_data)); //replace display view
			$('#total-score-button').click(this.calculateTotalScore);
			$('#clear-score-button').click(this.clearScoreInfo);
		}
	, 	clearScoreInfo: function(){
			$("#score-container").html("");

		}
	,	calculateTotalScore:function(){
			console.log("wanna get your total score?")
			console.log(JSON.stringify(this.model));
			var el = "#score-container";
			var error_selector = "#score-container .error-container"
			var status =  false;
			var msg = "";
			var user = new User({_id: this.model.get("uid")});
			var entry_id = this.model.get("_id");
			user.fetch({
				success: function(user, res){
					var entries = user.get('entries');
					var entry = _.findWhere(entries, {_id: entry_id});
					console.log(JSON.stringify(entry));
					if(entry["data"] === undefined){
						msg = "You have no Economic Citizenship data saved. Please enter all information for all categories and try again.";
					}else{
						console.log("fetched updated user information");
						//check if all categories available
						var expected_cats = EconCit.getCategoriesShallow();
						var found_cats = Object.keys(entry["data"]);
						console.log("expected: " + expected_cats.toString())
						console.log("filled: " + found_cats.toString())
						if(expected_cats.length == found_cats.length){
							var score = EconCit.scoreEntry(entry["data"]);
							msg = "YOUR ECONOMIC CITIZENSHIP SCORE IS: " + score + ".";
							status = true;
						}else{ 
							var unfilled_cats = _.difference(expected_cats, found_cats);
							console.log(unfilled_cats.toString())
							msg = "Please enter information for the following categories and then try again: " + unfilled_cats.toString();
						}
					}
					console.log(msg);
					$(el).append(msg);
				},
				error: function(user, res){
					msg = "There was a server error. Please try again later.";
					console.log("ERROR fetching user: " + JSON.stringify(res));
					$(el).append(msg);
				}
			});
		}
	,	afterRender:function(){
			console.log(JSON.stringify(this.model));
			var uid = this.model.get("uid"); //the model of this view is an entry, that has been AUGMENTED with uid field
			var user_data = this.model.get("data"); //will be undefined if user has no data saved
			var entry_id = this.model.get("_id");
			var cats_deep = EconCit.getCategoriesDeep();
			var cat_names = EconCit.getCategoriesShallow();
			console.log(JSON.stringify(cat_names));
			_.each(cat_names, function(cat_name, index, list){
				var cat = cats_deep[cat_name];
				cat["name"] = cat_name; //make key a 'name' property of object
				cat["uid"] = uid;//makes sure cat view has access to user's id
				cat["entry_id"] = entry_id;
				cat["user_data"] = user_data// passing user's data for all categories
				//create new model from cat, which now also contains the user, and make a view:
				var cat_model = new EconCitCategory(cat);
				var cat_view = new EconCitCategoryView({model: cat_model});
			});
			$('.tab-pane:first').addClass("active");//ensures the first tab is visible
		}
	});

	var UserView = Backbone.View.extend({
		el: $('#user-home-container'),
		events: {},
		initialize : function(){
			console.log("init user view");
			//the following lines allow us to render category views after the user view is rendered. 
			_.bindAll(this, 'render', 'calculateTotalScore', 'createEntry'); //keeps 'this' this in afterRender
            this.render = _.wrap(this.render, function(render) {
                render();
                this.afterRender();
            });
			this.render(); 
		},
		render: function(){
			//set up skeleton for econ cit entry inputs
			var username = this.model.get("username");
			var skeleton_template = window.JST['user_skeleton'];
			$(this.el).html(skeleton_template({"username" : username}));
			var econ_cit_input_skeleton_html = window.JST['econ_cit_input_skeleton'];
			$("#econ-cit-container").append(econ_cit_input_skeleton_html);
			$('#total-score-button').click(this.calculateTotalScore);
			$('#logout-button').click(this.logout);
			$('#create-entry-button-old').click(this.createEntry);//temporary
		},
		createEntry: function(){
			console.log("so you wanna make a new entry?");
			var uid = this.model.get("_id")
			var url = CONFIG.base_url + "createEntry/" + uid;
			$.ajax({
				url: url, 
				success : function(data, status, jqXHR){
					console.log(JSON.stringify(data));
				},
				error: function(jqXHR, status, errorThrown){
					console.log("ERROR: " + status);
				}
			});
		},
		afterRender: function(){
			console.log("after render")
			var user_model = this.model;
			var cats_deep = EconCit.getCategoriesDeep();
			var cat_names = EconCit.getCategoriesShallow();
			console.log(JSON.stringify(cat_names));
			_.each(cat_names, function(cat_name, index, list){
				var cat = cats_deep[cat_name];
				cat["name"] = cat_name; //make key a 'name' property of object
				cat["user"] = user_model;//sends entire user model object to category view for saving info. Can we do this better?
				//create new model from cat, which now also contains the user, and make a view:
				var cat_model = new EconCitCategory(cat);
				var cat_view = new EconCitCategoryView({model: cat_model});
			});
			$('.tab-pane:first').addClass("active");
		},
		calculateTotalScore: function(){
			var el = "#score-container";
			var status =  false;
			var msg = "";
			this.model.fetch({
				success: function(user, res){
					var econCitData = user.get("econCitData");
					if(econCitData === undefined){
						msg = "You have no Economic Citizenship data saved. Please enter all information for all categories and try again.";
					}else{
						console.log("fetched updated user information");
						//check if all categories available
						var expected_cats = EconCit.getCategoriesShallow();
						var found_cats = Object.keys(econCitData);
						console.log("expected: " + expected_cats.toString())
						console.log("filled: " + found_cats.toString())
						if(expected_cats.length == found_cats.length){
							var score = EconCit.scoreEntry(econCitData);
							msg = "YOUR ECONOMIC CITIZENSHIP SCORE IS: " + score + ".";
							status = true;
						}else{ 
							var unfilled_cats = _.difference(expected_cats, found_cats);
							console.log(unfilled_cats.toString())
							msg = "Please enter information for the following categories and then try again: " + unfilled_cats.toString();
						}
					}
					console.log(msg);
					$(el).append(msg);
				},
				error: function(user, res){
					msg = "There was a server error. Please try again later.";
					console.log("ERROR fetching user: " + JSON.stringify(res));
					$(el).append(msg);
				}
			});
		},
		logout : function(e){
        	var url = CONFIG.base_url + "logout";
			$.ajax({
				url: url,
				success: function(){
					alert("You're logged out.");
					app.navigate("", {trigger: true});
					
				},
				error : function(){
					alert("Please close your browser to logout.");
					app.navigate("", {trigger: true});
				}
			});
		}
	});



	var AppRouter = Backbone.Router.extend({
		routes: {
			"": "login",
			"signup" : "register",
			"home/:id" : "home",
			"editEntry/:uid/:entry_id" : "editEntry"
		},
		login: function(){
			this.login_view = new LoginView();
		},
		register :function(){
			console.log("REGISTER")
			this.register_view = new RegisterView();
		},
		home: function(id){
			var user = new User({_id: id});
			user.fetch({
				success: function(user, res){
					//can we attach user view to the app object somehow?
					//var user_view = new UserView({model: user});
					var user_view = new UserHomeView({model: user});
				},
				error: function(user, res){
					console.log("after fetch: " + JSON.stringify(res));
				}
			});	
		},
		editEntry: function(uid, entry_id){
			console.log("in editEntry");
			var user = new User({_id: uid});
			//hack:fetches user because I was blocked by wierd CORS issues with a raw ajax to getEntry on the localhost
			user.fetch({
				success: function(user, res){
					var entries = user.get('entries');
					var entry = _.findWhere(entries, {_id: entry_id});
					console.log(JSON.stringify(entry));
					entry["uid"] = user.get("_id");
					entry = new Entry(entry);
					//entry model now has uid attached
					var entry_edit_view = new EntryEditView({model:entry});
				},
				error: function(user, res){
					console.log("after fetch: " + JSON.stringify(res));
				}
			});

		}
	});

	//TODO: programmatically match CONFIG with Heroku enviro variables. NOPE: not possible in browser. 
	var CONFIG = {};
	var base_url = window.location.href;
	//var base_url = "http://localhost:5000/";
	//var base_url = "https://econ-cit3.herokuapp.com/"
	console.log("base_url set to : " + base_url);
	CONFIG["base_url"] = base_url;

	console.log("initing ECONCIT")
	EconCit.init();



	var app = new AppRouter();
	Backbone.history.start();


})(jQuery);

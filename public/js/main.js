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
			var tab_info = {"tab_title": this.model.get("name"), "display_name" : this.model.get("displayName")};
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
	        var econCitData = this.model.get("user").get("econCitData");
	        _.each(input_keys, function(input_key, index, list){
	        	var input_value = cat_inputs[input_key];
	        	if(!(econCitData === undefined)){
	        		if(!(econCitData[cat_name] === undefined)){
	        			if(!(econCitData[cat_name][input_key] === undefined)){
	        				input_value = econCitData[cat_name][input_key];
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
        	var user_model = this.model.get("user");
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
	        	var save_data_url_base =  CONFIG.base_url + "updateUserData/";
	            var save_data_url = save_data_url_base + user_model.get("_id");
	            var data_to_send = {};
	            data_to_send[cat_name] = cat_info;
	            var catView = this;
	            $.ajax(save_data_url, {
	                type: "POST",
	                dataType: "json",
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
			var el = "#score_container";
			var score = EconCit.getSubScore(cat_name, cat_info);
			var score_html = "<p>Your subscore for the " + cat_name + " category is: " + score + "</p>";
			$(el).append(score_html);
			console.log("update score");
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

	var UserView = Backbone.View.extend({
		el: $('#user-home-container'),
		events: {},
		initialize : function(){
			console.log("init user view");
			//the following lines allow us to render category views after the user view is rendered. 
			_.bindAll(this, 'render', 'calculateTotalScore'); //keeps 'this' this in afterRender
            this.render = _.wrap(this.render, function(render) {
                render();
                this.afterRender();
            });
			this.render(); 
		},
		render: function(){
			//set up skeleton for econ cit entry inputs
			var username = this.model.get("username");
			var header_template = window.JST['user_header'];
			$(this.el).html(header_template({"username" : username}));
			var skeleton_html = window.JST['econ_cit_input_skeleton'];
			$(this.el).append(skeleton_html);
			$('#total-score-button').click(this.calculateTotalScore);


			$('#logout-button').click(this.logout);
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
			var el = "#score_container";
			var status =  false;
			var msg = "";
			this.model.fetch({
				success: function(user, res){
					var econCitData = user.get("econCitData");
					if(econCitData === undefined){
						msg = "You have no Economic Citizenship data saved. Please enter all information for all categories and try again.";
					}else{
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
			"home/:id" : "home"
		},
		login: function(){
			this.login_view = new LoginView();
		},
		register :function(){
			console.log("REGISTER")
			this.register_view = new RegisterView();
		},
		home: function(id){
			console.log("home for user with id:" + id);
			var user = new User({_id: id});
			console.log("user _id attr: " + user.get("_id"));
			console.log("before fetch: " + JSON.stringify(user));
			user.fetch({
				success: function(user, res){
					//can we attach user view to the app object somehow?
					

					var user_view = new UserView({model: user});
				},
				error: function(user, res){
					console.log("after fetch: " + JSON.stringify(res));
				}
			});
			
		}
	});

	//TODO: programmatically match CONFIG with Heroku enviro variables
	var CONFIG = {};
	//var base_url = window.location.href;
	//var base_url = "http://localhost:5000/";
	var base_url = "https://econ-cit3.herokuapp.com/"
	console.log("base_url set to : " + base_url);
	CONFIG["base_url"] = base_url;

	console.log("initing ECONCIT")
	EconCit.init();



	var app = new AppRouter();
	Backbone.history.start();


})(jQuery);

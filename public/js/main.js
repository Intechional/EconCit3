(function($){
	//for now, implement LoginView here
	var LoginView = Backbone.View.extend({
		el: '#user-home-container',
		template: window.JST['login'],
		initialize: function(){
			console.log("initing")
			this.render();
		},
		render: function(){
			console.log("rendering");
			var html = this.template();
			$(this.el).html(html);
		},
		events :{
			"click button#register-button" : "goToRegister",
			"click button#login-submit-button" : "attemptLogin"
		},
		goToRegister : function(){
			app.navigate("register", {trigger: true});
		},
		attemptLogin : function(){
			var url = CONFIG.base_url + "login";
			var data ={
				"username" : $('#login-username').val(),
				"password" : $('#login-password').val()
			};
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
			console.log("initing")
			this.render();
		},
		render: function(){
			console.log("rendering");
			var html = this.template();
			$(this.el).html(html);
		},
		events :{
			"click button#login-button" : "goToLogin",
			"click button#register-submit-button" : "attemptRegister"
		},
		goToLogin : function(){
			app.navigate("",{trigger: true});
		}, 
		attemptRegister : function(){
			var url = CONFIG.base_url + "register";
			var data ={
				"username" : $('#register-username').val(),
				"password" : $('#register-password').val(),
				"email" : $('#register-email').val(),
				"county" : $('#register-county').val()
			};
			console.log("registering " + JSON.stringify(data));
			$("#register-form").ajaxForm({
					url: url, 
					type: 'post', 
					success: function(data){
						if(data.status === true){
							$(".error-container").html(""); //clear any error message
							app.navigate("home/" + data.uid, {trigger: true});
						}else{
							$(".error-container").html(data.msg);
						}
					},
					error :function(){
						$(".error-container").html("There was a server error. Please try again later.");
					}
			});

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
			console.log("rendering cat: " +  this.model.get("name"));
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
	        _.each(input_keys, function(input_key, index, list){
	            console.log("input key in render: " + input_key)
	            var input_info = {"tab_title": cat_name,"input_key" : input_key, "input_value": cat_inputs[input_key]};     
	            $(selector).append(input_template(input_info));
	        });
	        var button_selector = "#" + this.model.get("name") + "_save_button"; //has to match buttton id in template
	        //bind the save button
	        $(button_selector).click(this.saveCategoryInfo);
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
        	var save_data_url_base =  CONFIG.base_url + "updateUserData/";
            var save_data_url = save_data_url_base + user_model.get("_id");
            var data_to_send = {};
            data_to_send[cat_name] = cat_info;
            $.ajax(save_data_url, {
                type: "POST",
                dataType: "json",
                data: data_to_send,
                success: function(response){
                    console.log(response);
                    //show success message in error container.
                }, 
                error: function(response){
                	console.log(response);
                	//show error message in error container. 
                }
            });
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
			_.bindAll(this, 'render'); //keeps 'this' this in afterRender
            this.render = _.wrap(this.render, function(render) {
                render();
                this.afterRender();
            });
			this.render(); 
		},
		render: function(){
			//set up skeleton for econ cit entry inputs
			var skeleton_html = window.JST['econ_cit_input_skeleton'];
			$(this.el).html(skeleton_html);
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
		}
	});



	var AppRouter = Backbone.Router.extend({
		routes: {
			"": "login",
			"register" : "register",
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
					EconCit.init();
					var user_view = new UserView({model: user});
				},
				error: function(user, res){
					console.log("after fetch: " + JSON.stringify(res));
				}
			});
			
		}
	});

	//TODO: programmatically match CONFIG with Heroku enviro variables
	var CONFIG = {
		base_url : "https://econ-cit3.herokuapp.com/" 
	}
	var app = new AppRouter();
	Backbone.history.start();


})(jQuery);

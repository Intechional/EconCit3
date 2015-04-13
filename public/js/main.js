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
					error :function(){
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
			this.render(); 
		},
		render: function(){
			$(this.el).html(JSON.stringify(this.model));
			//test EconCit availability
			EconCit.init();
			console.log(JSON.stringify(EconCit.getCategoriesShallow()))
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
		base_url : "http://localhost:5000/" 
	}
	var app = new AppRouter();
	Backbone.history.start();


})(jQuery);

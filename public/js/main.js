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
		}
	});

	//TODO: programmatically match CONFIG with Heroku enviro variables
	var CONFIG = {
		base_url : "http://localhost:5000/" 
	}
	var app = new AppRouter();
	Backbone.history.start();


})(jQuery);

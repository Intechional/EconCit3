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
				"username" : $('#login-username'),
				"password" : $('#login-password')
			};
			$("#login-form").ajaxForm({
					url: url, 
					type: 'post', 
					success: function(data){
						console.log("login form says success?");
						console.log(JSON.stringify(data));
					},
					error :function(){
						console.log("login form says error?");
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
			"click button#login-button" : "goToLogin"
		},
		goToLogin : function(){
			app.navigate("",{trigger: true});
		}
	})


	var AppRouter = Backbone.Router.extend({
		routes: {
			"": "login",
			"register" : "register"
			//"home/:id" : "home"
		},
		login: function(){
			this.login_view = new LoginView();
		},
		register :function(){
			console.log("REGISTER")
			this.register_view = new RegisterView();
		}
	});

	//TODO: programmatically match CONFIG with Heroku enviro variables
	var CONFIG = {
		base_url : "http://localhost:5000/" 
	}
	var app = new AppRouter();
	Backbone.history.start();


})(jQuery);

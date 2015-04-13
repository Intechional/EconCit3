console.log("loading jst.js")
window.JST = {};

window.JST['login'] = _.template(
	'<div>\
        <h1>Sign into the Economic Citizenship App:</h1>\
        <div id="account-wall">\
            <form id="login-form" class="form-signin" action="/login" method="POST" role="form">\
            <input type="text" id="login-username" name="username" class="form-control" placeholder="Username">\
            <input type = "text"  id="login-password" name="password" class="form-control" placeholder="Password">\
            <button id="login-submit-button" class="btn btn-default" type="submit">Sign in</button>\
            </form>\
        </div>\
        <button id="register-button" class="btn btn-default" type="submit">Register for a new account.</button>\
        <div class="error-container"></div>\
    </div>'
);

window.JST['register'] = _.template(
	'<div>\
        <h1>Registration Details:</h1>\
        <div id="account-wall">\
            <form class="register-form" action="/register" method="POST" role="form">\
            <input id="register-username" type="text" name="username" class="form-control" placeholder="Username">\
            <input id="register-password" type = "text" name="password" class="form-control" placeholder="Password">\
            <input id="register-email" type = "text" name="email" class="form-control" placeholder="Email">\
            <input id="register-county" type = "text" name="county" class="form-control" placeholder="County">\
            <button id="register-submit-button" class="btn btn-default" type="submit">Register</button>\
            </form>\
        </div>\
        <button id="login-button" class="btn btn-default" type="submit">Back to Login</button>\
        <div class="error-container"></div>\
    </div>'
);

console.log("done loading jst.js")
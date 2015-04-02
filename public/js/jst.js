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
    </div>'
);

window.JST['register'] = _.template(
	'<div>\
        <h1>Registration Details:</h1>\
        <div id="account-wall">\
            <form class="form-signin" action="/signup" method="POST" role="form">\
            <input type="text" name="username" class="form-control" placeholder="Username">\
            <input type = "text" name="password" class="form-control" placeholder="Password">\
            <input type = "text" name="email" class="form-control" placeholder="Email">\
            <input type = "text" name="county" class="form-control" placeholder="County">\
            <button class="btn btn-default" type="submit">Register</button>\
            </form>\
        </div>\
        <button id="login-button" class="btn btn-default" type="submit">Back to Login</button>\
    </div>'
);

console.log("done loading jst.js")
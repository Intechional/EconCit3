##Overview:
This is a prototype for TIGRA’s ‘Economic Citizenship App’ to demonstrate how a user can enter information and get an economic citizenship score. The main logic is a module called ‘econ-cit.js’’ that holds the scoring logic. Scoring logic divided into categories of information like banking, credit score, community engagement, savings, groceries spending, and entertainment spending. The front-end uses the econ-cit.js module to display appropriate form inputs to the user and, based on that input, calculate scores. The back-end uses the econ-cit.js module to save the user’s data in a format consistent with the front-end. 
 
##Stack: 
* MongoDB as database
*  node.js server using Express and Mongoose, hosted on Heroku
*  Backbone front-end
*  a little Bootstrap markup in the html.

##File Structure:
*  server.js: *runs node.js server that serves /public files as static content, and sets up what’s in the routes directory*
* Procfile: *used by Heroku to start app*
* package.json: *used by Heroku to handle dependencies*
* public
  *index.html: *sets up container for Backbone and loads scripts*
  *js
     *econ-cit.js: *see below*
     *jst.js: *see below*
     *main.js: *see below*
  * /styles	
     1.main.css : *not much here now*	
  * /routes		
      1. index.js: *implements a json API that lets Backbone talk to the MongoDB.*
  5. /passport
      1. init.js: *implements passport.js strategies for user login and registration.* 
  6. /views: *TODO delete this directory*
  7. /models
      1.models.js: **implements back-end user model for mongoose*
  8./node_modules: **automatically created directory by and for node dependencies*


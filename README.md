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
*  index.html: *sets up container for Backbone and loads scripts*
*  /js
  *    econ-cit.js: *see below*
  *    jst.js: *Holds underscore templates used by main.js*
  *    main.js: *Implements all front-end functionality. Uses a User model and Category model to handle display and interactions.*
*    /styles	
  *    main.css : *not much here now*	
*    /routes	
  *      index.js: *implements a json API that lets Backbone talk to the MongoDB.*
*/passport
   * init.js: *implements passport.js strategies for user login and registration.* 
* /views: *TODO delete this directory*
* /models
  *  models.js: *implements back-end user model for mongoose*
* /node_modules: *automatically created directory by node to handle dependencies*

###econ-cit.js
* Purpose:encode the economic citizenship scoring logic in one place, and in a way that is easily configurable & adjustable. 
* available to the front-end and back-end. 
* exports functions necessary for accessing category information and scoring.
* A Category object has:
  * name
  * displayName
  *inputs. This is an object that currently maps a name of an input to a value. These are values used by the 
  * calculationFunction:  takes the inputs object as an argument and outputs a subScore between 1 and 5. 

##TODOs:
* improve back-end data validation
* Improve scoring display
* Improve README.md
* Incorporate require.js to allow better file structuring, like breaking up main.js into multiple files.
* Allow multiple Economic Citizenship entries per user. Requires redesign of user home page to allow user option of viewing and editing existing entries, or creating a new one. 
* complete community engagement scoring function
* improve sign-in information so remembering password isn't a problem

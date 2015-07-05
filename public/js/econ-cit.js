/* 
*Purpose: this module encodes Economic Citizenship Score logic, developed by and intellectual property of, TIGRA 
* (Transnational Institute for Grassroots Research and Action). 
* 
* It exports 'Categories' which, as a group of objects represent
* categories of data that is input for an Economic
* Citizenship score. It also exports scoring functionality that converts
* the input data into an Economic Citizenship Score. 
*
*
*Usage: 
* To make available:
* On server: var EconCit = require('path/to/econ-cit.js');
* In browser: <script src="js/econ-cit.js"></script>
*
* To initialize:
* EconCit.init();
*
* See exports in this file for objects and functions exported by this module. 
*/

(function(exports){
	var _categories = {};
	var _total_raw_score = 30; //fill programmatically

		/*Validation code. 
	TODO: move to separate module. 
	TODO: reduce redundancy in those that are 1-5 scores. 

	/*Validation rules must match the category declaraion in the name of 
	the category and the name of each input. 
	*/
	var validationRules = {
		'bank.bank_score':{
			'pattern' : 'number',
			'range' : [1,5],
			'msg' : "Please enter bank score between 1 and 5."
		},
		'credit.credit_score':{
			'pattern' : 'number',
			'range' : [0,850],
			'msg' : "Please enter a credit score that is 0 or between 300 and 850."
		},
		'community.hours_volunteered':{
			'pattern' : 'number',
			'range' : [0,100000],
			'msg' : 'Please enter a number of volunteer hours.'
		},
		'community.donations_in_dollars':{
			'pattern': 'number',
			'range' : [0,100000],
			'msg' :'Please enter a number for donations.'
		},
		'community.gross_income':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your gross income.'
		},
		'community.county':{
			'pattern' :'county'
		},
		'savings.net_income':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your net income.'
		},
		'savings.total_expenses':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total expenses.'
		},
		'groceries.groceries_type_1_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 1 businesses.'
		},
		'groceries.groceries_type_2_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 2 businesses.'
		},
		'groceries.groceries_type_3_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 3 businesses.'
		},
		'groceries.groceries_type_4_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 4 businesses.'
		},
		'groceries.groceries_type_5_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 5 businesses.'
		},
		'eating_out.eating_out_type_1_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 1 businesses.'
		},
		'eating_out.eating_out_type_2_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 2 businesses.'
		},
		'eating_out.eating_out_type_3_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 3 businesses.'
		},
		'eating_out.eating_out_type_4_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 4 businesses.'
		},
		'eating_out.eating_out_type_5_total':{
			'pattern':'number',
			'range' : [0,100000],
			'msg': 'Please enter a number for your total spending at Type 5 businesses.'
		}

	};

	/*_validate is an internal function called by EconCit.validate() that, given the rules
	for an input and the user's input value returns true/false whether it is valid, and a 
	message about what needs to be fixed. 
	*/
	var _validate = function(rules, input_value){
		if(rules["pattern"] == "number"){
			var status = true;
			var msg = "";
			var val = parseInt(input_value);
			//console.log("val in _validate: " + val)
			if(isNaN(val)){
				status = false;
				msg = "Please enter  "
			}else{
				if("range" in rules){
					if(val < rules["range"][0] || val > rules["range"][1]){
						status = false;
					}
				}
			}
			if(status == false){
				return {"status" : status, "msg" : rules["msg"]}
			}else{
				return {"status" : true}
			}
		}//end number pattern
		if(rules["pattern"] == "county"){
			var validCounties = ["Alameda", "Contra Costa", "San Francisco", "San Mateo", "Santa Clara", "Other"];
			var status = true;
			var msg = "";
			if(validCounties.indexOf(input_value) < 0){
				status = false;
				msg = "Please enter one of the following counties: " + validCounties.toString();
			}
			if(status == false){
				return {"status" : status, "msg" : msg}
			}else{
				return {"status" : true}
			}
		}//end county pattern
	};

	/**
	This function, called by the exported function scoreEntry(),
	has 5 hardcoded into it, as the maximum subscore per category. 
	It takes a subscore (value 1 to 5) and the weight (from a category) and
	scales the subscore to match the weight. It assumes the sum of weights
	across all categories is 1. 
	*/
	var _scaleSubscore = function(subscore, weight){
		var multiplier = weight * _total_raw_score;
		var scaled_score = multiplier * subscore/5;
		return scaled_score
	}

	var _getCountyGivingAverage = function(county){
		//based on 'Giving Ratio' (percent AGI) from https://philanthropy.com/interactives/how-america-gives#search on June 2, 2015
		var map = {	
				"Alameda" : 2.1
			, "Contra Costa" : 2.14
			, "San Francisco" : 3.36
			, "San Mateo" : 2.86
			, "Santa Clara" : 2.97 
			, "Other" : 2.79 //California State giving ratio

		}
		if(county in map){
			return map[county] * .01; //make into percentage
		}else{
			console.log("ERROR: invalid county - " + county + " - in _getCountyGivingAverage function");
			return map["Other"] * .01; 
		}			
	}



	/*This constructor for a Category encodes all the necessary
	attributes of a category for both front-end and back-end usage. 
	Clients of the econ-cit.js module can assume every Category
	has all properties in the constructure, and all Category instances
	should have all these properties.  
	*/
	var Category = function(params){
			this.displayName = params["displayName"];
			this.inputs = params["inputs"];
			this.calculationFunction = params["calculationFunction"];
			this.weight = params["weight"];//these should sum to 1 over all categories
			this.instructions = params["instructions"]
			_categories[params["name"]] = this;
	};

	/**
	*This function hard-codes the mapping between the total out of 30 (assuming 5 points
	maximum in each of 6 categories) to something in line with a credit score. These mapping rules
	were developed by TIGRA staff. 
	*/
	var _mapEconCitScoreToCreditScoreScale = function(score){
        var EconCitRange = [0,6]
		var CSRange = [300, 550]
        if(score < 7){
            EconCitRange = [0,6]
            CSRange = [300, 549]
        }else if(score< 13){
            EconCitRange = [7,12]
            CSRange = [550, 619]     
        }else if(score < 19){
            EconCitRange = [13,18]
            CSRange = [620, 679]
        }else if(score < 25){
            EconCitRange = [19,24]
            CSRange = [680, 739]
        }else{
            EconCitRange = [25,30]
            CSRange = [740, 850]   
        }
		var multiplier = (CSRange[1] - CSRange[0])/(EconCitRange[1] - EconCitRange[0])
		//subtract the min in the econCitRange, then add that times the multiplier to the min of the CS range
		var value =  CSRange[0] + multiplier * (score - EconCitRange[0])
		return value;
	}

	/*Returns rounded-up weighted average of scores i={1:5}, where
	the weight is the percentage of the i'th value of the grand total of the values.
	*This is not generalized yet,and only useful for the groceries and eating out
	categories. TODO: generalize this. 
	*/
	var _getWeightedAvg = function(inputs){
		console.log("inputs: " + JSON.stringify(inputs));
		var weighted_avg = 0;
		var original_totals = [];
		var keys = Object.keys(inputs);
		var grand_total = 0.0
		for(var i = 0; i < keys.length; i++ ){
			var total = parseInt(inputs[keys[i]]) + 0.0;
			original_totals.push(total);
			grand_total += total;
		}
		console.log("grand_total: " + grand_total);
		console.log("original_totals: " + JSON.stringify(original_totals));
		for(var i = 0; i < original_totals.length; i++){
			if(grand_total > 0){
				weighted_avg += (i+1) * original_totals[i]/grand_total
			}
		}
		return Math.ceil(weighted_avg);

	}
	/*Usage: econ-cit.init()
	 *return: fills the _categories object with all categories defined here.
	 *This funciton must be called by clients of the econ-cit.js module before any 
	 *other client calls will function properly.  
	*/
	exports.init = function(){
		var CreditCategory = new Category({
			name: "credit",
			displayName:"Credit Score",	
			inputs: {"credit_score":"default"},
			instructions: "Enter your credit score if you know it, or work with your coach to learn what it is. TIGRA and TIGRA's partners can help you get your credit score.",
			weight: .1,
			calculationFunction : function(inputs){
				var subscore = 0;
				var credit_score = parseInt(inputs["credit_score"]);
				if(credit_score < 550){
					subscore = 1;
				}else if(credit_score < 620){
					subscore = 2;
				}else if(credit_score < 680){
					subscore = 3;
				}else if(credit_score < 740){
					subscore =4;
				}else{
					subscore = 5;
				}
				return subscore;
			}
		});


		/*
		*The first iteration has a user & coach enter a category 1-5, which is the same as the subscore for this category
		*/
		var BankCategory = new Category({
			name: "bank",
			displayName: "Banking Practice",
			inputs: {"bank_score": "default"},
			weight: .2,
			instructions: "Work with your coach to determine your score between 1 and 5 for the banking category.",
			calculationFunction : function(inputs){
				return(parseInt(inputs["bank_score"])) //not 100 percent sure this is the function param and not the same as this.inputs
			}
		});


		var CommunityEngagementCategory = new Category({
			name: "community",
			displayName: "Community Engagement",
			inputs: {
				"hours_volunteered": 0,
				"donations_in_dollars" : 0,
				"gross_income": 0,
				"county": "unknown"
			},
			weight: .1,
			instructions: "Tell us how many hours you have volunteered (you may volunteer at a church, school, organization, or help out neighbors) and any money you donate. Work with your coach to figure out your gross income.",
			calculationFunction:function(inputs){
				var subscore = 0;
				var county_average=_getCountyGivingAverage(inputs["county"]); //hardcoded
				var donations = parseInt(inputs["donations_in_dollars"]);
				var hours = parseInt(inputs["hours_volunteered"]);
				var income = parseInt(inputs["gross_income"]) + 0.0;
				if(income > 0){
					var raw_score = (donations + 22.5 * hours)/income
					console.log("community raw score:" + raw_score)
					console.log("county avg: " + county_average)
					var adjusted_score = raw_score/county_average;
					console.log("community adjusted_score score:" + adjusted_score)
					if(adjusted_score == 0){
						subscore = 1;
					}else if(adjusted_score < .9){
						subscore = 2;
					}else if(adjusted_score < 1.1){
						subscore = 3;
					}else if(adjusted_score < 2){
						subscore = 4;
					}else{
						subscore = 5;
					}
				}
				return subscore;
			}
		})

		var SavingsCategory = new Category({
			name: "savings",
			displayName: "Savings",
			inputs:{"net_income": 0, "total_expenses" : 0},
			weight: .1,
			instructions: "Work with your coach to figure out your net income (after taxes) and your total expenses.",
			calculationFunction: function(inputs){
				var savings_subscore = 0;
				var income = parseInt(inputs["net_income"]) + 0.0; //hack to make float
				var expenses = parseInt(inputs["total_expenses"]) + 0.0
				if (expenses > 0){ //don't divide by 0
					var ratio = income/expenses;
					if(ratio < .95){
						savings_subscore = 1;
					}else if (ratio < 1){
						savings_subscore = 2;
					}else if(ratio < 1.05){
						savings_subscore = 3;
					}else if(ratio < 1.1){
						savings_subscore = 4;
					}else{
						savings_subscore = 5;
					}
				}
				return savings_subscore;
			}
		});

		var GroceriesCategory = new Category({
			name: "groceries",
			displayName: "Groceries/Household",
			inputs:{
				"groceries_type_1_total" : 0,
				"groceries_type_2_total" : 0,
				"groceries_type_3_total" : 0,
				"groceries_type_4_total" : 0,
				"groceries_type_5_total" : 0
			},
			instructions: "Work with your coach to decide what type of businesses you have bought your groceries at. Enter the total dollars you have spent at each type of grocery store.",
			weight: .25, 
			calculationFunction : function(inputs){
				return _getWeightedAvg(inputs);
			}

		});

		var EatingOutCategory = new Category({
			name: "eating_out",
			displayName: "Eating Out",
			inputs: {
				"eating_out_type_1_total" : 0,
				"eating_out_type_2_total" : 0,
				"eating_out_type_3_total" : 0,
				"eating_out_type_4_total" : 0,
				"eating_out_type_5_total" : 0
			},
			instructions: "Work with your coach to decide what type of businesses you have eaten out at or used for entertainment. Enter the total dollars you have spent at each type of business",
			weight: .25, 
			calculationFunction: function(inputs){
				return _getWeightedAvg(inputs);
			}
		});		
	};
 
	/*If EconCit.init() has been called, EconCit.getCategorieseep
	*returns an array whose elements are names of categories. 
	*/
	exports.getCategoriesShallow = function(){
		return Object.keys(_categories);
	}


	exports.getCategoriesDeep = function(){
		return _categories;
	}

	exports.getCategoryDeep = function(cat_name){
		return _categories[cat_name];
	}

	exports.getDisplayInfo = function(cat_name){
		//TODO: implement
	}

	/*usage: econ_cit.getSubScore(credit, {credit_score : 803})
	*returns a numberic subscore between 1 and 5
	*/
	exports.getSubScore = function(cat_name, cat_input_data){
		var subscoreFun = _categories[cat_name]["calculationFunction"];
		return subscoreFun(cat_input_data)
	}

	/*usage: econ_cit.scoreEntry(entry_data)
	*example of entry_data:
	{
		"groceries": {"groceries_type_5_total":"40",
			"groceries_type_4_total":"0",
			"groceries_type_3_total":"80",
			"groceries_type_2_total":"0",
			"groceries_type_1_total":"0"},
		"community":{"hours_volunteered":"6",
			"donations_in_dollars":"20",
			"gross_income":"1800",
			"county":"Alameda"},
		"credit":{"credit_score":"600"},
		"bank":{"bank_score":"3"},
		"savings":{"net_income":"1600",
			"total_expenses":"1400"},
		"eating_out"{"eating_out_type_1_total":"10",
			"eating_out_type_2_total":"0",
			"eating_out_type_3_total":"20",
			"eating_out_type_4_total":"0",
			"eating_out_type_5_total":"0"}
	}
	*return: a final score
	*/


	exports.scoreEntry = function(entry_data){
		console.log(JSON.stringify(entry_data));
		var categories = _categories;
		var cats_in_entry = Object.keys(entry_data); //if a user hasn't entered data for an category, that cat will not be present
		var raw_score = 0;
		var score_info = {}; //maps cat_name to subscore
		cats_in_entry.forEach(function(element, index, list){
			var cat_name = element;
			var cat = categories[cat_name]; //gets the full category object so that we can look up any information about it
			var subscoreFun = cat["calculationFunction"];
			var subscore = subscoreFun(entry_data[cat_name]) //sends user's data for that category to the category's scoring function
			console.log(cat_name + " subscore: " + subscore);
			var scaled_subscore = _scaleSubscore(subscore, cat["weight"]);
			console.log("scaled subscore: " + scaled_subscore)
			raw_score += scaled_subscore;
			score_info[cat_name] = scaled_subscore;
		});
		score_info["raw_score"] = raw_score; 
		var final_score = _mapEconCitScoreToCreditScoreScale(raw_score);
		score_info["final_score"] = final_score;
		return final_score;
	}



	/*usage: EconCit.validate(category, cat_info) where cat_info is a map of the 
	category's inputs to the user's input value for that input.
	**return: object with key 'status' that is true or false,  key 'msg' with message
	*/

	exports.validate = function(category_name, cat_info){
		var status = false;
		var errorMessages = []; //fill
		var cat_name = category_name; //category["name"];
		var input_keys = Object.keys(cat_info) //should match categories["inputs"]
		input_keys.forEach(function(input_key){
			var key = cat_name + "." + input_key
			var result = _validate(validationRules[key], cat_info[input_key])
			if (result["status"] === false){
				//console.log("bad input: " + result["msg"]);
				errorMessages.push(result["msg"]);
			}
		});

		if (errorMessages.length == 0){
			status = true;
		}
		return {"status": status, "messages" : errorMessages}
	}
	


})(typeof exports === 'undefined' ? this['EconCit']={} : exports);//end closure
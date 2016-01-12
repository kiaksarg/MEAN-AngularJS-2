//Modules
var url = require("url");
var request = require("request");

//Includes
var Config = require("../../../../config.js");

//Request prototype
var startRequest = function(params, checks){
	request({
		url: url.resolve("http://" + Config.http.url + ":" + Config.http.port.external, "/api/v1/users"),
		method: "GET",
		json: true,
		form: params
	}, function (err, res, body) {
		
		//Check there was no error in the request
		expect(res.statusCode).toBe(200);
		expect(err).toBe(null);
		
		//Perform coresponding test checks
		checks(body);
	});
};

//Perform tests
describe("View Users", function(){
	
	// !Positive Tests
	
	describe("Positive Tests", function(){
		
		it("should return list of users for 1 limit", function(done){
			startRequest({
				limit: 1
			}, function(body){
				
				//Check that users were returned with correct limit
				expect(body.users[0].username).toBe("FirstUser");
				expect(body.users[0].email).toBe("FirstUser@FirstUser.com");
				
				done();
			});
			
		});
		
		it("should return list of users for 3 limit", function(done){
			startRequest({
				limit: 3
			}, function(body){
				
				//Check that users were returned with correct limit
				expect(body.users[0].username).toBe("FirstUser");
				expect(body.users[0].email).toBe("FirstUser@FirstUser.com");
				expect(body.users[1].username).toBe("SecondUser");
				expect(body.users[1].email).toBe("SecondUser@SecondUser.com");
				expect(body.users[2].username).toBe("ThirdUser");
				expect(body.users[2].email).toBe("ThirdUser@ThirdUser.com");
				
				done();
			});
			
		});
		
	});
	
	// !Negative Tests
	
	describe("Negative Tests", function(){
		
		it("should return error if no limit given", function(done){
			startRequest({}, function(body){
				
				//Check that users were returned with correct limit
				expect(body.error).toBe("Limit must be an integer");
				
				done();
			});
			
		});
		
	});
	
});
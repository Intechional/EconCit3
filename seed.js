db.dropDatabase();
var seedUser ={
  name: "Tester1" 
  password:"secret",
  email:'1@1.com',
};
db.users.save(seedUser);
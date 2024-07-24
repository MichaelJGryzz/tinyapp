const { assert } = require('chai'); // Import Chai's assert interface for writing assertions
const { findUserByEmail } = require('../helpers.js'); // Import the function to be tested from helpers.js

// Sample test data mimicking the userDatabase
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Describe block to group tests related to the findUserByEmail function
describe('findUserByEmail', function() {
  // Test Case - checks if the function returns the correct user
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    
    // Assert that the returned user object matches the expected user id when its provided with an email that exists in the database
    assert.isObject(user, 'User should be an object');
    assert.equal(user.id, expectedUserID, 'User ID should be userRandomID');
  });
});
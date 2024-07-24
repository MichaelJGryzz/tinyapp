const { assert } = require('chai'); // Import Chai's assert interface for writing assertions
const { findUserByEmail, urlsForUser } = require('../helpers.js'); // Import the functions to be tested from helpers.js

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
  // Test Case # 1 - checks if the function returns the correct user
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    
    // Assert that the returned user object matches the expected user id when its provided with an email that exists in the database
    assert.isObject(user, 'User should be an object');
    assert.equal(user.id, expectedUserID, 'User ID should be userRandomID');
  });

  // Test Case # 2 - checks if undefined is returned when we pass in an email that is not in our users database
  it('should return undefined for an email not in the database', function() {
    const user = findUserByEmail("nonexistent@example.com", testUsers);
    
    // Assert that the returned user is undefined
    assert.isUndefined(user);
  });
});

// Describe block to group tests related to the urlsForUser function
describe('urlsForUser', function() {
  // Test Case # 3 - checks if only urls that belong to the specified user are returned
  it('should return only URLs that belong to the specified user', function() {
    // Sample urlDatabase with URLs and associated user IDs
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9sm0Zs': { longURL: 'http://www.google.com', userID: 'user2' },
      'h7g8Nf': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    // Expected result: only URLs that belong to user 'user1'
    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      'h7g8Nf': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    // Call the urlsForUser function with the test user ID and urlDatabase
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput, 'The result should include only URLs belonging to the specified user');
  });

  // Test Case # 4 - checks if an empty object is returned if the user has no URLS
  it('should return an empty object if the user has no URLs', function() {
    // Sample urlDatabase with URLs belonging to a different user
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9sm0Zs': { longURL: 'http://www.google.com', userID: 'user2' },
      'h7g8Nf': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    // Expected result: empty object, as the user has no URLs
    const expectedOutput = {};

    // Call the urlsForUser function with the user ID and urlDatabase
    const result = urlsForUser('user3', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput, 'The result should be an empty object if the user has no URLs');
  });

  // Test Case # 5 - checks if an empty object is returned if there are no URLs in the urlDatabase
  it('should return an empty object if there are no URLs in the urlDatabase', function() {
    // Empty urlDatabase
    const urlDatabase = {};

    // Expected result: empty object, as the urlDatabase has no URLs
    const expectedOutput = {};

    // Call the urlsForUser function with the user ID and empty urlDatabase
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput, 'The result should be an empty object if there are no URLs in the urlDatabase');
  });

  // Test Case # 6 - checks if URLs that do not belong to the specified user are NOT returned
  it('should not return URLs that do not belong to the specified user', function() {
    // Sample urlDatabase with URLs and associated user IDs
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9sm0Zs': { longURL: 'http://www.google.com', userID: 'user2' },
      'h7g8Nf': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    // Expected result: only URLs that belong to user 'user1'
    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      'h7g8Nf': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    // Call the urlsForUser function with the test user ID and urlDatabase
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    // This indirectly checks that URLs not belonging to the user are excluded
    assert.deepEqual(result, expectedOutput, 'The result should not include URLs that do not belong to the specified user');
  });
});
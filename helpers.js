// Helper function to find user by email
const findUserByEmail = function(email, userDatabase) {
  for (const user of Object.values(userDatabase)) {
    if (user.email === email) { // Check if the current user's email matches the provided email
      return user; // Return the user object if the email matches
    }
  }
  return undefined; // Return undefined if no matching user is found
};

// Function that returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function(userid, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userid) {
      userUrls[shortURL] = urlDatabase[shortURL]; // If userID matches the id, add the URL entry to the userUrls object
    }
  }
  return userUrls; // Return the filtered userUrls object containing only URLs for the given user ID
};

// Export helper function to make it available throughout the project
module.exports = { findUserByEmail, urlsForUser };
// Helper function to find user by email
const findUserByEmail = function(email, userDatabase) {
  for (const user of Object.values(userDatabase)) {
    if (user.email === email) { // Check if the current user's email matches the provided email
      return user; // Return the user object if the email matches
    }
  }
  return undefined; // Return undefined if no matching user is found
};

// Export helper function to make it available throughout the project
module.exports = { findUserByEmail };
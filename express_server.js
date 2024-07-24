const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8081; // default port 8081

// Function to generate a random string of 6 alphanumeric characters
const generateRandomString = function() {
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return uniqueId;
};

// Require findUserByEmail helper function to find user by email
const { findUserByEmail } = require("./helpers");

// Function that returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL]; // If userID matches the id, add the URL entry to the userUrls object
    }
  }
  return userUrls; // Return the filtered userUrls object containing only URLs for the given user ID
};

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

app.set("view engine", "ejs");

// Express's built in middleware function that converts the body from a Buffer to a string that we can read
app.use(express.urlencoded({ extended: true }));

// Middleware function that helps use read the values from the cookies and manage them using session
app.use(cookieSession({
  name: "session",
  keys: ["MJG002204", "WhiskersSpikeRockyBB"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Route handler to render the "urls_new.ejs" template in the browser and present the form to the user
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user from the session
  // If the user is not logged in, redirect to the /login page
  if (!userId) {
    res.redirect("/login");
  }
  const user = userDatabase[userId]; // Retrieve the user object from the userDatabase using the user_id
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

// Route handler to generate a unique id, save it and the long url to the urlDatabase and redirect to "/urls/:id"
app.post("/urls", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user from the session
  // If the user is not logged in, respond with an HTML message
  if (!userId) {
    return res.status(401).send("<html><body>You must be logged-in to shorten URLs!</body></html>");
  }
  const shortURL = generateRandomString(); // Generate a 6 digit alphanumeric short URL ID
  const longURL = req.body.longURL; // Extract the long URL from the request body
  // Store the long URL and the userID in the urlDatabase
  urlDatabase[shortURL] = {
    longURL,
    userID: userId
  };
  res.redirect(`/urls/${shortURL}`); // Redirect to "urls/:id"
});

// Route handler to delete a specific URL resource based on its ID and redirect to "/urls"
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user_id from the session
  // Check if user is logged-in
  if (!userId || !userDatabase[userId])
    return res.status(401).send("You must be logged-in to delete URLs!"); // Send a 401 status code if the user is not logged-in

  const urlData = urlDatabase[req.params.id]; // Get the URL data from the urlDatabase using the short URL ID
  // Check if URL exists
  if (!urlData) {
    return res.status(404).send("Short URL ID not found!"); // Send a 404 status code if the short URL ID does not exist
  }
  // Check if user owns the URL
  if (urlData.userID !== userId) {
    return res.status(403).send("You do not have permission to access this URL!"); // Send a 403 status code if the user does not own the URL
  }
  delete urlDatabase[req.params.id]; // Delete the URL from the urlDatabase
  res.redirect("/urls"); // Redirect to "/urls"
});

// Route handler to update a specific URL based on its ID and redirect to "/urls"
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user_id from the session
  // Check if user is logged-in
  if (!userId || !userDatabase[userId]) {
    return res.status(401).send("You must be logged-in to edit URLs!"); // Send a 401 status code if the user is not logged-in
  }

  const urlData = urlDatabase[req.params.id]; // Get the URL data from the urlDatabase using the short URL ID
  // Check if URL exists
  if (!urlData) {
    return res.status(404).send("Short URL ID not found!"); // Send a 404 status code if the short URL ID does not exist
  }
  // Check if user owns the URL
  if (urlData.userID !== userId) {
    return res.status(403).send("You do not have permission to access this URL!"); // Send a 403 status code if the user does not own the URL
  }
  const newLongURL = req.body.longURL; // Extract the new long URL from the request body
  urlDatabase[req.params.id].longURL = newLongURL; // Update the long URL in the urlDatabase
  res.redirect("/urls"); // Redirect to "/urls"
});


// Route handler to render details of a specific URL based on its ID
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user_id from the session
  const urlData = urlDatabase[req.params.id]; // Get the URL data from the urlDatabase using the short URL ID
  if (!urlData) {
    return res.status(404).send("Short URL ID not found!"); // Send a 404 status code if the short URL ID does not exist
  }
  if (urlData.userID !== userId) {
    return res.status(403).send("You do not have permission to access this URL!"); // Send a 403 status code if the user does not own the URL
  }
  // Retrieve the user object from the userDatabase using the user_id
  const user = userDatabase[userId];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlData.longURL
  };
  res.render("urls_show", templateVars); // Render the "urls_show.ejs" template with the URL details
});

// Route handler to redirect short URL requests to the corresponding long URL
app.get("/u/:id", (req, res) => {
  const urlData = urlDatabase[req.params.id]; // Get the URL data from the urlDatabase using the short URL ID
  if (urlData) {
    res.redirect(urlData.longURL); // Reirect to the long URL
  } else {
    res.status(404).send("<html><body>Short URL ID not found!</body></html>"); // Send a 404 status code if the short URL ID does not exist
  }
});

// Login route handler
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Extract the email and password from the request body
  const user = findUserByEmail(email, userDatabase); // Find the user by email using the findUserByEmail helper function

  // If no user email can be found, return a response with a 403 status code
  if (!user) {
    return res.status(403).send("Email cannot be found!");
  }

  // If a user email is found, but the password does not match, return a response with a 403 status code
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password!");
  }

  // Check here if user.id exists before setting the session
  if (!userDatabase[user.id]) {
    return res.status(403).send("User ID does not exist in the database!");
  }

  // Set the user_id session with the user's id and redirect to "/urls" page
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Logout route handler
app.post("/logout", (req, res) => {
  req.session = null; // Clear session
  res.redirect("/login"); //Redirect to "/login" page
});

// Route handler to render the "register.ejs" template and present the form to the user
app.get("/register", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user from the session
  // If the user is logged in, redirect to /urls
  if (userId) {
    return res.redirect("/urls");
  }
  const user = userDatabase[userId]; // Retrieve the user object from the userDatabase using the user_id
  const templateVars = {
    user
  };
  res.render("register", templateVars);
});

// Route handler to handle the registration form data
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userId = generateRandomString();
  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty!");
  }
  // Check if the email already exists using the "findUserByEmail" helper function
  if (findUserByEmail(email, userDatabase)) {
    return res.status(400).send("Email already registered!");
  }

  // Hash the password using bgrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Add the new user to the userDatabase object
  userDatabase[userId] = {
    id: userId,
    email,
    password: hashedPassword, // Store the hashed password
  };

  req.session.user_id = userId; // Set the users_id session
  res.redirect("/urls"); // Redirect to /urls
});

// Route handler to render the "login.ejs" template in the browser and present the form to the user
app.get("/login", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user from the session
  // If the user is logged in, redirect to /urls
  if (userId) {
    return res.redirect("/urls");
  }
  const user = userDatabase[userId]; // Retrieve the user object from the userDatabase using the user_id
  const templateVars = {
    user
  };
  res.render("login", templateVars);
});

// Route handler to render a JSON object listing all URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route handler to render a page listing all URLs
app.get("/urls", (req, res) => {
  const userId = req.session.user_id; // Retrieve the user_id from the session
  // If the user is not logged in, respond with a relevent HTML error message with a 401 status code
  if (!userId || !userDatabase[userId]) {
    return res.status(401).send("<html><body>You must be logged-in to view your URLs!<a href='/login'>Log in</a> or <a href='/register'>Register</a></body></html>");
  }
  // Retrieve the user object from the userDatabase using the user_id
  const user = userDatabase[userId];
  // Filter URLs to only include those created by the logged-in user
  const userUrls = urlsForUser(userId);
  const templateVars = {
    user,
    urls: userUrls
  };
  res.render("urls_index", templateVars); // Render the "urls_index.ejs" template with the filtered URLs
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8081; // default port 8081

// function to generate a random string of 6 alphanumeric characters
const generateRandomString = function() {
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return uniqueId;
};

// helper function to find user by email
const findUserByEmail = function(email) {
  for (const user of Object.values(users)) {
    if (user.email ===email) { // Check if the current user's email matches the provided email
      return user; // Return the user object if the email matches
    }
  }
  return null; // Return null if no matching user is found
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

// Express's built in middleware function that converts the body from a Buffer to a string that we can read
app.use(express.urlencoded({ extended: true }));

// Middleware function that helps use read the values from the cookies
app.use(cookieParser());

// route handler to render the "urls_new.ejs" template in the browser and present the form to the user
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"]; // Retrieve the user from the cookies sent by the client
  const user = users[userId]; // Retrieve the user object from the users database using the user_id
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

// route handler to generate a unique id, save it and the long url to the urlDatabase and redirect to "/urls/:id"
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Generate a 6 digit alphanumeric short URL ID
  const longURL = req.body.longURL; // Extract the long URL from the request body
  urlDatabase[shortURL] = longURL; // Save the long URL and the short URL to the urlDatabase
  res.redirect(`/urls/${shortURL}`); // Redirect to "urls/:id"
});

// route handler to delete a specific URL resource based on its ID and redirect to "/urls"
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// route handler to update a specific URL based on its ID and redirect to "/urls"
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});


// route handler to render details of a specific URL based on its ID
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"]; // Retrieve the user_id from the cookies sent by the client
  const user = users[userId]; // Retrieve the user object from the users database using the user_id
  const longURL = urlDatabase[req.params.id]; // Get the long URL from the urlDatabase using the short URL ID
  if (longURL) {
    const templateVars = { 
      user,
      id: req.params.id,
      longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Short URL ID not found"); // Send a 404 status code if the short URL ID does not exist
  }
});

// route handler to redirect short URL requests to the corresponding long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id] // Get the long URL from the urlDatabase using the short URL ID
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL ID not found"); // Send a 404 status code if the short URL ID does not exist
  }
});

// Login route handler
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Extract the email and password from the request body
  const user = findUserByEmail(email); // Find the user by email using the findUserByEmail helper function

  // If no user email can be found, return a response with a 403 status code
  if (!user) {
    return res.status(403).send("Email cannot be found!");
  }

  // If a user email is found, but the password does not match, return a response with a 403 status code
  if (user.password !== password) {
    return res.status(403).send("Incorrect password!");
  }

  // Set the user_id cookie with the user's id and redirect to "/urls" page
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Logout route handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear user_id cookie
  res.redirect("/urls");
});

// route handler to render the "register.ejs" template
app.get("/register", (req, res) => {
  res.render("register");
});

// route handler to handle the registration form data
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userId = generateRandomString();

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty!");
  }

  // Check if the email already exists using the "findUserByEmail" helper function
  if (findUserByEmail(email)) {
    return res.status(400).send("Email already registered!");
  }

  // Add the new user to the users object
  users[userId] = {
    id: userId,
    email,
    password,
  };

  console.log("New user registered:", users[userId]); // Log the newly registered user
  console.log("All users:", users); // Log the entire users object for verification

  res.cookie("user_id", userId); // Set the users_id cookie

  res.redirect("/urls"); // Redirect to /urls
});

// route handler to render the "login.ejs" template
app.get("/login", (req, res) => {
  res.render("login");
});

// route handler to render a JSON object listing all URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route handler to render a page listing all URLs
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]; // Retrieve the user_id from the cookies sent by the client
  const user = users[userId];// Retrieve the user object from the users database using the user_id
  const templateVars = {
    user,
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
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
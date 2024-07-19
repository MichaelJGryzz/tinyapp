const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8081; // default port 8081

// function to generate a random string of 6 alphanumeric characters
const generateRandomString = function() {
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return uniqueId;
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
  // Retrieve the username from the cookies sent by the client
  const templateVars = {
    username: req.cookies["username"]
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
  const username = req.cookies["username"];
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// route handler to update a specific URL based on its ID and redirect to "/urls"
app.post("/urls/:id", (req, res) => {
  const username = req.cookies["username"];
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});


// route handler to render details of a specific URL based on its ID
app.get("/urls/:id", (req, res) => {
  const username = req.cookies["username"]; // Retrieve the username from the cookies sent by the client
  const longURL = urlDatabase[req.params.id]; // Get the long URL from the urlDatabase using the short URL ID
  if (longURL) {
    const templateVars = { 
      username,
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
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Logout route handler
app.post("/logout", (req, res) => {
  res.clearCookie("username"); // Clear username cookie
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

  // Add the new user to the users object
  users[userId] = {
    id: userId,
    email,
    password,
  };

  console.log(users); // Log the users object to check if the new user is added

  res.cookie("user_id", userId); // Set the users_id cookie

  res.redirect("/urls"); // Redirect to /urls
});

// route handler to render a JSON object listing all URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route handler to render a page listing all URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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
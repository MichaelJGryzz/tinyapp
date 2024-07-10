const express = require("express");
const app = express();
const PORT = 8081; // default port 8081

// function to generate a random string of 6 alphanumeric characters
const generatRandomString = function() {
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return uniqueId;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");

// Express's built in middleware function that converts the body from a Buffer to a string that we can read
app.use(express.urlencoded({ extended: true }));

// route handler to render the "urls_new.ejs" templaye in the browser and present the form to the user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// route handler to generate a unique id, save it and the long url to the urlDatabase and redirect to "/urls/:id"
app.post("/urls", (req, res) => {
  const shortURL = generatRandomString(); // Generate a 6 digit alphanumeric short URL ID
  const longURL = req.body.longURL; // Extract the long URL from the request body
  urlDatabase[shortURL] = longURL; // Save the long URL and the short URL to the urlDatabase
  console.log(`${shortURL}: ${longURL}`); // Log the "id"-"longURL" key-value pair to the console
  res.redirect(`/urls/${shortURL}`); // Redirect to "urls/:id"
});

// route handler to render details of a specific URL based on its ID
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route handler to render a page listing all URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
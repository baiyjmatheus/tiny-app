const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(methodOverride('_method'));

const urlDB = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Login
app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDB);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDB
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDB[req.params.id]
  }
  res.render('urls_show', templateVars);
});

// Create new URL
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDB[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Redirects to longURL website
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (urlDB[shortURL]) {
    let longURL = urlDB[shortURL];
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("Page not found");
  }
});

// Delete URL
app.delete('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  delete urlDB[id];
  res.redirect('/urls');
});

// Edit URL
app.put('/urls/:id', (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  urlDB[id] = longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`);
});


function generateRandomString() {
  const alphaNumchars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * alphaNumchars.length);
    randomStr += alphaNumchars[randomNum];
  }
  return randomStr;
}

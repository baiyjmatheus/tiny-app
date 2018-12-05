const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');


app.set('view engine', 'ejs');
// middleware
app.use(bodyParser.urlencoded({extended: true}));

const urlDB = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDB);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

app.get('/urls', (req, res) => {
  res.render('urls_index', { urls: urlDB });
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let urls = { shortURL: req.params.id, longURL: urlDB[req.params.id] };
  res.render('urls_show', urls);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDB[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

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

app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  delete urlDB[id];
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

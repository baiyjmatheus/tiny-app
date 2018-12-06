const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const uuidv4 = require('uuidv4');

app.set('view engine', 'ejs');
// middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(methodOverride('_method'));

const urlDB = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "1": {
    id: "1", 
    email: "a@a.com", 
    password: "a"
  },
 "2": {
    id: "2", 
    email: "b@b.com", 
    password: "b"
  }
}

// Check if user exists
function isUser(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
}

// authenticate user
function authenticateUser(email, password) {
  const [userId] = Object.keys(users).filter(userId => {
    return users[userId].email === email &&
    users[userId].password === password;
  });
  return userId;
}


app.get('/', (req, res) => {
  res.redirect('/urls');
});

// render login page
app.get('/login', (req, res) => {
  res.render('login');
});

// handle login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userId = authenticateUser(email, password);
  // If user does not exist in db
  if (!userId) {
    res.status(403);
  }
  res.cookie('userId', userId);
  res.redirect('/');
});

// Logout (delete the cookie)
app.delete('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

// Render register form
app.get('/register', (req, res) => {
  res.render('register');
});

// handle register
app.post('/register', (req, res) => {
  // retrieve form data
  const {email, password} = req.body;
  // Check if user exists
  const userExists = isUser();

  // Checks if email or password are empty
  if (email === "" || password === "") {
    res.status(400);
  }

  // Checks existent email
  if (!userExists) {
    const id = uuidv4();
    users[id] = {id, email, password};
    console.log(users);
    res.cookie('userId', id);
    res.redirect('/urls');
  } else {
    res.status(400);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDB);
});

app.get('/urls', (req, res) => {
  const user = users[req.cookies["userId"]];
  const templateVars = {
    user,
    urls: urlDB,
    shortURL: `${req.protocol}://${req.get('host')}`
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies["userId"]];
  var templateVars = {
    user
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies["userId"]];
  const templateVars = {
    user,
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
  console.log(urlDB);
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

const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');

const urlDB = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userId: "9950f2b3-160b-4bb3-b61c-ee5819b875b9",
    counter: 0
  }
};

const users = {
  "9950f2b3-160b-4bb3-b61c-ee5819b875b9": {
    id: "9950f2b3-160b-4bb3-b61c-ee5819b875b9", 
    email: "c@c.com", 
    password: "$2b$10$UfMeytH6x81FvJeHrgW4LuzdhXgqDfXcypWd56qp5Xty8a91xLyQ2"
  }
};

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
    bcrypt.compareSync(password, users[userId].password);
  });
  return userId;
}

// Generates a 6-character random alphanumberic string
function generateRandomString() {
  const alphaNumchars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * alphaNumchars.length);
    randomStr += alphaNumchars[randomNum];
  }
  return randomStr;
}

app.set('view engine', 'ejs');
// middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouselabs']
}));
app.use(methodOverride('_method'));

// redirects to according to login status
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
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
  req.session.userId = userId;
  res.redirect('/urls');
});

// Logout (delete the cookie)
app.delete('/logout', (req, res) => {
  req.session = null;
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
  const userExists = isUser(email);

  // Checks if email or password are empty
  if (email === "" || password === "") {
    res.status(400);
  }

  // Checks existent email
  if (!userExists) {
    const id = uuidv4();
    users[id] = {id, email, password: bcrypt.hashSync(password, 10)};
    req.session.userId = id;
    res.redirect('/urls');
  } else {
    res.status(400).send("User already exists");
  }
});

// Render all URLs of the current user
app.get('/urls', (req, res) => {
  const user = users[req.session.userId];
  if (user) {
    const shortUrls = Object.keys(urlDB).filter(urlId => {
      return urlDB[urlId].userId === user.id;
    });

    const longUrls = [];
    const counters = [];

    shortUrls.forEach((urlId) => {
      longUrls.push(urlDB[urlId].url);
      counters.push(urlDB[urlId].counter);
    });

    const templateVars = {
      user,
      shortUrls,
      longUrls,
      counters,
      host: `${req.protocol}://${req.get('host')}`,
    }
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/');
  }
  
});

// Render new URL form
app.get('/urls/new', (req, res) => {
  const user = users[req.session.userId];
  if (user) {
    const templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
  
});

// Show url edit form by id
app.get('/urls/:id', (req, res) => {
  const user = users[req.session.userId];
  if (user) {
    const { id } = req.params;
    if (urlDB[id].userId === user.id) {
      const templateVars = {
        user,
        shortURL: req.params.id,
        longURL: urlDB[req.params.id].url
      }
    res.render('urls_show', templateVars);
    }
  } else {
    res.redirect("/login");
  }
  
});

// Create new URL
app.post('/urls', (req, res) => {
  const user = users[req.session.userId];
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDB[shortURL] = { url: longURL, userId: user.id, counter: 0 };
  res.redirect(`/urls/${shortURL}`);
});

// Redirects to longURL website
app.get('/u/:shortURL', (req, res) => {
  let { shortURL } = req.params;
  if (urlDB[shortURL]) {
    let longURL = urlDB[shortURL].url;
    urlDB[shortURL].counter += 1;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("Page not found");
  }
});

// Delete URL
app.delete('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  const user = users[req.session.userId];
  if (urlDB[id].userId === user.id) {
    delete urlDB[id];
  }
  res.redirect('/urls');
});

// Edit URL
app.put('/urls/:id', (req, res) => {
  const { id } = req.params;
  const user = users[req.session.userId];
  if (urlDB[id].userId === user.id) {
    const { longURL } = req.body;
    urlDB[id].url = longURL;
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`);
});

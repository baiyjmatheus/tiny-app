// Check if user exists
module.exports.isUser = function(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
}

// authenticate user
module.exports.authenticateUser = function(email, password) {
  const [userId] = Object.keys(users).filter(userId => {
    return users[userId].email === email &&
    bcrypt.compareSync(password, users[userId].password);
  });
  return userId;
}

// Generates a 6-character random alphanumberic string
module.exports.generateRandomString = function() {
  const alphaNumchars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * alphaNumchars.length);
    randomStr += alphaNumchars[randomNum];
  }
  return randomStr;
}
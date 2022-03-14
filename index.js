
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const session = require('express-session');
const bcrypt = require('bcrypt');
const user = require('./models/user');

const app = express();

const port = 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true}))
app.use(session({ secret: 'notgoodsecret'}))

/**
 * > show dbs
 * > use authDemo
 * > show collections
 * > db.users.find()
 */
mongoose.connect('mongodb://localhost:27017/authDemo')
  .then(() => {
    console.log(`[LOG] - mongodb connection is now established!!`)
  })
  .catch((err) => {
    console.log(`[LOG] - mongodb connection error detected!!`)
    console.error(`[ERROR] - ${err}`);
  })

const requireLogin = (req, res, next) => {
  if(!req.session.user_id){
    return res.redirect('/login');
  }
  next();
}

// * NOTE: requireLogin to protect authenticated routes
app.get('/secret', requireLogin, (req, res) => {
  // res.send('THIS IS A SECRET! SHOULD NOT SEE ME UNLESS YOU ARE LOGGED IN!'); // * NOTE: debug logout route
  res.render('secret')
})


app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await User.findAndValidate(username, password);

  if(foundUser){
    req.session.user_id = foundUser._id; 
    res.redirect('/secret')
  }
  else{
    res.redirect('/login')
  }
})

app.get('/', (req, res) => {
  debugger;
  res.send('THIS IS THE HOME PAGE');
})

app.post('/logout', (req, res) => {
  // req.session.user_id = null; // * NOTE: clear session # 1
  req.session.destroy(); // * NOTE: clear session # 2
  res.redirect('/login');
})

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', async(req, res) => {
  // res.send(req.body); // * NOTE: debugging register route

  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username, 
    password: hash
  })
  await user.save();

  // res.send(hash); // * NOTE: debug bcrypt

  req.session.user_id = user._id; 
  res.redirect('/');
})

app.listen(port, () => {
  console.log(`[LOG] - currently listening on port: ${port}`);
})
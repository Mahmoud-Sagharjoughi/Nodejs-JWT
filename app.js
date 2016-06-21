const express = require('express'),
      mongoose = require('mongoose'),
      path = require('path'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      User = require('./app/models/user'),
      jwt = require('jsonwebtoken'),
      passport = require('passport'),
      config = require('./config/main'),
      app = express();

app.use(express.static('./bower_components'));

// view engine setup
app.set('views', path.join(__dirname));
app.set('view engine', 'jade');
app.locals.basedir = __dirname ;

// to get POST requests for REST-API
app.use(bodyParser.urlencoded({ extended: false })); // value can be Array or String
app.use(bodyParser.json()); // application/json

// log requests to console
app.use(morgan('dev'));

// initialize passport for use
app.use(passport.initialize());

// connect to database
mongoose.connect(config.database)
require('./config/passport')(passport);

// create API routes
var apiRoutes = express.Router();


//register new users
apiRoutes.post('/register', (req, res) => {
  if(!req.body.user || !req.body.pass) {
    res.json({ success: false, massage: 'please enter an username and password to register.'});
  } else {

    // if exists
    User.findOne({
      username: req.body.user
    }, (err, user) => {
      if (err) throw err;

    if (user) {
      res.send({ success: false, massage: 'This user already exists.' });
    } else {

    var newUser = new User({
      username: req.body.user,
      password: req.body.pass,
    });

  // save the new user
    newUser.save(function(err) {
      if (!err) {
        res.json({ success: true, message: 'Successfully created new user.' });
       }
     });
    }
  });
 }
});


// protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('It worked! user id is:' + req.user._id + '.');
});

// authenticate the user and get a JWT
apiRoutes.post('/login', (req, res) => {
  User.findOne({
    username: req.body.user
  }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, massage: 'User not found.' });
    } else {
      // check if the password matches
      user.comparePassword(req.body.pass, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(user, config.secret, {
            expiresIn: 10080 // in seconds
          });
          //res.json({ success: true, token: 'JWT ' + token });
          res.render("./public/index"); // render index.jade file
        } else {
          res.send({ success: false, massage: 'login failed, invalid password.' });
        }
      });
    }
  });
});

// set url for API routes
app.use('/api', apiRoutes);

// home route
apiRoutes.get('/login', (req, res) => {
    res.render("public/login"); // render login.jade file
});


app.listen(3000, (error) => {
	if (error) {
		return console.log('something bad happened', err);
	}
	console.log("Server running at http://localhost:3000/api/login");
});

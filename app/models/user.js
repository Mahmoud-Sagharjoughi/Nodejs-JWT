const mongoose = require('mongoose'),
      bcrypt = require('bcrypt'),
      saltRound = 10;
var db = mongoose.createConnection('localhost', 'jwt');

// Schema defines how the user data will be stored in MongoDB
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Client', 'Manager', 'Admin'],
    default: 'Client'
  }
});

// Saves the user's password hashed
UserSchema.pre('save', function (next) {
  const user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(saltRound, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// method to compare input password with the password saved in database
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    } else {
      cb(false, isMatch);
    }
  });
};

module.exports = mongoose.model('User', UserSchema);

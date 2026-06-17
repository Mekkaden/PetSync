const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Hash password before saving
//This is a Mongoose 'hook'. It means: Right before you hit 'save' to put this user into the database, pause for a second and run this function first

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { //if the user didnt change the password dont run the function go to next step
    next();
  }
  const salt = await bcrypt.genSalt(10); //generates the salt which is like a random string that is added to the password before hashing
  this.password = await bcrypt.hash(this.password, salt); //hashes the password
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  //The matchPassword method is defined directly on the UserSchema. This means every User document has this capability built-in.
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

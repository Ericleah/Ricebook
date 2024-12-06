const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
  },
  salt: { type: String },
  email: {},
  dob: {},
  phone: {},
  zipcode: {},
  password: {},
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }], // Assuming 'User' is the name of the model
  created: { type: Date, defazult: Date.now },
  avatar: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg",
  },
});

module.exports = mongoose.model("user", userSchema);
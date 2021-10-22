const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  username: String,
  log: [logSchema],
});

module.exports = mongoose.model("User", userSchema);

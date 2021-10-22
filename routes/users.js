const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/", async (req, res) => {
  let users = await User.find().select({ log: 0 });
  res.json(users);
});

router.post("/", async (req, res) => {
  let user = new User({
    username: req.body.username,
  });
  await user.save();

  res.json({ username: user.username, _id: user._id });
});

router.post("/:id/exercises", async (req, res) => {
  const newExercise = {
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date,
  };
  let userToUpdate = await User.findByIdAndUpdate(req.params.id, {
    $push: { log: newExercise },
  });

  await userToUpdate.save();
  res.json({
    _id: req.params.id,
    username: userToUpdate.username,
    ...newExercise,
  });
});

/*
GET user's exercise log: GET /api/users/:_id/logs?[from][&to][&limit]
[ ] = optional
from, to = dates (yyyy-mm-dd); limit = number
*/

router.get("/:id/logs", (req, res) => {
  res.json({ from: req.query.from, to: req.query.to, limit: req.query.limit });
});

module.exports = router;

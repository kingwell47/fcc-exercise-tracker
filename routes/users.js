const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    let users = await User.find().select({ log: 0 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.json("server error");
  }
});

router.post("/", async (req, res) => {
  if (req.body.username == "") return res.json("Path `username` is required.");

  try {
    let user = new User({
      username: req.body.username,
    });
    await user.save();

    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    console.error(err.message);
    res.json("server error");
  }
});

router.post("/:id/exercises", async (req, res) => {
  const newExercise = {
    description: req.body.description,
    duration: req.body.duration,
    date: new Date(req.body.date).toDateString(),
  };

  try {
    let userToUpdate = await User.findByIdAndUpdate(req.params.id, {
      $push: { log: newExercise },
    });

    await userToUpdate.save();
    res.json({
      _id: req.params.id,
      username: userToUpdate.username,
      ...newExercise,
    });
  } catch (err) {
    console.error(err.message);
    res.json("server error");
  }
});

/*
GET user's exercise log: GET /api/users/:_id/logs?[from][&to][&limit]
[ ] = optional
from, to = dates (yyyy-mm-dd); limit = number
*/

router.get("/:id/logs", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    let userLog = user.log.sort((item1, item2) => {
      const item1Date = new Date(item1.date);
      const item2Date = new Date(item2.date);
      return item1Date - item2Date;
    });

    const userObj = {
      _id: user._id,
      username: user.username,
    };

    const filterObj = {};

    if (req.query.from) {
      const fromDate = new Date(req.query.from);
      filterObj["from"] = fromDate.toDateString();
      userLog = userLog.filter((item) => {
        const itemDate = new Date(item.date);
        if (itemDate >= fromDate) {
          return item;
        }
      });
    }

    if (req.query.to) {
      const toDate = new Date(req.query.to);
      filterObj["to"] = toDate.toDateString();
      userLog = userLog.filter((item) => {
        const itemDate = new Date(item.date);
        if (itemDate <= toDate) {
          return item;
        }
      });
    }

    if (req.query.limit) {
      userLog = userLog.slice(0, req.query.limit);
    }

    const logObj = {
      count: userLog.length,
      log: userLog,
    };

    res.json({
      ...userObj,
      ...filterObj,
      ...logObj,
    });
  } catch (err) {
    console.error(err.message);
    res.json("server error");
  }
});

module.exports = router;

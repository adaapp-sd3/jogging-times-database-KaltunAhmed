var express = require("express");
var bcrypt = require("bcrypt");
var db = require("./database");
var User = require("./models/User");
var Jogs = require("./models/Jogs");
var followers = require("./models/Follower");

var routes = new express.Router();

var saltRounds = 10;

function formatDateForHTML(date) {
  return new Date(date).toISOString().slice(0, -8);
}

// main page
routes.get("/", function(req, res) {
  if (req.cookies.userId) {
    console.log(req.cookies.userId);
    // if we've got a user id, assume we're logged in and redirect to the app:
    res.redirect("/times");
  } else {
    // otherwise, redirect to login
    res.redirect("/sign-in");
  }
});

// show the create account page
routes.get("/create-account", function(req, res) {
  res.render("create-account.html");
});

// handle create account forms:
routes.post("/create-account", function(req, res) {
  var form = req.body;

  // TODO: add some validation in here to check

  // hash the password - we dont want to store it directly

  var passwordHash = bcrypt.hashSync(form.password, saltRounds);

  // create the user && set the userId as a cookie
  var userId = User.insert(form.name, form.email, passwordHash);
  res.cookie("userId", userId);

  // redirect to the logged in page
  res.redirect("/times/new");
});

// show the sign-in page
routes.get("/sign-in", function(req, res) {
  res.render("sign-in.html");
});

routes.post("/sign-in", function(req, res) {
  var form = req.body;
  var get_user_id = db.prepare(
    `SELECT id as the_user_id from user WHERE email = ?`
  );
  the_user_id = get_user_id.get(form.email);

  console.log(
    "LOOK HERE TO SEE THE USER ID PLEASE...",
    the_user_id.the_user_id
  );
  // find the user that's trying to log in
  var user = User.findByEmail(form.email);
  // if the user exists...
  if (user) {
    console.log({ form, user });
    if (bcrypt.compareSync(form.password, user.passwordHash)) {
      // the hashes match! set the log in cookie
      res.cookie("userId", the_user_id.the_user_id);
      // redirect to main app:
      res.redirect("/times");
    } else {
      // if the username and password don't match, say so
      res.render("sign-in.html", {
        errorMessage: "Email address and password do not match"
      });
    }
  } else {
    // if the user doesnt exist, say so
    res.render("sign-in.html", {
      errorMessage: "No user with that email exists"
    });
  }
});

// handle signing out
routes.get("/sign-out", function(req, res) {
  // clear the user id cookie
  res.clearCookie("userId");
  // redirect to the login screen
  res.redirect("/sign-in");
});

//handle deleting account
routes.get("/delete-account", function(req, res) {
  var accountId = req.cookies.userId;
  console.log("delete user", accountId);
  Jogs.deleteAccountById(accountId);
  User.deleteAccountById(accountId);

  res.redirect("/sign-in");
});

// list all job times
routes.get("/times", function(req, res) {
  var loggedInUser = User.findById(req.cookies.userId);
  var numberOfJogs = db.prepare(
    `SELECT count(*) as jogs_data from jogs WHERE user_id = ?`
  );
  jogs_data = numberOfJogs.get(req.cookies.userId);
  console.log("rows ", jogs_data.jogs_data);

  if (jogs_data.jogs_data < 3) {
    res.redirect("/times/new");
  }

  // the user id from the db
  var get_user_id = db.prepare(
    `SELECT id as the_user_id from user WHERE email = ?`
  );
  the_user_id = get_user_id.get(req.cookies.userId);

  console.log("LOOK HERE TO SEE THE USER ID PLEASE...", req.cookies.userId);
  // fake stats - TODO: get real stats from the database

  var distance = db.prepare(
    `SELECT SUM(distance) As totaldistance FROM jogs WHERE user_id = ?`
  );
  var totalDistance = distance.get(req.cookies.userId);

  var duration = db.prepare(
    `SELECT SUM(duration) As totalduration FROM jogs WHERE user_id = ?`
  );
  var totalDuration = duration.get(req.cookies.userId);
  var avgSpeed = totalDistance.totaldistance / totalDuration.totalduration;

  var numOfJogsCompleted = db.prepare(
    `SELECT COUNT(*) AS number_of_jogs FROM jogs WHERE user_id = ?`
  );
  number_of_jogs = numOfJogsCompleted.get(req.cookies.userId);

  var times_distance = db.prepare(
    `SELECT distance As new_distance FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 3`
  );
  //SECOND last distances entered by user
  var times_distance2 = db.prepare(
    `SELECT distance As new_distance2 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 1`
  );
  //THIRD LAST distances entered by user
  var times_distance3 = db.prepare(
    `SELECT distance As new_distance3 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 2`
  );

  //Distances
  var new_distance = times_distance.get(req.cookies.userId);
  var new_distance2 = times_distance2.get(req.cookies.userId);
  var new_distance3 = times_distance3.get(req.cookies.userId);

  // last enterd duration
  var time_duration = db.prepare(
    `SELECT duration As new_duration FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1`
  );
  var time_duration2 = db.prepare(
    `SELECT duration As new_duration2 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 1`
  );
  var time_duration3 = db.prepare(
    `SELECT duration As new_duration3 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 2`
  );

  // Durations
  var new_duration = time_duration.get(req.cookies.userId);
  var new_duration2 = time_duration2.get(req.cookies.userId);
  var new_duration3 = time_duration3.get(req.cookies.userId);
  // Averages
  var time_avg_speed = new_distance.new_distance / new_duration.new_duration;
  var time_avg_speed2 =
    new_distance2.new_distance2 / new_duration2.new_duration2;
  var time_avg_speed3 =
    new_distance3.new_distance3 / new_duration3.new_duration3;

  //ID's
  // Last 3 ID's enterd by the user
  var time_id_1 = db.prepare(
    `SELECT id as time_id FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 `
  );
  var time_id_2 = db.prepare(
    `SELECT id as time_id_2 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 1`
  );
  var time_id_3 = db.prepare(
    `SELECT id as time_id_3 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 2 `
  );

  var time_id = time_id_1.get(req.cookies.userId);
  var time_id_2 = time_id_2.get(req.cookies.userId);
  var time_id_3 = time_id_3.get(req.cookies.userId);

  // date of each entry
  var date_1 = db.prepare(
    `SELECT date as new_date FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 `
  );
  var date_2 = db.prepare(
    `SELECT date as new_date_2 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 1 `
  );
  var date_3 = db.prepare(
    `SELECT date as new_date_3 FROM jogs WHERE user_id = ? ORDER BY id DESC LIMIT 1  OFFSET 2 `
  );

  var new_date = date_1.get(req.cookies.userId);
  var new_date_2 = date_2.get(req.cookies.userId);
  var new_date_3 = date_3.get(req.cookies.userId);

  var parse_date_1 = new Date(new_date.new_date).toUTCString();
  var parse_date_2 = new Date(new_date_2.new_date_2).toUTCString();
  var parse_date_3 = new Date(new_date_3.new_date_3).toUTCString();

  the_parsed_date_1 = parse_date_1.toString();
  the_parsed_date_2 = parse_date_2.toString();
  the_parsed_date_3 = parse_date_3.toString();

  console.log("last date entered...", the_parsed_date_1);
  console.log("Second last date entered...", the_parsed_date_2);
  console.log("Third last date entered...", the_parsed_date_3);

  /*

  console.log("the id of the last enterd time...", time_id.time_id);
  console.log("the id of the last enterd time...", time_id_2.time_id_2);
  console.log("the id of the last enterd time...", time_id_3.time_id_3);
  */

  console.log("the user is..", req.cookies.userId);
  console.log("Last distance...", new_distance.new_distance);
  console.log("Second last distance...", new_distance2.new_distance2);
  console.log("Third last distance...", new_distance3.new_distance3);
  console.log("Last duration...", new_duration.new_duration);
  console.log("Second last duration...", new_duration2.new_duration2);
  console.log("Third last duration...", new_duration3.new_duration3);
  console.log("Avg speed...", time_avg_speed);
  console.log("Avg speed 2...", time_avg_speed2);
  console.log("Avg speed 3...", time_avg_speed3);

  res.render("list-times.html", {
    user: loggedInUser,
    stats: {
      totalDistance: totalDistance.totaldistance,
      totalDuration: totalDuration.totalduration,
      avgSpeed: avgSpeed.toFixed(2),
      number_of_jogs: number_of_jogs.number_of_jogs
    },

    // fake times: TODO: get the real jog times from the db
    times: [
      {
        id: time_id.time_id,
        startTime: the_parsed_date_1,
        new_duration: new_duration.new_duration,
        new_distance: new_distance.new_distance,
        avgSpeed: time_avg_speed.toFixed(2)
      },
      {
        id: time_id_2.time_id_2,
        startTime: the_parsed_date_2,
        new_duration2: new_duration2.new_duration2,
        new_distance2: new_distance2.new_distance2,
        avgSpeed: time_avg_speed2.toFixed(2)
      },
      {
        id: time_id_3.time_id_3,
        startTime: the_parsed_date_3,
        new_duration3: new_duration3.new_duration3,
        new_distance3: new_distance3.new_distance3,
        avgSpeed: time_avg_speed3.toFixed(2)
      }
    ]
  });
});

// show the create time form
routes.get("/times/new", function(req, res) {
  // this is hugely insecure. why?
  var loggedInUser = User.findById(req.cookies.userId);

  res.render("create-time.html", {
    user: loggedInUser
  });
});

// handle the create time form
routes.post("/times/new", function(req, res) {
  var form = req.body;

  var timesId = Jogs.insert(
    form.startTime,
    form.distance,
    form.duration,
    req.cookies.userId
  );
  console.log("create time", form);
  res.cookie("timesId", timesId);
  // TODO: save the new time
  res.redirect("/times");
});

// show the edit time form for a specific time
routes.get("/times/:id", function(req, res) {
  var timeId = req.params.id;
  console.log("get time", timeId);

  // TODO: get the real time for this id from the db
  var jogs = Jogs.findById(timeId);
  var loggedInUser = User.findById(req.cookies.userId);
  var jogTime = {
    id: timeId,
    startTime: Jogs.startTime,
    duration: Jogs.duration,
    distance: Jogs.distance
  };

  res.render("edit-time.html", { jogs, time: jogTime, user: loggedInUser });

  console.log("yoooo THIS IS JOG TIME B ", jogTime);
});

// handle the edit time form
routes.post("/times/:id", function(req, res) {
  var timeId = req.params.id;
  var form = req.body;

  console.log("edit time", {
    timeId: timeId,
    form: form
  });

  // TODO: edit the time in the db
  Jogs.updateJogById(form.startTime, form.distance, form.duration, timeId);
  res.redirect("/times");
});

// handle deleteing the time
routes.get("/times/:id/delete", function(req, res) {
  var timeId = req.params.id;
  console.log("delete time", timeId);

  // TODO: delete the time
  Jogs.deleteTimeById(timeId);
  res.redirect("/times");
});

routes.get("/accounts", function(req, res) {
  var loggedInUser = User.findById(req.cookies.userId);
  res.render("./accounts.html", {
    user: loggedInUser
  });

  res.status(200);
});
module.exports = routes;

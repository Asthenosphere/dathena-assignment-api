const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const { response } = require("express");
const fs = require("fs");
const { json } = require("body-parser");
let jsonData;
fs.readFile("./db.json", (err, data) => {
  if (err) throw err;
  jsonData = JSON.parse(data);
});

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get("/", function (req, res) {
  res.json({ message: "Hooray! Welcome to my api!" });
});

router.get("/api/users", (req, res) => {
  res.send(jsonData["users"]);
});

router.post("/api/user/create", (req, res) => {
  const user = req.body;
  const id = parseInt(jsonData.users[jsonData.users.length - 1].id);
  const newId = id + 1;
  const newUser = {
    id: newId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dob: user.dob,
  };
  jsonData.users.push(newUser);
  fs.writeFile("./db.json", JSON.stringify(jsonData), function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.send("User is created succesfully");
});

router.post("/api/user/update/:id", (req, res) => {
  const id = req.params["id"];
  const user = req.body;
  let updated = false;
  jsonData.users.map((x) => {
    if (parseInt(x.id) === parseInt(id)) {
      x.firstName = user.firstName;
      x.lastName = user.lastName;
      x.email = user.email;
      x.dob = user.dob;
      updated = true;
    }
  });
  fs.writeFile("./db.json", JSON.stringify(jsonData), function (err) {
    if (err) {
      console.log(err);
    }
  });
  if (updated) {
    res.send("User is updated successfully");
  } else {
    res.send("User is not found");
  }
});

router.post("/api/user/delete/:id", (req, res) => {
  const id = req.params["id"];
  const user = req.body;
  jsonData.users = jsonData.users.filter((x) => {
    return parseInt(x.id) !== parseInt(id);
  });
  res.send("User is deleted successfully");
  fs.writeFile("./db.json", JSON.stringify(jsonData), function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.use("/", router);
app.listen(PORT);

console.log(`Listening on port ${PORT}.`);

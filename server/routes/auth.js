const express = require("express");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const userModel = require("../models/User")

const minPasswordLength = 6;

router.post("/signup", (req, res, next) => {
  debugger
  // console.log("file ?", req.file);
  // console.log(req.body);
  var errorMsg = "";
  const { username, password, email } = req.body;
  // @todo : best if email validation here or check with a regex in the User model
  if (!password || !email || !username) errorMsg += "Provide email and password.\n";

  if (password.length < minPasswordLength)
    errorMsg += `Please make your password at least ${minPasswordLength} characters.`;
  
  if (errorMsg) return res.status(403).json(errorMsg); // 403	Forbidden
  
  const salt = bcrypt.genSaltSync(10);
    // more on encryption : https://en.wikipedia.org/wiki/Salt_(cryptography)
  const hashPass = bcrypt.hashSync(password, salt);
  
  const newUser = {
    username,
    email,
    password: hashPass
  };
  
  userModel
  .create(newUser)
  .then(newUserFromDB => {
      debugger
      res.status(200).json({msg: "signup ok"});
  })
  .catch(err => {
      console.log("signup error", err);
      next(err);
  });
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, failureDetails) => {
    if (err || !user) return res.status(403).json("invalid user infos"); // 403 : Forbidden

    /**
     * req.Login is a passport method
     * check the doc here : http://www.passportjs.org/docs/login/
     */
    req.logIn(user, function(err) {
      /* doc says: When the login operation completes, user will be assigned to req.user. */
      if (err) {
        return res.json({ message: "Something went wrong logging in" });
      }

      // We are now logged in
      // You may find usefull to send some other infos
      // dont send sensitive informations back to the client
      // let's choose the exposed user below
      const { _id, username, email } = user;
      // and only expose non-sensitive inofrmations to the client's state
      next(
        res.status(200).json({
          currentUser: {
            _id,
            username,
            email,
          }
        })
      );
    });
  })(req, res, next); // IIFE (module) pattern here (see passport documentation)
});


router.post("/signout", (req, res, next) => {
  req.logout(); // utility function provided by passport
  res.json({ message: "Success" });
});

router.use("/is-loggedin", (req, res, next) => {
  // if (req.isAuthenticated()) {
  //   // method provided by passport
  //   const { _id, username, email } = req.user;
  //   return res.status(200).json({
  //     currentUser: {
  //       _id,
  //       username,
  //       email
  //     }
  //   });
  // }
  // res.status(403).json("Unauthorized");
  return res.status(200).json({
    currentUser: {
      _id : "5e5d460cad71ca47f847cc9a",
      username : "tati",
      email : "tati@gmail.com"
    }
  });
});




module.exports = router;
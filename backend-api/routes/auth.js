const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/snowflake", passport.authenticate("snowflake"));

router.get(
  "/snowflake/callback",
  passport.authenticate("snowflake", {
    failureRedirect: "/auth/failure",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/failure", (req, res) => {
  res.status(401).json({ message: "Authentication failed" });
});

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;

const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const db = require("./Database");
const cors = require("cors");
const Passport = require("./passport");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const { upload, download } = require("./S3");
const fs = require("fs");
const multer = require('multer');
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage }).single('file');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.post("/signin", (req, res) => {
  res.send("GET request to the homepage");
});
//college login
app.post("/college/login", passport.authenticate('local', { session: false }), async (req, res) => {
  const { email, password } = req.body;
  const user = req.user
  console.log(req.authInfo.message);
  const token = jwt.sign({ user }, 'mysecretkey');
  res.json({ token });

  // console.log(await CollegeLogin(email, password));
});

// Define Google OAuth2 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "490495935267-ilp9mtbf8j06gndmda34e473bud4irg7.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:4000/auth/google/callback",
      scope: ["profile", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      const email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;

      console.log(email);

      return done(null, profile);
    }
  )
);

// Serialize user object to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user object from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Start Google OAuth2 authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  (req, res) => {
    // Get the authentication URL from the request object
  }
);

// Handle callback from Google OAuth2 authentication
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const email = req.user.emails[0].value;
    db.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).send("Internal server error");
        } else if (results.length > 0) {
          res.status(200);
          res.redirect("http://localhost:3000/");
        } else {
          const name = req.user.displayName;
          db.query(
            "INSERT INTO user (name, email) VALUES (?, ?)",
            [name, email],
            (error, results) => {
              if (error) {
                console.log(error);
                res.status(500).send("Internal server error");
              } else {
                res.status(200);
                res.redirect("http://localhost:3000/");
              }
            }
          );
        }
      }
    );
  }
);


// upload files to database and the server
app.get('/college/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log("enter the router after the jwt authentication");
  // res.json(req.authInfo)
  res.json({ message: 'college dashboard' });
})

app.post('/college/dashboard', uploadMiddleware, async (req, res) => {
  console.log(req.user);
  try {
    const file = req.file;
    console.log(file);
    const result = await upload(file);
    console.log(result);
    res.json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error uploading' });
  }
});





const { CollegeLogin } = require('./DBquery');
const db = require('./Database')
const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await CollegeLogin(email, password);
        if (!user) {
            return done(null, false, { message: 'Incorrect email or password.', errorCode: '400', });
        }

        return done(null, user, { message: 'Logged In Successfully', });
    } catch (err) {
        return done(err);
    }
}));

// passport.use(new JWTStrategy({
//     jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//     secretOrKey: 'mysecretkey'
// },

//     function (jwtPayload, cb) {
//         console.log(jwtPayload.toString());
//         return cb(null, jwtPayload);
//     }
// ));

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'mysecretkeyy'
};
passport.use(new JWTStrategy(opts, (jwtPayload, done) => {
    console.log("entering");
    const userId = jwtPayload.user.id;
    console.log(userId);
    db.query('SELECT * FROM College WHERE id = ?', userId, (err, rows) => {
        if (err) {
            console.log('error');
            return done(err, false);
        }
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            return done(null, false);
        }
    });
}));

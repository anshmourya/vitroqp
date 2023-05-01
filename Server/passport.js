const { CollegeLogin } = require('./DBquery');
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
            return done(null, false, { message: 'Incorrect email or password.' });
        }

        return done(null, user, { message: 'Logged In Successfully' });
    } catch (err) {
        return done(err);
    }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'mysecretkey'
},

    function (jwtPayload, cb) {

        return cb(null, jwtPayload);
    }
));

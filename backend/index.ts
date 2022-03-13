import body from 'body-parser';
import express from 'express';

//Authentication imports
import passport from 'passport';
import session from 'express-session';
//import strategy from 'passport-local';

import * as config from './config.json';
import * as ep from './endpoints'
import * as util from './utility';

const app: express.Application = express();
const port: number = config.port;
//const LocalStrategy = strategy.Strategy

app.use(body.urlencoded({extended : true}));
app.use(express.json());
app.use((req, _, next) => util.logRequest(req, next));
// This creates a session for a user and is required to maintain session information for authenticated users
app.use(session({
  secret: "secret",
  resave: false ,
  saveUninitialized: true ,
}))
// init passport on every route call.
app.use(passport.initialize())
// allow passport to use "express-session".
app.use(passport.session())

ep.attach(app);
util.addInvalidVerbs(app, '/');

// Server setup
app.listen(port, () => {
  console.log(`TypeScript with Express
         http://localhost:${port}/`);
});

// // define local authentication strategy
// passport.use(new LocalStrategy(authUser))

//attach the authenticated user to a unique session.
passport.serializeUser( (userObj, done) => {
  done(null, userObj)
})

app.post ("/login", passport.authenticate('local', {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
}))


// //The “authUser” function is a callback function that is required within the LocalStrategy,
// function authUser(user: string, password: string, done: (authenticated_user: object) => void) {
//      //Search the user, password in the DB to authenticate the user
//      let authenticated_user = { id: 123, name: "Kyle"}
//      return done(authenticated_user)
//   }

//import body from 'body-parser';
import express, {Request, Response, NextFunction} from 'express';

//Authentication imports
import passport from 'passport';
import session from 'express-session';
import strategy from 'passport-local';

//import * as config from './config.json';
//import * as ep from './endpoints'
//import * as util from './utility';

const app: express.Application = express();
//const port: number = config.port;
const LocalStrategy = strategy.Strategy;

declare module 'express-session' {
  export interface SessionData {
    passport: any;
  }
}

app.use(express.urlencoded({extended: false}));
//app.use(express.json());
//app.use((req, _, next) => util.logRequest(req, next));
// This creates a session for a user and is required to maintain session information for authenticated users
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));
// init passport on every route call.
app.use(passport.initialize());
// allow passport to use "express-session".
app.use(passport.session());

//ep.attach(app);
//util.addInvalidVerbs(app, '/');

// // Server setup
// app.listen(port, () => {
//     console.log(`TypeScript with Express
//          http://localhost:${port}/`);
// });


// //The “authUser” function is a callback function that is required within the LocalStrategy,
function authUser(user: string, password: string, done: (p: null, authenticated_user: object) => void) {
    console.log(`Value of "User" in authUser function ----> ${user}`);         //passport will populate, user = req.body.username
    console.log(`Value of "Password" in authUser function ----> ${password}`); //passport will popuplate, password = req.body.password
    //Search the user, password in the DB to authenticate the user
    //let name = user + password;
    //name = "Kyle"
    let authenticated_user = {id: 123, name: "Kyle"};
    //Let's assume that DB search that user found and password matched for Kyle
    return done(null, authenticated_user);
}

// // define local authentication strategy
passport.use(new LocalStrategy(authUser));

//attach the authenticated user to a unique session.
passport.serializeUser((user: object, done: (error: any, user: object) => void) => {
    console.log(`--------> Serialize User`);
    console.log(user);

    done(null, user);
});

//TODO test voeg de juiste types toe
passport.deserializeUser((id: number, done: (error: any, user: any) => void) => {
    console.log("---------> Deserialize Id")
    console.log(id)

  done(null, {name: "Kyle", id: 123});
})

//Middleware to see how the params are populated by Passport
let count = 1

function printData(req: Request, res: Response, next: NextFunction) {
    console.log("\n==============================");
    console.log(`------------>  ${count++}`);

    console.log(`req.body.username -------> ${req.body.username}`);
    console.log(`req.body.password -------> ${req.body.password}`);

    console.log(`\n req.session.passport -------> `);
    console.log(req.session.passport);
  
    console.log(`\n req.user -------> `); 
    console.log(req.user);
  
    console.log("\n Session and Cookie");
    console.log(`req.session.id -------> ${req.session.id}`); 
    console.log(`req.session.cookie -------> `);
    console.log(req.session.cookie);
  
    console.log("===========================================\n");

    next();
}

app.use(printData); //user printData function as middleware to print populated variables

app.get("/login", (req:Request, res:Response) => {
  res.render("login.ejs");
});

app.post("/login", passport.authenticate('local', {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
}));

app.get("/dashboard", checkAuthenticated, (req: Request, res: Response) => {
  // @ts-ignore
  res.render("dashboard.ejs", {name: req.user.name});
});

app.listen(3001, () => console.log(`Server started on port 3001...`));

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

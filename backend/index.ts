import body from 'body-parser';
import express from 'express';
import passport from 'passport';
import session from 'express-session';

import * as config from './config.json';
import * as ep from './endpoints'
import * as util from './utility';

const app: express.Application = express();
const port: number = config.port;

declare module 'express-session' {
  export interface SessionData {
    passport: any;
  }
}

app.use(body.urlencoded({extended : true}));
app.use(express.json());
app.use((req, _, next) => util.logRequest(req, next));
app.use(session({
  secret: "secret",
  resave: false ,
  saveUninitialized: false ,
}))
// init passport on every route call.
app.use(passport.initialize());
// allow passport to use "express-session".
app.use(passport.session());

ep.attach(app);
util.addInvalidVerbs(app, '/');

// Server setup
app.listen(port, () => {
    console.log(`TypeScript with Express
        http://localhost:${port}/`);
});

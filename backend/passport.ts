import {Request} from "express";
import * as personDB from "./orm_functions/person";

const bcrypt = require('bcrypt-nodejs')

let LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport: any) {


    passport.serializeUser((user: object, done: (error: any, user: object) => void) => {
        done(null, user);
    });

    passport.deserializeUser((user: object, done: (error: any, user: object) => void) => {
        done(null, user);
    })


    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req: Request, email: string, password: string, done: (error: any, user: any) => void) {
            process.nextTick(function () {
                //TODO
            });

        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req: Request, email: string, password: string, done: (error: any, user: object) => void) {
            personDB.getPasswordPersonByEmail(email).then(parsedPerson => {
                if (parsedPerson !== null) {
                    let loginUser = parsedPerson.login_user;
                    if (loginUser !== null && loginUser.password !== null && validPassword(loginUser.password, password)) {
                        //TODO

                        return done(null, loginUser);
                    }
                }
            })
        }));

    function generatePasswordHash(password: string) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    function validPassword(curPass: string, dbPass: string) {
        return bcrypt.compareSync(curPass, dbPass);
    }
};



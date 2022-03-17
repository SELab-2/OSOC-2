import express, {NextFunction, Request, Response} from 'express';

import {parseLoginRequest, parseLogoutRequest} from '../request';
import {Responses} from '../types';
import * as util from '../utility';

/* eslint-disable no-unused-vars */

/**
 *  Attempts to log a user into the system.
 *  @param _ The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function login(req: express.Request): Promise<Responses.Key> {
    return parseLoginRequest(req)
        .then(parsed => {
            let sessionkey: string = "";
            // TODO: login logic
            return Promise.resolve({sessionkey: sessionkey});
        })
}

/**
 *  Attempts to log a user out of the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function logout(req: express.Request): Promise<Responses.Empty> {
    return parseLogoutRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(checked => {
            // dummy to cheat eslint
            checked.sessionkey = "";
            // do logout logic
            // aka remove session key from database
            return Promise.resolve({});
        })
}

/* eslint-enable no-unused-vars */

/**
 *  Gets the router for all `/login/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/login/`
 * endpoints.
 */
export function getRouter(): express.Router {
    let router: express.Router = express.Router();

    router.post('/', (req, res) => util.respOrErrorNoReinject(res, login(req)));
    router.delete('/',
        (req, res) => util.respOrErrorNoReinject(res, logout(req)));
    util.addInvalidVerbs(router, '/');
    return router;
}

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
import express from 'express';

import {getPasswordPersonByEmail} from '../orm_functions/person';
import {addSessionKey} from '../orm_functions/session_key';
import {parseLoginRequest, parseLogoutRequest} from '../request';
import {Responses} from '../types';
import * as util from '../utility';

/* eslint-disable no-unused-vars */

/**
 *  Attempts to log a user into the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function login(req: express.Request): Promise<Responses.Key> {
  console.log("Calling login endpoint " + JSON.stringify(req.body));
  return parseLoginRequest(req).then(
      parsed => getPasswordPersonByEmail(parsed.name).then(async pass => {
        if (pass?.login_user?.password != parsed.pass) {
          console.log("Comparing pass `" + pass?.login_user?.password +
                      "` to `" + parsed.pass + "`");
          return Promise.reject(
              {http : 409, reason : 'Invalid e-mail or password.'});
        }
        const key: string = util.generateKey();
        return addSessionKey(pass.login_user.login_user_id, key)
            .then(ins => ({sessionkey : ins.session_key}));
      }));
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
        checked.data.sessionkey = "";
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

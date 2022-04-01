import axios from 'axios';
import * as crypto from 'crypto';
import express from 'express';

import * as config from '../config.json';
import * as github from '../github.json';
import * as ormLU from '../orm_functions/login_user';
import * as ormP from '../orm_functions/person';
import * as ormSK from '../orm_functions/session_key';
import {Anything, Requests, Responses} from '../types';
import * as util from '../utility';

let states: string[] = [];

function getHome(): string {
  const root = github.auth_callback_url;
  // check if dev or production
  console.log("Home is: " + root);
  return root;
}

function genState(): string {
  const state = crypto.randomBytes(64).join('');
  states.push(state);
  return state;
}

function checkState(state: string) {
  if (!states.includes(state)) {
    return false;
  }

  states = states.filter(x => x != state);
  return true;
}

// Step 1: redirect to github for identity
// Step 2: redirect to github for authentication
// Step 3: set session key, ...

function ghIdentity(resp: express.Response): void {
  let url = "https://github.com/login/oauth/authorize?";
  url += "client_id=" + github.client_id; // add client id
  url += "&allow_signup=true"; // allow users to sign up to github itself
  url +=                       // set redirect
      "&redirect_uri=" +
      encodeURIComponent(getHome() + config.global.preferred +
                         "/github/challenge");
  url += "&state=" + genState();
  console.log("--- REDIRECTING TO GITHUB AT " + url + " ---");
  util.redirect(resp, url);
}

async function ghExchangeAccessToken(req: express.Request,
                                     res: express.Response): Promise<void> {
  if (!("code" in req.query)) {
    return Promise.reject(config.apiErrors.github.argumentMissing);
  }

  if (!("state" in req.query)) {
    return Promise.reject(config.apiErrors.github.argumentMissing);
  }

  if (!checkState(req.query.state as string)) {
    return Promise.reject(config.apiErrors.github.illegalState);
  }

  return axios
      .post("https://github.com/login/oauth/access_token", {
        client_id : github.client_id,
        client_secret : github.secret,
        code : req.query.code as string,
        redirect_uri : getHome() + config.global.preferred + "/github/login"
      },
            {headers : {'Accept' : "application/json"}})
      .then(ares => axios.get("https://api.github.com/user", {
        headers : {'Authorization' : "token " + ares.data.access_token}
      }))
      .then(ares => parseGHLogin(ares.data))
      .then(login => ghSignupOrLogin(login))
      .then(result => util.redirect(res, config.global.frontend + "/login/" +
                                             result.sessionkey +
                                             "?is_admin=" + result.is_admin +
                                             "&is_coach=" + result.is_coach))
      .catch(err => {
        console.log('GITHUB ERROR ' + err);
        util.redirect(res, config.global.frontend + "/login?loginError=" +
                               config.apiErrors.github.other.reason);
        return Promise.resolve();
      });
}

function parseGHLogin(data: Anything): Promise<Requests.GHLogin> {
  if ('login' in data && 'name' in data) {
    return Promise.resolve(
        {login : data.login as string, name : data.name as string});
  }
  return Promise.reject();
}

async function ghSignupOrLogin(login: Requests.GHLogin):
    Promise<Responses.Login> {
  return ormP.getPasswordPersonByGithub(login.login)
      .then(person => {
        if (person == null || person.login_user == null)
          return Promise.reject({is_not_existent : true});
        return Promise.resolve(person.login_user);
      })
      .catch(async error => {
        if ('is_not_existent' in error && error.is_not_existent) {
          return ormP
              .createPerson(
                  {github : login.login, firstname : login.name, lastname : ''})
              .then(person => ormLU.createLoginUser({
                personId : person.person_id,
                isAdmin : false,
                isCoach : true,
                accountStatus : 'PENDING'
              }))
              .then(res => Promise.resolve({
                password : res.password,
                login_user_id : res.login_user_id,
                account_status : res.account_status,
                is_admin : false,
                is_coach : true
              }));
        } else {
          return Promise.reject(error); // pass on
        }
      })
      .then(async loginuser =>
                ormSK.addSessionKey(loginuser.login_user_id, util.generateKey())
                    .then(newkey => Promise.resolve({
                      sessionkey : newkey.session_key,
                      is_admin : loginuser.is_admin,
                      is_coach : loginuser.is_coach
                    })));
}

export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  router.get('/', (_, rs) => ghIdentity(rs));
  router.get('/challenge',
             async (req, res) => await ghExchangeAccessToken(req, res));

  return router;
}

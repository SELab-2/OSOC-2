import express from 'express';

import * as ormLU from '../orm_functions/login_user';
import * as ormP from '../orm_functions/person';
import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to list all coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listCoaches(req: express.Request):
    Promise<Responses.IdNameList> {
  return rq.parseCoachAllRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({data : [], sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to get all data for a certain coach in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoach(req: express.Request): Promise<Responses.Coach> {
  return rq.parseSingleCoachRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({data : {}, sessionkey : parsed.sessionkey});
      });
}

async function modCoach(req: express.Request):
    Promise<Responses.Keyed<string>> {
  return rq.parseUpdateCoachRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // UPDATING LOGIC
        return Promise.resolve({data : '', sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to delete a coach from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteCoach(req: express.Request): Promise<Responses.Key> {
  return rq.parseDeleteCoachRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // REMOVING LOGIC
        return Promise.resolve({sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to get all data for the requests of coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoachRequests(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.CoachRequest[]>> {
  return rq.parseGetCoachRequestRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({data : [], sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to create a new user in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createCoachRequest(req: express.Request):
    Promise<InternalTypes.IdOnly> {
  return rq.parseRequestCoachRequest(req).then(async parsed => {
    if (parsed.pass == undefined) {
      console.log(" -> WARNING coach request without password - " +
                  "currently only accepting email-based applications.");
      return Promise.reject(util.errors.cookArgumentError());
    }
    return ormP
        .createPerson({
          firstname : parsed.firstName,
          lastname : parsed.lastName,
          email : parsed.emailOrGithub
        })
        .then(person => {
          console.log("Created a person: " + person);
          return ormLU.createLoginUser({
            personId : person.person_id,
            password : parsed.pass,
            isAdmin : false,
            isCoach : true,
            accountStatus : 'PENDING'
          })
        })
        .then(user => {
          console.log("Attached a login user: " + user);
          return Promise.resolve({id : user.login_user_id});
        });
  });
}

/**
 *  Attempts to get the details of a coach request in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoachRequest(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.CoachRequest>> {
  return rq.parseGetCoachRequestRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({
          data : {id : 0, name : '', email : ''},
          sessionkey : parsed.sessionkey
        });
      });
}

/**
 *  Attempts to accept a request for becoming a coach.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createCoachAcceptance(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.IdName>> {
  return rq.parseAcceptNewCoachRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // UPDATING LOGIC
        return Promise.resolve(
            {data : {id : 0, name : ''}, sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to deny a request for becoming a coach.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteCoachRequest(req: express.Request):
    Promise<Responses.Key> {
  return rq.parseDenyNewCoachRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // UPDATING LOGIC
        return Promise.resolve({sessionkey : parsed.sessionkey});
      });
}

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router({strict : true});
  util.setupRedirect(router, '/coach');
  util.route(router, "get", "/all", listCoaches);

  util.route(router, "get", "/request", getCoachRequests);
  // signup is not a keyed request - doesn't match the callback type.
  // util.route(router, "post", "/request", createCoachRequest);
  router.post('/request', (req, res) => util.respOrErrorNoReinject(
                              res, createCoachRequest(req)));
  util.route(router, "get", "/request/:id", getCoachRequest);

  util.route(router, "post", "/request/:id", createCoachAcceptance);
  router.delete('/request/:id', (req, res) => util.respOrErrorNoReinject(
                                    res, deleteCoachRequest(req)));

  util.route(router, "get", "/:id", getCoach);

  util.route(router, "post", "/:id", modCoach);
  router.delete('/:id', (req, res) =>
                            util.respOrErrorNoReinject(res, deleteCoach(req)));

  util.addAllInvalidVerbs(router,
                          [ "/", "/all", "/:id", "/request", "/request/:id" ]);

  return router;
}

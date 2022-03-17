import express from 'express';

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
async function createCoachRequest(req: express.Request): Promise<string> {
  return rq.parseRequestCoachRequest(req).then(parsed => {
    // INSERTION LOGIC -> NEEDS FIXING
    return Promise.resolve(parsed.firstName);
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
          data : {id : '', name : '', email : ''},
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
            {data : {id : '', name : ''}, sessionkey : parsed.sessionkey});
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
  let router: express.Router = express.Router();

  router.get("/", (_, res) => util.redirect(res, "/coach/all"));
  util.route(router, "get", "/all", listCoaches);
  util.route(router, "get", "/:id", getCoach);

  util.route(router, "post", "/:id", modCoach);
  router.delete('/:id', (req, res) =>
                            util.respOrErrorNoReinject(res, deleteCoach(req)));

  util.route(router, "get", "/request", getCoachRequests);
  // signup is not a keyed request - doesn't match the callback type.
  // util.route(router, "post", "/request", createCoachRequest);
  router.post('/request', (req, res) => util.respOrErrorNoReinject(
                              res, createCoachRequest(req)));
  util.route(router, "get", "/request/:id", getCoachRequest);

  util.route(router, "post", "/request/:id", createCoachAcceptance);
  router.delete('/request/:id', (req, res) => util.respOrErrorNoReinject(
                                    res, deleteCoachRequest(req)));

  util.addAllInvalidVerbs(router,
                          [ "/", "/all", "/:id", "/request", "/request/:id" ]);

  return router;
}

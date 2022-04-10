import {account_status_enum} from '@prisma/client';
import express from 'express';

import * as ormLU from '../orm_functions/login_user';
import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';
import * as ormP from "../orm_functions/person";

/**
 *  Attempts to list all coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listCoaches(req: express.Request): Promise<Responses.CoachList> {
  return rq.parseCoachAllRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(
          async parsed =>
              ormLU.searchAllCoachLoginUsers(true)
                  .then(obj =>
                            obj.map(val => ({
                                      person_data : {
                                          id : val.person.person_id,
                                          name : val.person.firstname + " " + val.person.lastname,
                                          email : val.person.email,
                                          github : val.person.github
                                      },
                                      coach : val.is_coach,
                                      admin : val.is_admin,
                                      activated : val.account_status as string
                                    })))
                  .then(
                      obj => Promise.resolve(
                          {sessionkey : parsed.data.sessionkey, data : obj})));
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
      .then(() => {
        return Promise.reject({http : 410, reason : 'Deprecated endpoint.'});
      });
}

/**
 *  Attempts to modify a certain coach in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function modCoach(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.IdName>> {
  return rq.parseUpdateCoachRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(async parsed => {
        return ormLU
            .updateLoginUser({
              loginUserId : parsed.data.id,
              password : parsed.data.pass,
              isAdmin : parsed.data.isAdmin,
              isCoach : parsed.data.isCoach,
              accountStatus : parsed.data.accountStatus as account_status_enum
            })
            .then(res => Promise.resolve({
              sessionkey : parsed.data.sessionkey,
              data : {
                id : res.login_user_id,
                name : res.person.firstname + " " + res.person.lastname
              }
            }));
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
      .then(async parsed => {
        return ormLU.deleteLoginUserByPersonId(parsed.data.id)
            .then(() => {
                return ormP.deletePersonById(parsed.data.id)
                    .then(() => Promise.resolve({sessionkey : parsed.data.sessionkey}))
            });
      });
}

/**
 *  Attempts to get all data for the requests of coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoachRequests(req: express.Request):
    Promise<Responses.CoachList> {
  return rq.parseGetAllCoachRequestsRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(async parsed => {
        return ormLU.getAllLoginUsers()
            .then(obj => obj.filter(v => v.is_coach &&
                                         v.account_status == 'PENDING')
                             .map(v => ({
                                    person_data : {
                                      id : v.person.person_id,
                                      name : v.person.firstname + " " +
                                                 v.person.lastname
                                    },
                                    coach : v.is_coach,
                                    admin : v.is_admin,
                                    activated : v.account_status as string
                                  })))
            .then(arr => Promise.resolve(
                      {sessionkey : parsed.data.sessionkey, data : arr}));
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
      .then(() => {
        return Promise.reject({http : 410, reason : 'Deprecated endpoint.'});
      });
}

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
  const router: express.Router = express.Router({strict : true});
  util.setupRedirect(router, '/coach');
  util.route(router, "get", "/all", listCoaches);

  util.route(router, "get", "/request", getCoachRequests);
  util.route(router, "get", "/request/:id", getCoachRequest);

  util.route(router, "get", "/:id", getCoach);

  util.route(router, "post", "/:id", modCoach);
  util.routeKeyOnly(router, "delete", "/:id", deleteCoach);

  util.addAllInvalidVerbs(router,
                          [ "/", "/all", "/:id", "/request", "/request/:id" ]);

  return router;
}

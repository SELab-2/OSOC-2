import express from 'express';

import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';
import * as ormL from "../orm_functions/login_user";

/**
 *  Attempts to list all admins in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listAdmins(req: express.Request): Promise<Responses.AdminList> {
  return rq.parseAdminAllRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
          const adminList : InternalTypes.Admin[] = [];
          ormL.getAllLoginUsers().then(loginUsers => {
              return loginUsers.forEach(loginUser => {
                  adminList.push({
                      firstname: loginUser.person.firstname,
                      lastname: loginUser.person.lastname,
                      email: loginUser.person.email,
                      github: loginUser.person.github,
                      personId: loginUser.person.person_id,
                      isAdmin: loginUser.is_admin,
                      isCoach: loginUser.is_coach,
                      accountStatus: loginUser.account_status
                  })
              })
          })
          // LISTING LOGIC
          return Promise.resolve({data : adminList, sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to get all data for a certain admin in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getAdmin(req: express.Request): Promise<Responses.Admin> {
  return rq.parseSingleAdminRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({data : {}, sessionkey : parsed.sessionkey});
      });
}

async function modAdmin(req: express.Request):
    Promise<Responses.Keyed<string>> {
  return rq.parseUpdateAdminRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // UPDATING LOGIC
        return Promise.resolve({data : '', sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to delete an admin from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteAdmin(req: express.Request): Promise<Responses.Key> {
  return rq.parseDeleteAdminRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // REMOVING LOGIC
        return Promise.resolve({sessionkey : parsed.sessionkey});
      });
}

/**
 *  Gets the router for all `/admin/` related endpoints.
 *  @returns An Epress.js {@link express.Router} routing all `/admin/`
 * endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router();

  util.setupRedirect(router, '/admin');
  util.route(router, "get", "/all", listAdmins);
  util.route(router, "get", "/:id", getAdmin);

  util.route(router, "post", "/:id", modAdmin);
  router.delete('/:id', (req, res) =>
                            util.respOrErrorNoReinject(res, deleteAdmin(req)));

  util.addAllInvalidVerbs(router, [ "/", "/all", "/:id" ]);

  return router;
}

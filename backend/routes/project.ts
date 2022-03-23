import express from 'express';

import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createProject(req: express.Request):
    Promise<Responses.Keyed<string>> {
  return rq.parseNewProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({data : '', sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to list all projects in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listProjects(req: express.Request):
    Promise<Responses.IdNameList> {
  return rq.parseProjectAllRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({data : [], sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to get all data for a certain project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getProject(req: express.Request): Promise<Responses.Project> {
  return rq.parseSingleProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({data : '', sessionkey : parsed.sessionkey});
      });
}

async function modProject(req: express.Request):
    Promise<Responses.Keyed<string>> {
  return rq.parseUpdateProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // UPDATING LOGIC
        return Promise.resolve({data : '', sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to delete a project from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteProject(req: express.Request): Promise<Responses.Key> {
  return rq.parseDeleteProjectRequest(req)
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
async function getDraftedStudents(req: express.Request):
    Promise<Responses.ProjectDraftedStudents> {

  return rq.parseGetDraftedStudentsRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({
          data : {id : 0, name : '', students : []},
          sessionkey : parsed.sessionkey
        });
      });
}

async function modProjectStudent(req: express.Request):
    Promise<Responses.ModProjectStudent> {
  return rq.parseDraftStudentRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({
          data : {drafted : false, roles : []},
          sessionkey : parsed.sessionkey
        });
      });
}

// TODO project conflicts
/*async function getProjectConflicts(req: express.Request):
    Promise<Responses.ModProjectStudent> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify a student of this project
        let roles : string[] = [];
        return Promise.resolve({
            data : {drafted : true, roles : roles},
            sessionkey : ''
        });
    });
}*/

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router();

  util.setupRedirect(router, '/project');
  util.route(router, "get", "/all", listProjects);
  util.route(router, "post", "/:id", createProject);
  util.route(router, "get", "/:id", getProject);

  util.route(router, "post", "/:id", modProject);
  router.delete('/:id', (req, res) => util.respOrErrorNoReinject(
                            res, deleteProject(req)));

  util.route(router, "get", "/:id/draft", getDraftedStudents);
  util.route(router, "post", "/:id/draft", modProjectStudent);
  // TODO project conflicts
  // util.route(router, "get", "/conflicts", getProjectConflicts);

  // TODO add project conflicts
  util.addAllInvalidVerbs(
      router, [ "/", "/all", "/:id", "/:id/draft", "/request/:id" ]);

  return router;
}

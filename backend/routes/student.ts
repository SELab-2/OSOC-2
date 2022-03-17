import express from 'express';

import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to create a new student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudent(req: express.Request):
    Promise<Responses.PartialStudent> {
  return rq.parseNewStudentRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve(
            {data : {name : '', id : ''}, sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listStudents(req: express.Request):
    Promise<Responses.IdNameList> {
  return rq.parseStudentAllRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // LISTING LOGIC
        return Promise.resolve({data : [], sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to get all data for a certain student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudent(req: express.Request): Promise<Responses.Student> {
  return rq.parseSingleStudentRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => util.isValidID(parsed, "student"))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({
          data : {id : parsed.id, name : '', email : '', labels : []},
          sessionkey : parsed.sessionkey
        });
      });
}

async function modStudent(req: express.Request): Promise<Responses.Student> {
  return rq.parseUpdateStudentRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
        // UPDATE LOGIC
        return Promise.resolve({
          data : {id : '', name : '', email : '', labels : []},
          sessionkey : parsed.sessionkey
        });
      });
}

/**
 *  Attempts to delete a student from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteStudent(req: express.Request): Promise<Responses.Key> {
  return rq.parseDeleteStudentRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
        // DELETE LOGIC
        return Promise.resolve({sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to create a student suggestion in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentSuggestion(req: express.Request):
    Promise<Responses.Suggestion> {
  return rq.parseSuggestStudentRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // SUGGESTING LOGIC
        return Promise.resolve({data : [], sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to list all student suggestions in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudentSuggestions(req: express.Request):
    Promise<Responses.SuggestionInfo> {
  return rq.parseStudentGetSuggestsRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
        // FETCHING LOGIC
        return Promise.resolve({data : [], sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to create a student confirmation in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentConfirmation(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.Suggestion>> {
  return rq.parseFinalizeDecisionRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
        // UPDATING LOGIC
        return Promise.resolve({data : 'YES', sessionkey : parsed.sessionkey});
      });
}

/**
 *  Attempts to filter students in the system by name, role, status or mail
 * status.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function searchStudents(req: express.Request):
    Promise<Responses.IdNameList> {
  // SEARCHING NOT DISCUSSED YET - NO PARSER EITHER
  return Promise.resolve({data : [], sessionkey : req.body.sessionkey});
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router();

  router.get("/", (_, res) => util.redirect(res, "/student/all"));
  util.route(router, "post", "/", createStudent);
  util.route(router, "get", "/all", listStudents);
  util.route(router, "get", "/:id", getStudent);
  util.route(router, "post", "/:id", modStudent);
  router.delete('/:id', (req, res) => util.respOrErrorNoReinject(
                            res, deleteStudent(req)));

  util.route(router, "post", "/:id/suggest", createStudentSuggestion);
  util.route(router, "get", "/:id/suggest", getStudentSuggestions);

  util.route(router, "post", "/:id/confirm", createStudentConfirmation);

  util.route(router, "get", "/search", searchStudents);

  util.addAllInvalidVerbs(
      router,
      [ "/", "/all", "/:id", "/:id/suggest", "/:id/confirm", "/search" ]);

  return router;
}

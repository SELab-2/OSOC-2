import express from 'express';

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
  return util.checkSessionKey(req).then((_: express.Request) => {
    let name: string = '';
    let id: string = '';
    // TODO do insertion logic

    return Promise.resolve({data : {name : name, id : id}, sessionkey : ''});
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
  return util.checkSessionKey(req).then((_: express.Request) => {
    let students: InternalTypes.IdName[] = [];
    // TODO list all students

    return Promise.resolve({data : students, sessionkey : ''});
  });
}

/**
 *  Attempts to get all data for a certain student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudent(req: express.Request):
    Promise<Responses.Student>{return util.checkSessionKey(req).then(
    async (_) => {// check valid id
      // if invalid: return Promise.reject(util.cookInvalidID())
      // if valid: get student data etc etc
      return Promise.resolve({
        data : {id : '', name : '', email : '', labels : []},
        sessionkey : ''
      })})}

async function modStudent(req: express.Request):
    Promise<Responses.Student> {
  return util.checkSessionKey(req).then(async (_) => {
    // check valid id
    // if invalid: return Promise.reject(util.cookInvalidID());
    // if valid: modify student data
    return Promise.resolve({
      data : {id : '', name : '', email : '', labels : []},
      sessionkey : ''
    });
  });
}

/**
 *  Attempts to delete a student from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteStudent(req: express.Request):
    Promise<Responses.Key> {
  return util.checkSessionKey(req).then(async (_) => {
    // check valid id
    // if invalid: return Promise.reject(util.cookInvalidID());
    // if valid: delete student data
    return Promise.resolve({sessionkey : ''});
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
  return util.checkSessionKey(req).then(async (_) => {
    // check valid id
    // if invalid: return Promise.reject(util.cookInvalidID());
    // if valid: create or modify and check valid suggestion
    // if invalid suggestion: return Promise.reject(util.cookArgumentError());
    // if valid suggestion: create student suggestion
    let suggestions: InternalTypes.SuggestionCount[] = [];
    return Promise.resolve({data : suggestions, sessionkey : ''});
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
  return util.checkSessionKey(req).then((_: express.Request) => {
    let suggestions: InternalTypes.SuggestionInfo[] = [];
    // check valid id
    // if invalid: return Promise.reject(util.cookInvalidID());
    // if valid: return all suggestions for this student

    return Promise.resolve({data : suggestions, sessionkey : ''});
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
  return util.checkSessionKey(req).then(async (_) => {
    // check valid id
    // if invalid: return Promise.reject(util.cookInvalidID());
    // if valid: create or modify confirmation
    let suggestion: InternalTypes.Suggestion = "YES";
    // check valid confirmation
    // if invalid confirmation: return Promise.reject(util.cookArgumentError());
    // if valid confirmation: create student confirmation
    return Promise.resolve({data : suggestion, sessionkey : ''});
  });
}

/**
 *  Attempts to filter students in the system by name, role, status or mail status.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function searchStudents(req: express.Request):
    Promise<Responses.IdNameList> {
  return util.checkSessionKey(req).then(async (_) => {
    // check filter type (empty, name, role, status, mail status)
    // get data
    let students: InternalTypes.IdName[] = [];
    return Promise.resolve({data : students, sessionkey : ''});
  });
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Epress.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router();

  router.get("/", (_, res) => util.redirect(res, "/student/all"));
  util.route(router, "post", "/", createStudent);
  util.route(router, "get", "/all", listStudents);
  util.route(router, "get", "/:id", getStudent);
  util.route(router, "post", "/:id", modStudent);
  router.delete('/:id',
      (req, res) => util.respOrErrorNoReinject(res, deleteStudent(req)));

  util.route(router, "post", "/:id/suggest", createStudentSuggestion);
  util.route(router, "get", "/:id/suggest", getStudentSuggestions);

  util.route(router, "post", "/:id/confirm", createStudentConfirmation);

  util.route(router, "get", "/search", searchStudents);

  util.addAllInvalidVerbs(router, [ "/", "/all", "/:id", "/:id/suggest", "/:id/confirm", "/search" ]);

  return router;
}
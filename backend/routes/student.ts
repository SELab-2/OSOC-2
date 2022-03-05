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
    var name: string = '';
    var id: string = '';
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
    Promise<Responses.StudentList> {
  return util.checkSessionKey(req).then((_: express.Request) => {
    var students: InternalTypes.IdName[] = [];
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
async function getStudent(req: express.Request): Promise<Responses.Student> {
  return util.checkSessionKey(req).then(
      async (_) => {// check valid id
                    // if invalid: return Promise.resolve(util.cookInvalidID())
                    // if valid: get student data etc etc
                    return Promise.resolve({
                      data : {id : '', name : '', email : '', labels : []},
                      sessionkey : ''
                    })})
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Epress.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
  var router: express.Router = express.Router();

  router.get('/', (_, res) => util.redirect(res, '/all'));
  router.post('/',
              (req, res) => util.respOrError(req, res, createStudent(req)));
  router.get('/all',
             (req, res) => util.respOrError(req, res, listStudents(req)));
  router.get('/:id', (req, res) => util.respOrError(req, res, getStudent(req)));
  return router;
}

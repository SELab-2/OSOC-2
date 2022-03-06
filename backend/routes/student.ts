import express from 'express';

import * as types from '../types';
import * as util from '../utility';

async function createStudent(req: express.Request):
    Promise<types.orError<types.PartialStudentResponse>> {
  return util.checkSessionKey(req)
      .then((_: express.Request) => {
        var name: string = '';
        var id: string = '';
        // TODO do insertion logic

        return Promise.resolve({name : name, id : id, sessionkey : ''});
      })
      .then(res => util.refreshAndInjectKey(req.body.sessionkey, res));
}

async function listStudents(req: express.Request):
    Promise<types.orError<types.StudentList>> {
  return util.checkSessionKey(req)
      .then((_: express.Request) => {
        var students: types.UnkeyedStudentResponse[] = [];
        // TODO list all students

        return Promise.resolve({students : students, sessionkey : ''});
      })
      .then(res => util.refreshAndInjectKey(req.body.sessionkey, res));
}

async function getStudent(req: express.Request):
    Promise<types.orError<types.StudentResponse>> {
  return util.checkSessionKey(req).then(async (req) => {
    // check valid id
    // if invalid: return Promise.resolve(util.cookInvalidID())
    // if valid: get student data etc etc
    return Promise
        .resolve({id : '', name : '', email : '', labels : [], sessionkey : ''})
        .then((data) => util.refreshAndInjectKey(req.body.sessionkey, data));
  })
}

export function getRouter(): express.Router {
  var router: express.Router = express.Router();

  router.get('/', (_, res) => util.redirect(res, '/all'));
  router.post('/', (req, res) => util.respOrError(res, createStudent(req)));
  router.get('/all', (req, res) => util.respOrError(res, listStudents(req)));
  router.get('/:id', (req, res) => util.respOrError(res, getStudent(req)));
  return router;
}

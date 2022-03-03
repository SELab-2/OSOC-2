import express from 'express';

import * as types from '../types';
import * as util from '../utility';

async function login(_: express.Request): Promise<types.orError<types.Keyed>> {
  var sessionkey: string = "";
  // TODO: login logic
  return Promise.resolve({sessionkey : sessionkey});
}

async function logout(req: express.Request):
    Promise<types.orError<types.EmptyResponse>> {
  return util.checkSessionKey(req)
      .then((_: express.Request) => {
        // TODO logout logic
        return Promise.resolve({});
      })
      .catch(() => Promise.resolve(util.errors.cookUnauthenticated()));
}

export function getRouter(): express.Router {
  var router: express.Router = express.Router();

  router.post('/', (req, res) => util.respOrError(res, login(req)));
  router.delete('/', (req, res) => util.respOrError(res, logout(req)));
  util.addInvalidVerbs(router, '/');
  return router;
}

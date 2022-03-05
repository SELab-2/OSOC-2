import express from 'express';

import {Responses} from '../types';
import * as util from '../utility';

async function login(_: express.Request): Promise<Responses.Key> {
  var sessionkey: string = "";
  // TODO: login logic
  return Promise.resolve({sessionkey : sessionkey});
}

async function logout(req: express.Request): Promise<Responses.Empty> {
  return util.checkSessionKey(req).then((_: express.Request) => {
    // TODO logout logic
    return Promise.resolve({});
  });
}

export function getRouter(): express.Router {
  var router: express.Router = express.Router();

  router.post('/', (req, res) => util.respOrError(res, login(req)));
  router.delete('/', (req, res) => util.respOrError(res, logout(req)));
  util.addInvalidVerbs(router, '/');
  return router;
}

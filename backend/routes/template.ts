import express from 'express';

import * as ormT from '../orm_functions/template';
import * as rq from '../request';
import * as util from '../utility';

async function getAllTemplates(req: express.Request) {
  return rq.parseTemplateListRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(checked => ormT.getAllTemplates()
                           .then(res => res.map(obj => ({
                                                  id : obj.template_email_id,
                                                  owner : obj.owner_id,
                                                  name : obj.name
                                                })))
                           .then(res => Promise.resolve({
                             sessionkey : checked.data.sessionkey,
                             data : res
                           })));
}

export function getRouter() {
  const router: express.Router = express.Router();

  util.setupRedirect(router, '/template');

  util.route(router, 'get', '/all', getAllTemplates);

  return router;
}

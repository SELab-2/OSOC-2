import express from 'express';

import * as ormJA from '../orm_functions/job_application';
import * as ormOsoc from '../orm_functions/osoc';
import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';

async function listFollowups(req: express.Request):
    Promise<Responses.FollowupList> {
  return rq.parseFollowupAllRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(checked => ormOsoc.getLatestOsoc().then(async osoc => {
        // TODO: after merging project-routes, replace with correct util call
        if (osoc == null)
          return Promise.reject({});
        return ormJA.getJobApplicationByYear(osoc.year)
            .then(arr => arr.map(v => ({
                                   student : v.student_id,
                                   application : v.job_application_id,
                                   status : v.email_status
                                 })))
            .then(res => Promise.resolve(
                      {sessionkey : checked.data.sessionkey, data : res}));
      }));
}

async function getFollowup(req: express.Request):
    Promise<Responses.SingleFollowup> {
  return rq.parseGetFollowupStudentRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(checked => ormJA.getLatestJobApplicationOfStudent(checked.data.id)
                           .then(ja => {
                             // todo: replace with correct util call
                             if (ja == null)
                               return Promise.reject({});
                             return Promise.resolve(ja);
                           })
                           .then(ja => Promise.resolve({
                             sessionkey : checked.data.sessionkey,
                             data : {
                               student : ja.student_id,
                               application : ja.job_application_id,
                               status : ja.email_status
                             }
                           })));
}

export function getRouter() {
  const router: express.Router = express.Router();

  util.setupRedirect(router, '/followup');
  util.route(router, 'get', '/all', listFollowups);
  util.route(router, 'get', '/:id', getFollowup);

  util.addAllInvalidVerbs(router, [ '/', '/all' ]);

  return router;
}

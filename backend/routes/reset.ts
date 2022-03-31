import express from 'express';

import * as config from '../config.json';
// import * as ormLU from '../orm_functions/login_user';
import * as ormPR from '../orm_functions/password_reset';
import * as ormP from '../orm_functions/person';
import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';

async function requestReset(req: express.Request): Promise<Responses.Empty> {
  return rq.parseRequestResetRequest(req)
      .then((parsed) => ormP.getPasswordPersonByEmail(parsed.email))
      .then(async (person) => {
        if (person == null || person.login_user == null) {
          return Promise.reject(config.apiErrors.inavlidEmailReset);
        }
        const date: Date = new Date(Date.now());
        date.setHours(date.getHours() + 24);
        return ormPR
            .createOrUpdateReset(person.login_user.login_user_id,
                                 util.generateKey(), date)
            .then(() => {
              // somehow send an email
              return Promise.resolve({});
            })
      });
}

async function resetPassword() {
  //
}

export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  router.post('/',
              (req, res) => util.respOrErrorNoReinject(res, requestReset(req)));
  util.route(router, "post", "/:id", resetPassword);

  util.addAllInvalidVerbs(router, [ "/", "/:id" ]);

  return router;
}

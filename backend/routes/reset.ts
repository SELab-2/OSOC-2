import express from 'express';
import * as nodemailer from 'nodemailer';

import * as config from '../config.json';
import mailer from '../email';
import * as ormLU from '../orm_functions/login_user';
import * as ormPR from '../orm_functions/password_reset';
import * as ormP from '../orm_functions/person';
import * as ormSK from '../orm_functions/session_key';
import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';

async function requestReset(req: express.Request): Promise<Responses.Empty> {
  return rq.parseRequestResetRequest(req).then(
      (parsed) =>
          ormP.getPasswordPersonByEmail(parsed.email).then(async (person) => {
            if (person == null || person.login_user == null) {
              return Promise.reject(config.apiErrors.inavlidEmailReset);
            }
            const date: Date = new Date(Date.now());
            date.setHours(date.getHours() + 24);
            return ormPR
                .createOrUpdateReset(person.login_user.login_user_id,
                                     util.generateKey(), date)
                .then(async (code) => {
                  return mailer({
                           to : parsed.email,
                           subject : config.email.header,
                           html : '<p>' + code.reset_id + '</p>'
                         })
                      .then(data => {
                        console.log(data);
                        console.log(nodemailer.getTestMessageUrl(data));
                        return Promise.resolve({});
                      });
                });
          }));
}

async function checkCode(req: express.Request): Promise<Responses.Empty> {
  return rq.parseCheckResetCodeRequest(req)
      .then(parsed => ormPR.findResetByCode(parsed.code))
      .then(res => {
        if (res == null || res.valid_until < new Date(Date.now()))
          return Promise.reject();

        return Promise.resolve({});
      })
      .catch(() => Promise.reject(util.errors.cookArgumentError()));
}

async function resetPassword(req: express.Request): Promise<Responses.Key> {
  return rq.parseResetPasswordRequest(req).then(
      parsed => ormPR.findResetByCode(parsed.code).then(async code => {
        if (code == null || code.valid_until < new Date(Date.now()))
          return Promise.reject(util.errors.cookArgumentError());

        return ormLU.getLoginUserById(code.login_user_id)
            .then(user => {
              if (user == null)
                return Promise.reject();
              console.log("Updating user " + JSON.stringify(user) +
                          "'s  password to " + parsed.password);
              return ormLU.updateLoginUser({
                loginUserId : user.login_user_id,
                isAdmin : user.is_admin,
                isCoach : user.is_coach,
                accountStatus : user?.account_status,
                password : parsed.password
              });
            })
            .then(user => {
              console.log(JSON.stringify(user));
              return ormSK.addSessionKey(user.login_user_id,
                                         util.generateKey());
            })
            .then(async key => {
              return ormPR.deleteResetWithResetId(code.reset_id)
                  .then(() => Promise.resolve({sessionkey : key.session_key}));
            });
      }));
}

export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  router.post('/',
              (req, res) => util.respOrErrorNoReinject(res, requestReset(req)));
  router.get('/:id',
             (req, res) => util.respOrErrorNoReinject(res, checkCode(req)));
  router.post("/:id", (req, res) =>
                          util.respOrErrorNoReinject(res, resetPassword(req)));

  util.addAllInvalidVerbs(router, [ "/", "/:id" ]);

  return router;
}

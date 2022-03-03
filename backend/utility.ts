import express from 'express';

import * as config from './config.json';
import * as types from './types';

export const errors: types.Errors = {
  cookInvalidID() {
    return {
      http : config.httpErrors.invalidID,
      reason : "This endpoint requires an ID. The ID you provided was invalid."
    };
  },

  cookArgumentError() {
    return {
      http : config.httpErrors.argumentError,
      reason :
          "One of the arguments is incorrect or not present. Please check your request."
    };
  },

  cookUnauthenticated() {
    return {
      http : config.httpErrors.unauthenticated,
      reason : "Unauthenticated request. Please log in first."
    };
  },

  cookInsufficientRights() {
    return {
      http : config.httpErrors.insufficientRights,
      reason :
          "Unauthorized request. You do not have sufficient rights to access this endpoint."
    };
  },

  cookNonExistent(url: String) {
    return {
      http : config.httpErrors.nonExistent,
      reason : "The endpoint requested (" + url + ") does not exist."
    };
  },

  cookInvalidVerb(req: express.Request) {
    return {
      http : config.httpErrors.invalidVerb,
      reason : "This HTTP verb (" + req.method +
                   ") is not supported for this endpoint (" + req.url + ")."
    };
  },

  cookNonJSON(mime: String) {
    return {
      http : config.httpErrors.nonJSONRequest,
      reason : "All endpoints only support JSON (" + mime + " requested)."
    };
  },

  cookServerError() {
    return {
      http : config.httpErrors.serverError,
      reason : "Something went wrong while trying to execute your request."
    };
  }
}

export function debug(data: any):
    Promise<typeof data> {
      console.log(data);
      return Promise.resolve(data);
    }

export function reply(resp: express.Response, status: number, data: any):
    Promise<void> {
      resp.status(status).send(data);
      return Promise.resolve();
    }

export function replyError(resp: express.Response, error: types.ApiError):
    Promise<void> {
      return reply(resp, error.http, {success : false, reason : error.reason});
    }

export function replySuccess(resp: express.Response, data: any):
    // yes, `data` should  should be a nicely typed value but
    // how in the hell are we otherwise supposed to add a single field
    // without messing with the entire type hierarchy???
    // types.Keyed already messes enough with me
    Promise<void> {
      data.success = true;
      return reply(resp, 200, data);
    }

export function addInvalidVerbs(router: express.Router, ep: string):
    void {
      router.all(
          ep, (req: express.Request, res: express.Response): Promise<void> => {
            return replyError(res, errors.cookInvalidVerb(req));
          });
    }

export function logRequest(req: express.Request, next: express.NextFunction):
    void {
      console.log(req.method + " " + req.url);
      next();
    }

export async function respOrError(res: express.Response,
                                  prom: Promise<types.ApiResponse>) {
  return prom
      .then((data: types.ApiResponse):
                Promise<void> => {
                  if (data instanceof types.ApiError)
                    return replyError(res, data as types.ApiError)
                    else return replySuccess(res, data as typeof data);
                })
      .catch((error: any): Promise<void> => {
        console.log(error);
        return replyError(res, errors.cookServerError())
      });
}

export async function redirect(res: express.Response, url: string):
    Promise<void> {
      res.status(303);
      res.header({'Location' : url});
      res.send();
      return Promise.resolve();
    }

export async function checkSessionKey(req: express.Request):
    Promise<express.Request> {
      if ("sessionkey" in req.body) {
        // TODO validate session key
        return Promise.resolve(req);
      }
      console.log("Session key requested - none given.");
      return Promise.reject();
    }

export async function isAdmin(req: express.Request):
    Promise<express.Request> {
      return checkSessionKey(req).then((rq) => {
        // we know sessionkey is available and valid
        // TODO do logic with sessionkey to check if the associated user is an
        // admin if not: return Promise.reject();
        return Promise.resolve(rq);
      })
    }

export async function refreshKey(key: types.SessionKey):
    Promise<types.SessionKey> {
      // TODO update key
      return Promise.resolve(key);
    }

export async function refreshAndInjectKey<T extends types.Keyed>(
    key: types.SessionKey, response: T): Promise<T> {
  return refreshKey(key).then((newkey: types.SessionKey): Promise<T> => {
    response.sessionkey = newkey;
    return Promise.resolve(response);
  });
}

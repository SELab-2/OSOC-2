import express from 'express';

import * as config from './config.json';
// import * as types from './types';
import {ApiError, Errors, InternalTypes, Responses} from './types';

export const errors: Errors = {
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

export function replyError(resp: express.Response, error: ApiError):
    Promise<void> {
      return reply(resp, error.http, {success : false, reason : error.reason});
    }

export function replySuccess(resp: express.Response, data: any):
    // yes, `data` should  should be a nicely typed value but
    // how in the hell are we otherwise supposed to add a single field
    // without messing with the entire type hierarchy???
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

export async function respOrErrorNoReinject(
    res: express.Response, prom: Promise<Responses.ApiResponse>):
    Promise<void> {
      const isError =
          (err: any): boolean => { return 'http' in err && 'reason' in err };

      return prom
          .then((data: Responses.ApiResponse): Promise<void> =>
                    replySuccess(res, data as typeof data))
          .catch((err: any): Promise<void> => {
            if (isError(err))
              return replyError(res, err);
            console.log("UNCAUGHT ERROR " + JSON.stringify(err));
            return replyError(res, errors.cookServerError());
          });
    }

export async function respOrError<T>(
    res: express.Response,
    prom: Promise<Responses.ApiResponse&Responses.Keyed<T>>): Promise<void> {
  return respOrErrorNoReinject(
      res, prom.then((res) => refreshAndInjectKey(res.sessionkey, res)));
}

export async function redirect(res: express.Response,
                               url: string): Promise<void> {
  res.status(303);
  res.header({'Location' : url});
  res.send();
  return Promise.resolve();
}

export async function checkSessionKey(req: express.Request):
    Promise<express.Request> {
  if ("sessionkey" in req.body) {
    // TODO validate session key
    // upon validation error:
    // return Promise.reject(errors.cookUnauthenticated());
    return Promise.resolve(req);
  }
  console.log("Session key requested - none given.");
  return Promise.reject();
}

export async function isAdmin(req: express.Request): Promise<express.Request> {
  return checkSessionKey(req).then((rq) => {
    // we know sessionkey is available and valid
    // TODO do logic with sessionkey to check if the associated user is an
    // admin if not: return Promise.reject(errors.cookInsufficientRights());
    return Promise.resolve(rq);
  })
}

export async function refreshKey(key: InternalTypes.SessionKey):
    Promise<InternalTypes.SessionKey> {
  // TODO update key
  return Promise.resolve(key);
}

export async function refreshAndInjectKey<T>(key: InternalTypes.SessionKey,
                                             response: Responses.Keyed<T>):
    Promise<Responses.Keyed<T>> {
  return refreshKey(key).then(
      (newkey: InternalTypes.SessionKey): Promise<Responses.Keyed<T>> => {
        response.sessionkey = newkey;
        return Promise.resolve(response);
      });
}

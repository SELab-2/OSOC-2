import {createHash, randomBytes} from 'crypto';
import express from 'express';
import {v1} from 'uuid';

import * as config from './config.json';
import {searchAllAdminLoginUsers} from './orm_functions/login_user';
import * as ormPr from './orm_functions/project';
import * as skey from './orm_functions/session_key';
import * as ormSt from './orm_functions/student';
import {
  Anything,
  ApiError,
  Errors,
  InternalTypes,
  Requests,
  Responses,
  RouteCallback,
  Table,
  Verb,
  WithUserID
} from './types';

/**
 *  The API error cooking functions. HTTP error codes are loaded from
 * config.json.
 */
export const errors: Errors = {
  cookInvalidID() { return config.apiErrors.invalidID;},
  cookArgumentError() { return config.apiErrors.argumentError;},
  cookUnauthenticated() { return config.apiErrors.unauthenticated;},
  cookInsufficientRights() { return config.apiErrors.insufficientRights;},

  cookNonExistent(url: string) {
    return {
      http : config.apiErrors.nonExistent.http,
      reason : config.apiErrors.nonExistent.reason.replace(/~url/, url)
    };
  },

  cookInvalidVerb(req: express.Request) {
    return {
      http : config.apiErrors.invalidVerb.http,
      reason : config.apiErrors.invalidVerb.reason.replace(/~verb/, req.method)
                   .replace(/~url/, req.url)
    };
  },

  cookNonJSON(mime: string) {
    return {
      http : config.apiErrors.nonJSONRequest.http,
      reason : config.apiErrors.nonJSONRequest.reason.replace(/~mime/, mime)
    };
  },

  cookServerError() { return config.apiErrors.serverError;}
}

/**
 *  Extracts the session key from the request headers.
 *  @param req The request to extract the session key from.
 *  @throws Error if there is no session key.
 *  @returns The extracted session key.
 *  @see hasFields.
 */
export function getSessionKey(req: express.Request):
    string {
      const authHeader = req.headers.authorization;
      if (authHeader == undefined ||
          !authHeader.startsWith(config.global.authScheme)) {
        throw Error(
            'No session key - you should check for the session key first.');
      }
      return authHeader.replace(config.global.authScheme + " ", "");
    }

/**
 *  Promise-based debugging function. Logs the data, then passes it through
 * (using `Promise.resolve`).
 *
 *  @param data The data to log and pass through.
 *  @returns A `Promise<typeof data>` resolving with the given data.
 */
export function debug(data: unknown):
    Promise<typeof data> {
      console.log(data);
      return Promise.resolve(data);
    }

/**
 *  Finishes a promise chain by sending a response.
 *  @param resp The Express.js response.
 *  @param status The HTTP status.
 *  @param data The data object to send.
 *  @returns An empty promise (`Promise<void>`).
 */
export function reply(resp: express.Response, status: number, data: unknown):
    Promise<void> {
      resp.status(status).send(data);
      return Promise.resolve();
    }

/**
 *  Replies to a request with an error. Wrapper for {@link reply}.
 *  @param resp The Express.js response.
 *  @param error The API error to send.
 *  @returns An empty promise (`Promise<void>`).
 */
export function replyError(resp: express.Response, error: ApiError):
    Promise<void> {
      return reply(resp, error.http, {success : false, reason : error.reason});
    }

/**
 *  Replies to a request with a success response. Wrapper for {@link reply}.
 *  @param resp The Express.js response.
 *  @param data The data to send.
 *  @returns An empty promise (`Promise<void>`).
 */
export function replySuccess(resp: express.Response, data: unknown):
    // yes, `data` should  should be a nicely typed value but
    // how in the hell are we otherwise supposed to add a single field
    // without messing with the entire type hierarchy???
    Promise<void> {
      const _data = data as Anything;
      _data.success = true;
      return reply(resp, 200, data);
    }

/**
 *  Adds an Invalid HTTP Verb response to this endpoint. Each HTTP verb that
 * hasn't come before will receive this error.
 *
 *  @param router The Express.js router to install the route on.
 *  @param ep The endpoint (partial) URL to add the verbs to.
 */
export function addInvalidVerbs(router: express.Router, ep: string):
    void {
      router.all(
          ep, (req: express.Request, res: express.Response): Promise<void> => {
            return replyError(res, errors.cookInvalidVerb(req));
          });
    }

/**
 *  Adds Invalid HTTP Verb responses to each endpoint in the list.
 */
export function addAllInvalidVerbs(router: express.Router, eps: string[]):
    void { eps.forEach(ep => addInvalidVerbs(router, ep));}

/**
 *  Logs the given request, then passes priority to the next Express.js
 * callback.
 *
 *  @param req The request to log.
 *  @param next The next callback.
 */
export function logRequest(req: express.Request, next: express.NextFunction):
    void {
      console.log(req.method + " " + req.url);
      next();
    }

/**
 *  Finalizes the promise chain by sending a success response (using
 * `Promise.then`) or an  API error (using `Promise.catch`). No data fields are
 * updated. Wrapper around both {@link replySuccess} and {@link replyError}.
 * Use {@link respOrError} to modify the session key and then finalize the
 * promise chain.
 *
 *  @param res The Express.js response to send.
 *  @param prom The promise with the data or error.
 *  @returns An empty promise (`Promise<void>`).
 */
export async function respOrErrorNoReinject(
    res: express.Response, prom: Promise<Responses.ApiResponse>):
    Promise<void> {
      const isError = (err: Anything): boolean => {
        return err != undefined && 'http' in err && 'reason' in err
      };

      return prom
          .then(data => {
            console.log(data);
            return Promise.resolve(data);
          })
          .then((data: Responses.ApiResponse): Promise<void> =>
                    replySuccess(res, data as typeof data))
          .catch((err: unknown): Promise<void> => {
            console.log(err);
            if (isError(err as Anything))
              return replyError(res, err as ApiError);
            console.log("UNCAUGHT ERROR " + JSON.stringify(err));
            return replyError(res, errors.cookServerError());
          });
    }

/**
 *  Finalizes the promise chain by attempting to refresh the session key in the
 * data, then  calling {@link respOrErrorNoReinject} to send the data.
 *
 *  @template T The data type of the response. Only the {@link Responses.Keyed}
 * version will be used.
 *  @param req The Express.js request holding the old session key.
 *  @param res The Express.js response to send.
 *  @param prom The promise with the data or error (should be an API response
 * that's Keyed).
 *  @returns An empty promise (`Promise<void>`).
 */
export async function respOrError<T>(
    req: express.Request, res: express.Response,
    prom: Promise<Responses.ApiResponse&Responses.Keyed<T>>): Promise<void> {
  return respOrErrorNoReinject(
      res, prom.then((res) => refreshAndInjectKey(getSessionKey(req), res)));
}

/**
 *  Responds with an HTTP 300 redirect.
 *  @param res The Express.js response to send.
 *  @param url The URL to redirect to. Can be either relative (to the server) or
 * absolute.
 *  @returns An empty promise (`Promise<void>`).
 */
export async function redirect(res: express.Response,
                               url: string): Promise<void> {
  res.status(303);
  res.header({'Location' : url});
  res.send();
  return Promise.resolve();
}

/**
 *  Checks the existence and correctness of the session key.
 *  @param obj The object which could hold a session key.
 *  @template T The type of the object. Should hold a session key.
 *  @returns A promise which will resolve with the object upon success, or to
 * an Unauthenticated Request API error upon failure (either the session key is
 * not present, or it's not correct).
 */
export async function checkSessionKey<T extends Requests.KeyRequest>(obj: T):
    Promise<WithUserID<T>> {
  return skey.checkSessionKey(obj.sessionkey)
      .then((uid) => Promise.resolve({data : obj, userId : uid.login_user_id}))
      .catch(() => Promise.reject(errors.cookUnauthenticated()));
}

/**
 *  Checks the session key (see {@link checkSessionKey}), then checks whether or
 * not it corresponds to an admin user.
 *
 *  @param obj The object which could hold a session key.
 *  @template T The type of the object. Should hold a session key.
 *  @returns A promise which will resolve with the object upon success. If the
 * session key is not present or invalid, returns a promise which rejects with
 * an Unauthenticated API error. If the session key corresponds to a non-admin
 * user, returns a promise rejecting with an Unauthorized API error.
 */
export async function isAdmin<T extends Requests.KeyRequest>(obj: T):
    Promise<WithUserID<T>> {
  return checkSessionKey(obj)
      .catch(() => Promise.reject(errors.cookUnauthenticated()))
      .then(
          async id =>
              searchAllAdminLoginUsers(true)
                  .catch(() => Promise.reject(errors.cookInsufficientRights()))
                  .then(admins => admins.some(a => a.login_user_id == id.userId)
                                      ? Promise.resolve(id)
                                      : Promise.reject(
                                            errors.cookInsufficientRights())));
}

/**
 *  Generates a new session key.
 *  @returns The newly generated session key.
 */
export function generateKey(): InternalTypes.SessionKey {
  return createHash('sha256')
      .update(v1())
      .update(randomBytes(256))
      .digest("hex");
}

/**
 *  Generates a new session key for the user associated with the given key.
 *  @param key The old key.
 *  @returns A promise resolving to the new key.
 */
export async function refreshKey(key: InternalTypes.SessionKey):
    Promise<InternalTypes.SessionKey> {
  return skey.changeSessionKey(key, generateKey())
      .then(upd => Promise.resolve(upd.session_key));
}

/**
 *  Generates a new key and injects it in the response data; used by
 * {@link respOrError} (which is the preferred way to use this function).
 *
 *  @template T The data type for the response data (the response itself is the
 * Keyed version of this type).
 *  @param key The old key.
 *  @param response The response to inject the new key into.
 *  @returns A promise resolving to the updated response.
 */
export async function refreshAndInjectKey<T>(key: InternalTypes.SessionKey,
                                             response: Responses.Keyed<T>):
    Promise<Responses.Keyed<T>> {
  return refreshKey(key).then(
      (newkey: InternalTypes.SessionKey): Promise<Responses.Keyed<T>> => {
        response.sessionkey = newkey;
        return Promise.resolve(response);
      });
}

/**
 *  Contains all boilerplate for installing a route with a path and HTTP verb on
 * a router. Requests that match the route will be responded to by the provided
 * callback function, then their api session key will be refreshed an
 * reinjected. Not viable for some endpoints (logout, login, ...).
 *
 *  @template T The type of data to be send back. This type will be Keyed.
 *  @param router The router to install to.
 *  @param verb The HTTP verb.
 *  @param path The (relative) route path.
 *  @param callback The function which will respond.
 */
export function route<T extends Responses.ApiResponse>(
    router: express.Router, verb: Verb, path: string,
    callback: RouteCallback<Responses.Keyed<T>>): void {
  router[verb](path, (req: express.Request, res: express.Response) =>
                         respOrError(req, res, callback(req)));
}

/**
 *  Contains all boilerplate to install a route with a path and HTTP verb for a
 * route that returns only an updated session key.
 *  @param router The router to install to.
 *  @param verb The HTTP verb.
 *  @param path The (relative) route path.
 *  @param callback The function which will respond.
 */
export function routeKeyOnly(router: express.Router, verb: Verb, path: string,
                             callback: RouteCallback<Responses.Key>) {
  router[verb](
      path,
      (req: express.Request, res: express.Response) => respOrErrorNoReinject(
          res, callback(req)
                   .then(toupd => refreshKey(toupd.sessionkey))
                   .then(upd => Promise.resolve({sessionkey : upd}))));
}

/**
 *  Checks whether the object contains a valid ID.
 */
export async function isValidID<T extends Requests.IdRequest>(
    obj: T, table: Table): Promise<T> {
  const returnObj: {[key in Table]: boolean} = {
    "student" : await ormSt.getStudent(obj.id) != null,
    "project" : await ormPr.getProjectById(obj.id) != null
  };

  return table in returnObj && returnObj[table] != null
             ? Promise.resolve(obj)
             : Promise.reject(errors.cookInvalidID());
}

/**
 *  Sets up the redirection response (for the `/<endpoint>` requests). Uses the
 * preferred home from the config file.
 */
export function setupRedirect(router: express.Router, ep: string): void {
  router.get('/',
             (_, res) => redirect(res, config.global.preferred + ep + "/all"));
}

/**
 *  Returns the given value if not null, otherwise, return the defualt value.
 *  @template T The type of the value
 *  @param vl The value (or null)
 *  @param def The default value
 *  @returns The default if the value is null, otherwise the value itself.
 */
export function getOrDefault<T>(vl: T|null|undefined, def: T): T {
  if (vl == null || vl == undefined)
    return def;
  return vl;
}

import express from 'express';

import {InternalTypes, Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to list all admins in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listAdmins(req: express.Request):
    Promise<Responses.IdNameList> {
    return util.checkSessionKey(req).then((_: express.Request) => {
        let admins: InternalTypes.IdName[] = [];
        // TODO list all admins

        return Promise.resolve({data : admins, sessionkey : ''});
    });
}

/**
 *  Attempts to get all data for a certain admin in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getAdmin(req: express.Request):
    Promise<Responses.Admin>{return util.checkSessionKey(req).then(
    async (_) => {// check valid id
        // if invalid: return Promise.reject(util.cookInvalidID())
        // if valid: get admin data etc etc
        return Promise.resolve({
            data : {id : '', name : '', email : ''},
            sessionkey : ''
        })})}

async function modAdmin(req: express.Request):
    Promise<Responses.Keyed<string>> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify admin data
        return Promise.resolve({
            data : '',
            sessionkey : ''
        });
    });
}

/**
 *  Attempts to delete an admin from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteAdmin(req: express.Request):
    Promise<Responses.Key> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: delete admin data
        return Promise.resolve({sessionkey : ''});
    });
}

/**
 *  Gets the router for all `/admin/` related endpoints.
 *  @returns An Epress.js {@link express.Router} routing all `/admin/`
 * endpoints.
 */
export function getRouter(): express.Router {
    let router: express.Router = express.Router();

    router.get("/", (_, res) => util.redirect(res, "/admin/all"));
    util.route(router, "get", "/all", listAdmins);
    util.route(router, "get", "/:id", getAdmin);

    util.route(router, "post", "/:id", modAdmin);
    router.delete('/:id',
        (req, res) => util.respOrErrorNoReinject(res, deleteAdmin(req)));

    util.addAllInvalidVerbs(router, [ "/", "/all", "/:id" ]);

    return router;
}
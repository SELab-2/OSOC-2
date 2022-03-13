import express from 'express';

import {InternalTypes, Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to list all coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listCoaches(req: express.Request):
    Promise<Responses.IdNameList> {
    return util.checkSessionKey(req).then((_: express.Request) => {
        let coaches: InternalTypes.IdName[] = [];
        // TODO list all coaches

        return Promise.resolve({data : coaches, sessionkey : ''});
    });
}

/**
 *  Attempts to get all data for a certain coach in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoach(req: express.Request):
    Promise<Responses.Coach>{return util.checkSessionKey(req).then(
    async (_) => {// check valid id
        // if invalid: return Promise.reject(util.cookInvalidID())
        // if valid: get coach data etc etc
        return Promise.resolve({
            data : {id : '', name : '', email : '', projectid : ''},
            sessionkey : ''
        })})}

async function modCoach(req: express.Request):
    Promise<Responses.Keyed<string>> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify coach data
        return Promise.resolve({
            data : '',
            sessionkey : ''
        });
    });
}

/**
 *  Attempts to delete a coach from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteCoach(req: express.Request):
    Promise<Responses.Key> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: delete coach data
        return Promise.resolve({sessionkey : ''});
    });
}

/**
 *  Attempts to get all data for the requests of coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoachRequests(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.CoachRequest[]>>{return util.checkSessionKey(req).then(
    async (_) => {
        let coachRequests: InternalTypes.CoachRequest[] = [];
        return Promise.resolve({
            data : coachRequests,
            sessionkey : ''
        })})}

/**
 *  Attempts to create a new student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createCoachRequest(req: express.Request):
    Promise<Responses.Keyed<string>> {
    return util.checkSessionKey(req).then((_: express.Request) => {
        let id: string = '';
        // TODO do insertion logic

        return Promise.resolve({data : id, sessionkey : ''});
    });
}

/**
 *  Attempts to get the details of a coach request in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoachRequest(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.CoachRequest>>{return util.checkSessionKey(req).then(
    async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: get request details
        return Promise.resolve({
            data : {id : '', name : '', email : ''},
            sessionkey : ''
        })})}

/**
 *  Attempts to accept a request for becoming a coach.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createCoachAcceptance(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.IdName>>{return util.checkSessionKey(req).then(
    async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: create coach acceptance request
        return Promise.resolve({
            data : {id : '', name : ''},
            sessionkey : ''
        })})}

/**
 *  Attempts to deny a request for becoming a coach.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteCoachRequest(req: express.Request):
    Promise<Responses.Key>{return util.checkSessionKey(req).then(
    async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: deny request for becoming a coach
        return Promise.resolve({
            sessionkey : ''
        })})}

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
    let router: express.Router = express.Router();

    router.get("/", (_, res) => util.redirect(res, "/coach/all"));
    util.route(router, "get", "/all", listCoaches);
    util.route(router, "get", "/:id", getCoach);

    util.route(router, "post", "/:id", modCoach);
    router.delete('/:id',
        (req, res) => util.respOrErrorNoReinject(res, deleteCoach(req)));

    util.route(router, "get", "/request", getCoachRequests);
    util.route(router, "post", "/request", createCoachRequest);
    util.route(router, "get", "/request/:id", getCoachRequest);

    util.route(router, "post", "/request/:id", createCoachAcceptance);
    router.delete('/request/:id',
        (req, res) => util.respOrErrorNoReinject(res, deleteCoachRequest(req)));

    util.addAllInvalidVerbs(router, [ "/", "/all", "/:id", "/request", "/request/:id" ]);

    return router;
}
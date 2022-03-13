import express from 'express';

import {InternalTypes, Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createProject(req: express.Request):
    Promise<Responses.Keyed<string>> {
    return util.checkSessionKey(req).then((_: express.Request) => {
        let id: string = '';
        // TODO do insertion logic

        return Promise.resolve({data : id, sessionkey : ''});
    });
}

/**
 *  Attempts to list all projects in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listProjects(req: express.Request):
    Promise<Responses.IdNameList> {
    return util.checkSessionKey(req).then((_: express.Request) => {
        let projects: InternalTypes.IdName[] = [];
        // TODO list all projects

        return Promise.resolve({data : projects, sessionkey : ''});
    });
}

/**
 *  Attempts to get all data for a certain project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getProject(req: express.Request):
    Promise<Responses.Project>{return util.checkSessionKey(req).then(
    async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID())
        // if valid: get project data etc etc
        let coachids : string[] = [];
        let roles : string[] = [];
        let students : InternalTypes.Student[] = [];
        return Promise.resolve({
            data : {id : '', name : '', partner : '', deadline : '', coaches : coachids, roles : roles, drafted : students, studentsRequired : 0},
            sessionkey : ''
        })})}

async function modProject(req: express.Request):
    Promise<Responses.Keyed<string>> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify project data
        return Promise.resolve({
            data : '',
            sessionkey : ''
        });
    });
}

/**
 *  Attempts to delete a project from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteProject(req: express.Request):
    Promise<Responses.Key> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: delete project data
        return Promise.resolve({sessionkey : ''});
    });
}

/**
 *  Attempts to get all data for the requests of coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getDraftedStudents(req: express.Request):
    Promise<Responses.ProjectDraftedStudents>{return util.checkSessionKey(req).then(
    async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: get drafted students for this project
        let students: InternalTypes.Student[] = [];
        return Promise.resolve({
            data : {id : '', name : '', students: students},
            sessionkey : ''
        })})}

async function modProjectStudent(req: express.Request):
    Promise<Responses.ModProjectStudent> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify a student of this project
        let roles : string[] = [];
        return Promise.resolve({
            data : {drafted : true, roles : roles},
            sessionkey : ''
        });
    });
}

// TODO project conflicts
/*async function getProjectConflicts(req: express.Request):
    Promise<Responses.ModProjectStudent> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify a student of this project
        let roles : string[] = [];
        return Promise.resolve({
            data : {drafted : true, roles : roles},
            sessionkey : ''
        });
    });
}*/

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
    let router: express.Router = express.Router();

    router.get("/", (_, res) => util.redirect(res, "/project/all"));
    util.route(router, "get", "/all", listProjects);
    util.route(router, "post", "/:id", createProject);
    util.route(router, "get", "/:id", getProject);

    util.route(router, "post", "/:id", modProject);
    router.delete('/:id',
        (req, res) => util.respOrErrorNoReinject(res, deleteProject(req)));

    util.route(router, "get", "/:id/draft", getDraftedStudents);
    util.route(router, "post", "/:id/draft", modProjectStudent);
    // TODO project conflicts
    //util.route(router, "get", "/conflicts", getProjectConflicts);

    // TODO add project conflicts
    util.addAllInvalidVerbs(router, [ "/", "/all", "/:id", "/:id/draft", "/request/:id" ]);

    return router;
}
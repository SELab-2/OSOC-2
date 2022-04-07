import express from 'express';

import * as ormL from "../orm_functions/login_user";
import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';
import {errors} from '../utility';

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listUsers(req: express.Request): Promise<Responses.UserList> {
    const parsedRequest = await rq.parseUserAllRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID);
    }
    const loginUsers = await ormL.getAllLoginUsers();

    loginUsers.map(val => ({
        person_data : {
            id : val.person.person_id,
            name : val.person.firstname + " " + val.person.lastname
        },
        coach : val.is_coach,
        admin : val.is_admin,
        activated : val.account_status as string
    }))

    return Promise.resolve({data : loginUsers, sessionkey : checkedSessionKey.data.sessionkey});
}

/**
 *  Gets the router for all `/user/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/user/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, '/student');
    util.route(router, "get", "/all", listUsers);

    util.addAllInvalidVerbs(router, [ "/", "/all" ]);

    return router;
}

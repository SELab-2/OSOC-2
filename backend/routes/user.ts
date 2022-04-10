import express from 'express';

import * as ormL from "../orm_functions/login_user";
import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';
import {errors} from '../utility';
import * as ormP from "../orm_functions/person";
import * as ormLU from "../orm_functions/login_user";

import * as validator from 'validator';

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
            name : val.person.firstname,
            email: val.person.email
        },
        coach : val.is_coach,
        admin : val.is_admin,
        activated : val.account_status as string
    }))

    return Promise.resolve({data : loginUsers, sessionkey : checkedSessionKey.data.sessionkey});
}

/**
 *  Attempts to create a new user in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createUserRequest(req: express.Request):
    Promise<InternalTypes.IdOnly> {
    return rq.parseRequestUserRequest(req).then(async parsed => {
        if (parsed.pass == undefined) {
            console.log(" -> WARNING user request without password");
            return Promise.reject(util.errors.cookArgumentError());
        }
        return ormP
            .createPerson({
                firstname : parsed.firstName,
                lastname : parsed.lastName,
                email : validator.default.normalizeEmail(parsed.email).toString()
            })
            .then(person => {
                console.log("Created a person: " + person);
                return ormLU.createLoginUser({
                    personId : person.person_id,
                    password : parsed.pass,
                    isAdmin : false,
                    isCoach : true,
                    accountStatus : 'PENDING'
                })
            })
            .then(user => {
                console.log("Attached a login user: " + user);
                return Promise.resolve({id : user.login_user_id});
            });
    });
}

/**
 *  Gets the router for all `/user/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/user/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, '/user');
    util.route(router, "get", "/all", listUsers);

    router.post('/request', (req, res) => util.respOrErrorNoReinject(
        res, createUserRequest(req)));

    util.addAllInvalidVerbs(router, [ "/", "/all", "/request" ]);

    return router;
}

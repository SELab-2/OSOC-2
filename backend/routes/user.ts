import express from 'express';

import * as ormL from "../orm_functions/login_user";
import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';
import {errors} from '../utility';
import * as ormP from "../orm_functions/person";
import * as ormLU from "../orm_functions/login_user";

import * as validator from 'validator';
import {account_status_enum} from "@prisma/client";

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
            email: val.person.email,
            github: val.person.github
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
            })
            .catch(e => {
                if('code' in e && e.code == 'P2002') {
                    return Promise.reject({
                        http: 400,
                        reason: "Can't register the same email address twice."
                    });
                }
                return Promise.reject(e);
            });
    });
}

async function setAccountStatus(person_id: number, stat: account_status_enum,
                                key: string, is_admin: boolean, is_coach: boolean):
    Promise<Responses.Keyed<InternalTypes.IdName>> {
    return ormLU.searchLoginUserByPerson(person_id)
        .then(obj => obj == null ? Promise.reject(util.errors.cookInvalidID())
            : ormLU.updateLoginUser({
                loginUserId : obj.login_user_id,
                isAdmin : is_admin,
                isCoach : is_coach,
                accountStatus : stat
            }))
        .then(res => {
            console.log(res.person.firstname);
            return Promise.resolve({
            sessionkey : key,
            data : {
                id : res.person_id,
                name : res.person.firstname + " " + res.person.lastname
            }
        })});
}

/**
 *  Attempts to accept a request for becoming a login_user.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createUserAcceptance(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.IdName>> {
    return rq.parseAcceptNewUserRequest(req)
        .then(parsed => util.isAdmin(parsed))
        .then(async parsed => setAccountStatus(parsed.data.id, 'ACTIVATED',
            parsed.data.sessionkey, Boolean(parsed.data.is_admin), Boolean(parsed.data.is_coach)));
}

/**
 *  Attempts to deny a request for becoming a coach.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteUserRequest(req: express.Request):
    Promise<Responses.Key> {
    return rq.parseAcceptNewUserRequest(req)
        .then(parsed => util.isAdmin(parsed))
        .then(async parsed => setAccountStatus(parsed.data.id, 'DISABLED',
            parsed.data.sessionkey, Boolean(parsed.data.is_admin), Boolean(parsed.data.is_coach)));
}

/**
 *  Attempts to filter users in the system by name, role, alumni, student coach, status or email.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function filterUsers(req: express.Request): Promise<Responses.UserList> {
    const parsedRequest = await rq.parseFilterUsersRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const users = await ormLU.filterLoginUsers(
        checkedSessionKey.data.nameFilter, checkedSessionKey.data.emailFilter,
        checkedSessionKey.data.nameSort, checkedSessionKey.data.emailSort, checkedSessionKey.data.statusFilter,
        checkedSessionKey.data.isCoachFilter, checkedSessionKey.data.isAdminFilter
    );

    users.map(val => ({
        person_data : {
            id : val.person.person_id,
            name : val.person.firstname,
            email: val.person.email,
            github: val.person.github
        },
        coach : val.is_coach,
        admin : val.is_admin,
        activated : val.account_status as string
    }))

    return Promise.resolve({data : users, sessionkey : req.body.sessionkey});
}

/**
 *  Gets the router for all `/user/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/user/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, '/user');
    util.route(router, "get", "/filter", filterUsers);
    util.route(router, "get", "/all", listUsers);

    router.post('/request', (req, res) => util.respOrErrorNoReinject(
        res, createUserRequest(req)));

    util.route(router, "post", "/request/:id", createUserAcceptance);
    util.routeKeyOnly(router, "delete", "/request/:id", deleteUserRequest);

    util.addAllInvalidVerbs(router, [ "/", "/all", "/request", "/request/:id", "/filter" ]);

    return router;
}

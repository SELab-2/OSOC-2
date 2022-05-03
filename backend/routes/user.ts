import { account_status_enum } from "@prisma/client";
import express from "express";
import * as validator from "validator";

import * as ormLU from "../orm_functions/login_user";
import * as ormL from "../orm_functions/login_user";
import * as ormP from "../orm_functions/person";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import * as session_key from "./session_key.json";
import {
    addSessionKey,
    removeAllKeysForUser,
} from "../orm_functions/session_key";
import * as config from "../config.json";
import * as bcrypt from "bcrypt";

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listUsers(
    req: express.Request
): Promise<Responses.UserList> {
    const parsedRequest = await rq.parseUserAllRequest(req);
    const checkedSessionKey = await util
        .isAdmin(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }
    const loginUsers = await ormL.getAllLoginUsers();

    loginUsers.map((val) => ({
        person_data: {
            id: val.person.person_id,
            name: val.person.firstname,
            email: val.person.email,
            github: val.person.github,
        },
        coach: val.is_coach,
        admin: val.is_admin,
        activated: val.account_status as string,
    }));

    return Promise.resolve({
        data: loginUsers,
    });
}

/**
 *  Attempts to create a new user in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createUserRequest(
    req: express.Request
): Promise<Responses.Id> {
    const parsedRequest = await rq.parseRequestUserRequest(req);
    if (parsedRequest.pass == undefined) {
        console.log(" -> WARNING user request without password");
        return Promise.reject(util.errors.cookArgumentError());
    }

    const foundPerson = await ormP.searchPersonByLogin(
        validator.default.normalizeEmail(parsedRequest.email).toString()
    );

    let person;

    if (foundPerson.length !== 0) {
        const foundLoginUser = await ormLU.searchLoginUserByPerson(
            foundPerson[0].person_id
        );
        if (foundLoginUser !== null) {
            return Promise.reject({
                http: 400,
                reason: "Can't register the same email address twice.",
            });
        }

        person = await ormP.updatePerson({
            personId: foundPerson[0].person_id,
            firstname: parsedRequest.firstName,
            lastname: "",
        });
    } else {
        person = await ormP.createPerson({
            firstname: parsedRequest.firstName,
            lastname: "",
            email: validator.default
                .normalizeEmail(parsedRequest.email)
                .toString(),
        });
    }

    const hash = await bcrypt.hash(
        parsedRequest.pass,
        config.encryption.encryptionRounds
    );

    const loginUser = await ormLU.createLoginUser({
        personId: person.person_id,
        password: hash,
        isAdmin: false,
        isCoach: true,
        accountStatus: "PENDING",
    });

    const key: string = util.generateKey();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + session_key.valid_period);
    const addedKey = await addSessionKey(
        loginUser.login_user_id,
        key,
        futureDate
    );

    console.log("Attached a login user: " + loginUser);
    return Promise.resolve({
        id: addedKey.login_user_id,
        sessionkey: addedKey.session_key,
    });
}

export async function setAccountStatus(
    person_id: number,
    stat: account_status_enum,
    key: string,
    is_admin: boolean,
    is_coach: boolean
): Promise<Responses.PartialUser> {
    return ormLU
        .searchLoginUserByPerson(person_id)
        .then((obj) =>
            obj == null
                ? Promise.reject(util.errors.cookInvalidID())
                : ormLU.updateLoginUser({
                      loginUserId: obj.login_user_id,
                      isAdmin: is_admin,
                      isCoach: is_coach,
                      accountStatus: stat,
                  })
        )
        .then((res) => {
            console.log(res.person.firstname);
            return Promise.resolve({
                id: res.person_id,
                name: res.person.firstname + " " + res.person.lastname,
            });
        });
}

/**
 *  Attempts to accept a request for becoming a login_user.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createUserAcceptance(
    req: express.Request
): Promise<Responses.PartialUser> {
    return rq
        .parseAcceptNewUserRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.mutable(parsed, parsed.data.id))
        .then(async (parsed) => {
            return ormL
                .searchLoginUserByPerson(parsed.data.id)
                .then((logUs) => {
                    if (
                        logUs !== null &&
                        logUs.account_status === account_status_enum.PENDING
                    ) {
                        return setAccountStatus(
                            parsed.data.id,
                            "ACTIVATED",
                            parsed.data.sessionkey,
                            parsed.data.is_admin
                                .toString()
                                .toLowerCase()
                                .trim() === "true",
                            parsed.data.is_coach
                                .toString()
                                .toLowerCase()
                                .trim() === "true"
                        );
                    }
                    return Promise.reject(errors.cookInvalidID());
                });
        });
}

/**
 *  Attempts to deny a request for becoming a coach.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteUserRequest(
    req: express.Request
): Promise<Responses.PartialUser> {
    return rq
        .parseAcceptNewUserRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.mutable(parsed, parsed.data.id))
        .then(async (parsed) => {
            return ormL
                .searchLoginUserByPerson(parsed.data.id)
                .then((logUs) => {
                    if (
                        logUs !== null &&
                        logUs.account_status === account_status_enum.PENDING
                    ) {
                        return setAccountStatus(
                            parsed.data.id,
                            "DISABLED",
                            parsed.data.sessionkey,
                            parsed.data.is_admin
                                .toString()
                                .toLowerCase()
                                .trim() === "true",
                            parsed.data.is_coach
                                .toString()
                                .toLowerCase()
                                .trim() === "true"
                        );
                    }
                    return Promise.reject(errors.cookInvalidID());
                });
        });
}

/**
 *  Attempts to filter users in the system by name, email, status, coach or
 * admin.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function filterUsers(
    req: express.Request
): Promise<Responses.UserList> {
    return rq
        .parseFilterUsersRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormLU
                .filterLoginUsers(
                    parsed.data.nameFilter,
                    parsed.data.emailFilter,
                    parsed.data.nameSort,
                    parsed.data.emailSort,
                    parsed.data.statusFilter,
                    parsed.data.isCoachFilter,
                    parsed.data.isAdminFilter
                )
                .then((users) => {
                    users.map((val) => ({
                        person_data: {
                            id: val.person.person_id,
                            name: val.person.firstname,
                            email: val.person.email,
                            github: val.person.github,
                        },
                        coach: val.is_coach,
                        admin: val.is_admin,
                        activated: val.account_status as string,
                    }));
                    return Promise.resolve({ data: users });
                });
        });
}

function setSessionKey(req: express.Request, key: string): void {
    req.headers.authorization = config.global.authScheme + " " + key;
}

export async function userModSelf(
    req: express.Request
): Promise<Responses.Key> {
    return rq
        .parseUserModSelfRequest(req)
        .then((parsed) => util.checkSessionKey(parsed, false))
        .then((checked) => {
            return ormLU
                .getLoginUserById(checked.userId)
                .then((user) => util.getOrReject(user))
                .then(async (user) => {
                    // only change the password if an old and new password is given
                    let valid = true;
                    if (
                        checked.data.pass !== null &&
                        checked.data.pass !== undefined &&
                        user.password
                    ) {
                        valid = await bcrypt.compare(
                            checked.data.pass?.oldpass,
                            user.password
                        );
                    }
                    // the old password to compare to was not as expected => return error
                    if (!valid) {
                        return Promise.reject();
                    }
                    return Promise.resolve(user);
                })
                .then(async (user) => {
                    if (
                        checked.data.pass !== null &&
                        checked.data.pass !== undefined
                    ) {
                        if (
                            checked.data.pass.oldpass !== undefined &&
                            checked.data.pass.oldpass !== null &&
                            checked.data.pass.newpass === undefined &&
                            checked.data.pass.newpass === null
                        ) {
                            return Promise.reject(errors.cookArgumentError());
                        }
                        return ormLU.updateLoginUser({
                            loginUserId: checked.userId,
                            accountStatus: user.account_status,
                            password: await bcrypt.hash(
                                checked.data.pass?.newpass,
                                config.encryption.encryptionRounds
                            ),
                        });
                    }
                    return Promise.resolve(user);
                })
                .then((user) => Promise.resolve(user.person))
                .then((person) => {
                    if (checked.data.name != undefined) {
                        return ormP
                            .updatePerson({
                                personId: person.person_id,
                                firstname: checked.data.name,
                            })
                            .then(() => Promise.resolve());
                    }
                    return Promise.resolve();
                })
                .then(() => Promise.resolve(checked));
        })
        .then((checked) => {
            if (checked.data.pass == undefined) {
                return Promise.resolve({ sessionkey: checked.data.sessionkey });
            }
            return removeAllKeysForUser(checked.data.sessionkey)
                .then(() => {
                    const key = util.generateKey();
                    const time = new Date(Date.now());
                    time.setDate(time.getDate() + session_key.valid_period);
                    return addSessionKey(checked.userId, key, time);
                })
                .then((v) => {
                    setSessionKey(req, v.session_key);
                    return v;
                })
                .then((v) => Promise.resolve({ sessionkey: v.session_key }));
        });
}

/**
 *  Attempts to get all data for a certain student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getCurrentUser(
    req: express.Request
): Promise<Responses.User> {
    const parsedRequest = await rq.parseCurrentUserRequest(req);

    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const login_user = await ormL
        .getLoginUserById(checkedSessionKey.userId)
        .then((obj) => util.getOrReject(obj));
    login_user.password = null;

    return Promise.resolve({
        data: {
            login_user: login_user,
        },
        sessionkey: checkedSessionKey.data.sessionkey,
    }).then((obj) => {
        console.log(JSON.stringify(obj));
        return Promise.resolve(obj);
    });
}
/**
 *  Gets the router for all `/user/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/user/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/user");
    util.route(router, "get", "/filter", filterUsers);
    util.route(router, "get", "/all", listUsers);

    util.route(router, "get", "/self", getCurrentUser);
    util.route(router, "post", "/self", userModSelf);

    router.post("/request", (req, res) =>
        util.respOrErrorNoReinject(res, createUserRequest(req))
    );

    util.route(router, "post", "/request/:id", createUserAcceptance);
    util.route(router, "delete", "/request/:id", deleteUserRequest);

    util.addAllInvalidVerbs(router, [
        "/",
        "/all",
        "/request",
        "/request/:id",
        "/filter",
        "/self",
    ]);

    return router;
}

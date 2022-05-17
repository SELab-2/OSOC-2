import { account_status_enum } from "@prisma/client";
import * as prisma from "@prisma/client";
import express from "express";
import * as validator from "validator";

import * as ormLU from "../orm_functions/login_user";
import * as ormP from "../orm_functions/person";
import * as rq from "../request";
import { AccountStatus, Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import * as session_key from "./session_key.json";
import {
    addSessionKey,
    removeAllKeysForUser,
} from "../orm_functions/session_key";
import * as config from "../config.json";
import * as bcrypt from "bcrypt";
import * as ormLuOs from "../orm_functions/login_user_osoc";

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
    await util.isAdmin(parsedRequest);
    // const loginUsers = await ormL.getAllLoginUsers();
    const loginUsers = await ormLU.filterLoginUsers({
        currentPage: parsedRequest.currentPage,
        pageSize: parsedRequest.pageSize,
    });

    const updated = loginUsers.data.map((val) => ({
        person: {
            person_id: val.person.person_id,
            name: val.person.name,
            email: val.person.email === null ? "" : val.person.email,
            github: val.person.github === null ? "" : val.person.github,
        },
        is_coach: val.is_coach,
        is_admin: val.is_admin,
        account_status: val.account_status as AccountStatus,
        login_user_id: val.login_user_id,
    }));

    return Promise.resolve({
        pagination: loginUsers.pagination,
        data: updated,
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

    const foundPerson = await ormP.searchPersonByLogin(
        validator.default.normalizeEmail(parsedRequest.email).toString()
    );

    let person: prisma.person;

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
            name: parsedRequest.name,
        });
    } else {
        person = await ormP.createPerson({
            name: parsedRequest.name,
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
    const futureDate = new Date(Date.now());
    futureDate.setDate(futureDate.getDate() + session_key.valid_period);
    const addedKey = await addSessionKey(
        loginUser.login_user_id,
        key,
        futureDate
    );

    return Promise.resolve({
        id: addedKey.login_user_id,
        sessionkey: addedKey.session_key,
    });
}

export async function setAccountStatus(
    person_id: number,
    stat: account_status_enum,
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
            return Promise.resolve({
                id: res.person_id,
                name: res.person.name,
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
            return ormLU
                .searchLoginUserByPerson(parsed.data.id)
                .then((logUs) => {
                    if (
                        logUs !== null &&
                        logUs.account_status === account_status_enum.PENDING
                    ) {
                        return setAccountStatus(
                            parsed.data.id,
                            "ACTIVATED",
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
            return ormLU
                .searchLoginUserByPerson(parsed.data.id)
                .then((logUs) => {
                    if (
                        logUs !== null &&
                        logUs.account_status === account_status_enum.PENDING
                    ) {
                        return setAccountStatus(
                            parsed.data.id,
                            "DISABLED",
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
                    {
                        currentPage: parsed.data.currentPage,
                        pageSize: parsed.data.pageSize,
                    },
                    parsed.data.nameFilter,
                    parsed.data.emailFilter,
                    parsed.data.nameSort,
                    parsed.data.emailSort,
                    parsed.data.statusFilter,
                    parsed.data.isCoachFilter,
                    parsed.data.isAdminFilter
                )
                .then((users) => {
                    const udat = users.data.map((val) => ({
                        person: {
                            person_id: val.person.person_id,
                            name: val.person.name,
                            email:
                                val.person.email === null
                                    ? ""
                                    : val.person.email,
                            github:
                                val.person.github === null
                                    ? ""
                                    : val.person.github,
                        },
                        is_coach: val.is_coach,
                        is_admin: val.is_admin,
                        account_status: val.account_status as AccountStatus,
                        login_user_id: val.login_user_id,
                    }));
                    return Promise.resolve({
                        data: udat,
                        pagination: users.pagination,
                    });
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
        .then(async (checked) => {
            return ormLU
                .getLoginUserById(checked.userId)
                .then((user) => util.getOrReject(user))
                .then(async (user) => {
                    // only change the password if an old and new password is given
                    let valid = true;
                    if (
                        checked.data.pass !== null &&
                        checked.data.pass !== undefined &&
                        user.password !== null
                    ) {
                        valid = await bcrypt.compare(
                            checked.data.pass?.oldpass,
                            user.password
                        );
                    }
                    // the old password to compare to was not as expected => return error
                    if (!valid) {
                        return Promise.reject({
                            http: 409,
                            reason: "Old password is incorrect. Didn't update password.",
                        });
                    }
                    return Promise.resolve(user);
                })
                .then(async (user) => {
                    if (
                        checked.data.pass !== null &&
                        checked.data.pass !== undefined &&
                        checked.data.pass.oldpass !== null &&
                        checked.data.pass.oldpass !== undefined &&
                        checked.data.pass.newpass !== null &&
                        checked.data.pass.newpass !== undefined
                    ) {
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
                .then(async (person) => {
                    if (checked.data.name != undefined) {
                        return ormP
                            .updatePerson({
                                personId: person.person_id,
                                name: checked.data.name,
                            })
                            .then(() => Promise.resolve());
                    }
                    return Promise.resolve();
                })
                .then(() => Promise.resolve(checked));
        })
        .then(async (checked) => {
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

    const checkedSessionKey = await util.checkSessionKey(parsedRequest);

    const login_user = await ormLU
        .getLoginUserById(checkedSessionKey.userId)
        .then((obj) => util.getOrReject(obj));

    const user = {
        person: {
            person_id: login_user.person.person_id,
            name: login_user.person.name,
            email:
                login_user.person.email === null ? "" : login_user.person.email,
            github:
                login_user.person.github === null
                    ? ""
                    : login_user.person.github,
        },
        is_coach: login_user.is_coach,
        is_admin: login_user.is_admin,
        account_status: login_user.account_status as AccountStatus,
        login_user_id: login_user.login_user_id,
    };

    return Promise.resolve(user);
}

/**
 *  Attempts to create a user permission in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createUserPermission(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseUsersPermissionsRequest(req);
    const checkedSessionKey = await util
        .isAdmin(parsedRequest)
        .catch(() => Promise.reject(errors.cookInsufficientRights()));

    await ormLuOs.addOsocToUser(
        checkedSessionKey.data.login_user_id,
        checkedSessionKey.data.osoc_id
    );

    return Promise.resolve({});
}

/**
 *  Attempts to delte a user permission in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteUserPermission(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseUsersPermissionsRequest(req);
    const checkedSessionKey = await util
        .isAdmin(parsedRequest)
        .catch(() => Promise.reject(errors.cookInsufficientRights()));

    await ormLuOs.removeOsocFromUser(
        checkedSessionKey.data.login_user_id,
        checkedSessionKey.data.osoc_id
    );

    return Promise.resolve({});
}

/**
 *  Attempts to delte a user permission in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getYearPermissions(
    req: express.Request
): Promise<Responses.UserYearsPermissions[]> {
    const parsedRequest = await rq.parseGetUserPermissionsRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest);

    const isAdminCheck = await util.isAdmin(parsedRequest);

    if (isAdminCheck.is_admin) {
        const years = await ormLuOs.getOsocYearsForLoginUserById(
            checkedSessionKey.data.id
        );

        return Promise.resolve(
            years.map((year) => {
                return {
                    osoc_id: year.osoc_id,
                    year: year.osoc.year,
                };
            })
        );
    }

    return Promise.reject(errors.cookInsufficientRights());
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

    util.route(router, "post", "/year/:id", createUserPermission);
    util.route(router, "delete", "/year/:id", deleteUserPermission);

    util.route(router, "get", "/years/:id", getYearPermissions);

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

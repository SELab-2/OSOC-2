import { account_status_enum } from "@prisma/client";
import express from "express";

import * as ormL from "../orm_functions/login_user";
import * as ormP from "../orm_functions/person";
import * as ormSe from "../orm_functions/session_key";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import { removeAllKeysForLoginUserId } from "../orm_functions/session_key";

/**
 *  Attempts to list all admins in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listAdmins(
    req: express.Request
): Promise<Responses.AdminList> {
    return rq
        .parseAdminAllRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async () =>
            ormL
                .searchAllAdminLoginUsers(true)
                .then((obj) =>
                    obj.map((val) => ({
                        person_data: {
                            id: val.person.person_id,
                            name:
                                val.person.firstname +
                                " " +
                                val.person.lastname,
                            email: val.person.email,
                            github: val.person.github,
                        },
                        coach: val.is_coach,
                        admin: val.is_admin,
                        activated: val.account_status as string,
                    }))
                )
                .then((obj) =>
                    Promise.resolve({
                        data: obj,
                    })
                )
        );
}

/**
 *  Attempts to update a certain admin in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function modAdmin(req: express.Request): Promise<Responses.Admin> {
    return rq
        .parseUpdateAdminRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.mutable(parsed, parsed.data.id))
        .then(async (parsed) => {
            if (parsed.data.id !== parsed.userId) {
                return ormL
                    .updateLoginUser({
                        loginUserId: parsed.data.id,
                        isAdmin: parsed.data.isAdmin,
                        isCoach: parsed.data.isCoach,
                        accountStatus: parsed.data
                            .accountStatus as account_status_enum,
                    })
                    .then(async (res) => {
                        console.log(res.is_admin);
                        console.log(res.is_coach);
                        if (!res.is_admin && !res.is_coach) {
                            await ormL.updateLoginUser({
                                loginUserId: res.login_user_id,
                                isAdmin: false,
                                isCoach: false,
                                accountStatus: account_status_enum.DISABLED,
                            });
                            await ormSe.removeAllKeysForLoginUserId(
                                res.login_user_id
                            );
                        }
                        return Promise.resolve({
                            id: res.login_user_id,
                            name:
                                res.person.firstname +
                                " " +
                                res.person.lastname,
                        });
                    });
            }
            return Promise.reject(errors.cookInvalidID());
        });
}

/**
 *  Attempts to delete an admin from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteAdmin(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseDeleteAdminRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.mutable(parsed, parsed.data.id))
        .then(async (parsed) => {
            return ormL
                .searchLoginUserByPerson(parsed.data.id)
                .then(async (logUs) => {
                    if (
                        logUs !== null &&
                        logUs.login_user_id !== parsed.userId
                    ) {
                        return removeAllKeysForLoginUserId(logUs.login_user_id)
                            .then(() => {
                                return Promise.resolve({});
                            })
                            .then(async () => {
                                return ormL
                                    .deleteLoginUserByPersonId(parsed.data.id)
                                    .then(async () => {
                                        return ormP
                                            .deletePersonById(parsed.data.id)
                                            .then(() => Promise.resolve({}))
                                            .catch(() =>
                                                Promise.reject(
                                                    errors.cookServerError()
                                                )
                                            );
                                    })
                                    .catch(() =>
                                        Promise.reject(errors.cookServerError())
                                    );
                            })
                            .catch(() =>
                                Promise.reject(errors.cookServerError())
                            );
                    }
                    return Promise.reject(errors.cookInvalidID());
                });
        });
}

/**
 *  Gets the router for all `/admin/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/admin/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/admin");
    util.route(router, "get", "/all", listAdmins);

    util.route(router, "post", "/:id", modAdmin);
    util.route(router, "delete", "/:id", deleteAdmin);

    util.addAllInvalidVerbs(router, ["/", "/all", "/:id"]);

    return router;
}

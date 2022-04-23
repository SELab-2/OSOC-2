import { account_status_enum } from "@prisma/client";
import express from "express";

import * as ormL from "../orm_functions/login_user";
import * as ormP from "../orm_functions/person";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";

/**
 *  Attempts to list all admins in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listAdmins(req: express.Request): Promise<Responses.AdminList> {
    return rq
        .parseAdminAllRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (parsed) =>
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
 *  Attempts to get all data for a certain admin in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getAdmin(req: express.Request): Promise<Responses.Admin> {
    return rq
        .parseSingleAdminRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(() =>
            Promise.reject({ http: 410, reason: "Deprecated endpoint." })
        );
}

async function modAdmin(req: express.Request): Promise<Responses.Admin> {
    return rq
        .parseUpdateAdminRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (parsed) => {
            return ormL
                .updateLoginUser({
                    loginUserId: parsed.data.id,
                    password: null,
                    isAdmin: parsed.data.isAdmin,
                    isCoach: parsed.data.isCoach,
                    accountStatus: parsed.data
                        .accountStatus as account_status_enum,
                })
                .then((res) =>
                    Promise.resolve({
                        id: res.login_user_id,
                        name: res.person.firstname + " " + res.person.lastname,
                    })
                );
        });
}

/**
 *  Attempts to delete an admin from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteAdmin(req: express.Request): Promise<Responses.Empty> {
    return rq
        .parseDeleteAdminRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormL.deleteLoginUserByPersonId(parsed.data.id).then(() => {
                return ormP
                    .deletePersonById(parsed.data.id)
                    .then(() => Promise.resolve({}));
            });
        });
}

/**
 *  Gets the router for all `/admin/` related endpoints.
 *  @returns An Epress.js {@link express.Router} routing all `/admin/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/admin");
    util.route(router, "get", "/all", listAdmins);
    util.route(router, "get", "/:id", getAdmin);

    util.route(router, "post", "/:id", modAdmin);
    // util.routeKeyOnly(router, "delete", "/:id", deleteAdmin);

    util.addAllInvalidVerbs(router, ["/", "/all", "/:id"]);

    return router;
}

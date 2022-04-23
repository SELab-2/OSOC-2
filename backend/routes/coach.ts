import { account_status_enum } from "@prisma/client";
import express from "express";

import * as ormLU from "../orm_functions/login_user";
import * as ormP from "../orm_functions/person";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";

/**
 *  Attempts to list all coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listCoaches(req: express.Request): Promise<Responses.CoachList> {
    return rq
        .parseCoachAllRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async () =>
            ormLU
                .searchAllCoachLoginUsers(true)
                .then((obj) =>
                    obj.map((val) => ({
                        person_data: {
                            id: val.person.person_id,
                            name: val.person.firstname,
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
 *  Attempts to modify a certain coach in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function modCoach(req: express.Request): Promise<Responses.PartialCoach> {
    return rq
        .parseUpdateCoachRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (parsed) => {
            return ormLU
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
 *  Attempts to delete a coach from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteCoach(req: express.Request): Promise<Responses.Empty> {
    return rq
        .parseDeleteCoachRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormLU.deleteLoginUserByPersonId(parsed.data.id).then(() => {
                return ormP
                    .deletePersonById(parsed.data.id)
                    .then(() => Promise.resolve({}));
            });
        });
}

/**
 *  Attempts to get all data for the requests of coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getCoachRequests(
    req: express.Request
): Promise<Responses.CoachList> {
    return rq
        .parseGetAllCoachRequestsRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async () => {
            return ormLU
                .getAllLoginUsers()
                .then((obj) =>
                    obj
                        .filter(
                            (v) => v.is_coach && v.account_status == "PENDING"
                        )
                        .map((v) => ({
                            person_data: {
                                id: v.person.person_id,
                                name: v.person.firstname,
                            },
                            coach: v.is_coach,
                            admin: v.is_admin,
                            activated: v.account_status as string,
                        }))
                )
                .then((arr) =>
                    Promise.resolve({
                        data: arr,
                    })
                );
        });
}

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router({ strict: true });
    util.setupRedirect(router, "/coach");
    util.route(router, "get", "/all", listCoaches);

    util.route(router, "get", "/request", getCoachRequests);

    util.route(router, "post", "/:id", modCoach);
    util.route(router, "delete", "/:id", deleteCoach);

    util.addAllInvalidVerbs(router, ["/", "/all", "/:id", "/request"]);

    return router;
}

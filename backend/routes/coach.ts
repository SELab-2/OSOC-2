import { account_status_enum } from "@prisma/client";
import express from "express";

import * as ormLU from "../orm_functions/login_user";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import * as ormSe from "../orm_functions/session_key";
import { errors } from "../utility";
import { getLoginUserById } from "../orm_functions/login_user";

/**
 *  Attempts to list all coaches in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listCoaches(
    req: express.Request
): Promise<Responses.CoachList> {
    return rq
        .parseCoachAllRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async () =>
            ormLU
                .searchAllCoachLoginUsers(true)
                .then((obj) =>
                    obj.map((val) => ({
                        person_data: {
                            id: val.person.person_id,
                            name: val.person.name,
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
export async function modCoach(
    req: express.Request
): Promise<Responses.PartialCoach> {
    return rq
        .parseUpdateCoachRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.mutable(parsed, parsed.data.id))
        .then(async (parsed) => {
            console.log(parsed);
            if (parsed.data.id !== parsed.userId) {
                // parse to enum
                const accountStatus = parsed.data
                    .accountStatus as account_status_enum;

                // get the loginUser we are modifying. We need this user to check if the user is disabled at the moment or not
                const userToModify = await getLoginUserById(parsed.data.id);

                // when we set the account to active and the account was disabled => set isCoach to true. Otherwise just use the value from the request
                const coachVal =
                    accountStatus === account_status_enum.ACTIVATED &&
                    userToModify &&
                    userToModify.account_status === account_status_enum.DISABLED
                        ? true
                        : parsed.data.isCoach;

                return ormLU
                    .updateLoginUser({
                        loginUserId: parsed.data.id,
                        isAdmin: parsed.data.isAdmin,
                        isCoach: coachVal,
                        accountStatus: accountStatus,
                    })
                    .then(async (res) => {
                        if (
                            !res.is_admin &&
                            !res.is_coach &&
                            accountStatus !== account_status_enum.ACTIVATED
                        ) {
                            await ormSe.removeAllKeysForLoginUserId(
                                res.login_user_id
                            );
                            await ormLU.updateLoginUser({
                                loginUserId: res.login_user_id,
                                isAdmin: false,
                                isCoach: false,
                                accountStatus: account_status_enum.DISABLED,
                            });
                        }
                        return Promise.resolve({
                            id: res.login_user_id,
                            name: res.person.name,
                        });
                    });
            } else {
                return Promise.reject(errors.cookInvalidID());
            }
        });
}

/**
 *  Attempts to delete a coach from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteCoach(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseDeleteCoachRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.mutable(parsed, parsed.data.id))
        .then(async (parsed) => {
            return ormLU
                .deleteLoginUserFromDB(parsed.data.id)
                .then(() => Promise.resolve({}));
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

    util.route(router, "post", "/:id", modCoach);
    util.route(router, "delete", "/:id", deleteCoach);

    util.addAllInvalidVerbs(router, ["/", "/all", "/:id", "/request"]);

    return router;
}

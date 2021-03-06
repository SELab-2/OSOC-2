import express from "express";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { checkYearPermissionOsoc, errors } from "../utility";
import * as ormO from "../orm_functions/osoc";
import { addOsocToUser } from "../orm_functions/login_user_osoc";

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createOsocEdition(
    req: express.Request
): Promise<Responses.OsocEdition> {
    return rq
        .parseNewOsocEditionRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            const osoc = await ormO.createOsoc(parsed.data.year);
            // the loginUser (an admin) created this osoc edition. The user is immediately registered as someone who should see this osoc edition
            const added = await addOsocToUser(parsed.userId, osoc.osoc_id);
            if (!added) {
                // this error only happens if shomething in the database goes wrong even though we just checked all the necessary data is there
                return Promise.reject(errors.cookServerError());
            }
            return Promise.resolve({
                data: {
                    id: osoc.osoc_id,
                    year: osoc.year,
                },
            });
        });
}

/**
 *  Attempts to list all osoc editions in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listOsocEditions(
    req: express.Request
): Promise<Responses.OsocEditionList> {
    const parsedRequest = await rq.parseOsocAllRequest(req);
    const checkedSessionKey = await util.isAdmin(parsedRequest);
    if (checkedSessionKey.is_admin) {
        const osocEditions = await ormO.getAllOsoc();

        return Promise.resolve({ data: osocEditions });
    }

    return Promise.reject(errors.cookInvalidID());
}

/**
 *  Attempts to filter osoc editions in the system by year.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function filterYear(
    req: express.Request
): Promise<Responses.OsocEditionList> {
    const parsedRequest = await rq.parseFilterOsocsRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest);

    const osocs = await ormO.filterOsocs(
        {
            currentPage: parsedRequest.currentPage,
            pageSize: parsedRequest.pageSize,
        },
        checkedSessionKey.data.yearFilter,
        checkedSessionKey.data.yearSort,
        checkedSessionKey.userId
    );

    return Promise.resolve(osocs);
}

/**
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteOsocEditionRequest(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseDeleteOsocEditionRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(checkYearPermissionOsoc)
        .then(async (parsed) => {
            return ormO
                .deleteOsocFromDB(parsed.data.id)
                .then(() => Promise.resolve({}));
        });
}

/**
 *  Gets the router for all `/osoc/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/osoc/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/osoc");
    util.route(router, "get", "/all", listOsocEditions);
    util.route(router, "get", "/filter", filterYear);
    util.route(router, "post", "/create", createOsocEdition);
    util.route(router, "delete", "/:id", deleteOsocEditionRequest);
    util.addAllInvalidVerbs(router, ["/", "/all, /filter, /create, /:id"]);

    return router;
}

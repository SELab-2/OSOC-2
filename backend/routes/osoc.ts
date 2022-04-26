import express from "express";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import * as ormO from "../orm_functions/osoc";

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createOsocEdition(
    req: express.Request
): Promise<Responses.OsocEdition> {
    return rq
        .parseNewOsocEditionRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormO.createOsoc(parsed.data.year).then((osoc) =>
                Promise.resolve({
                    data: {
                        id: osoc.osoc_id,
                        year: osoc.year,
                    },
                })
            );
        });
}

/**
 *  Attempts to list all osoc editions in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listOsocEditions(
    req: express.Request
): Promise<Responses.OsocEditionList> {
    const parsedRequest = await rq.parseOsocAllRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID);
    }
    const osocEditions = await ormO.getAllOsoc();

    return Promise.resolve({
        data: osocEditions,
    });
}

/**
 *  Attempts to filter osoc editions in the system by year.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function filterYear(
    req: express.Request
): Promise<Responses.OsocEditionList> {
    const parsedRequest = await rq.parseFilterOsocsRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const osocs = await ormO.filterOsocs(
        checkedSessionKey.data.yearFilter,
        checkedSessionKey.data.yearSort
    );

    return Promise.resolve({
        data: osocs,
    });
}

/**
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteOsocEditionRequest(
    req: express.Request
): Promise<Responses.Key> {
    return rq
        .parseDeleteOsocEditionRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormO.deleteOsocFromDB(parsed.data.id).then(() =>
                Promise.resolve({
                    sessionkey: parsed.data.sessionkey,
                })
            );
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
    util.routeKeyOnly(router, "delete", "/:id", deleteOsocEditionRequest);
    util.addAllInvalidVerbs(router, ["/", "/all, /filter, /create, /:id"]);

    return router;
}

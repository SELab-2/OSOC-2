import express from "express";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import * as ormO from "../orm_functions/osoc";

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
        sessionkey: checkedSessionKey.data.sessionkey,
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

    util.addAllInvalidVerbs(router, ["/", "/all"]);

    return router;
}

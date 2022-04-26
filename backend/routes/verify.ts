import express from "express";

import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";

/**
 *  Attempts to verify if the session key is valid.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function verifyKey(req: express.Request): Promise<Responses.VerifyKey> {
    const parsedRequest = await rq.parseVerifyRequest(req);
    // verify works on PENDING accounts
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest, false)
        .catch((res) => res);
    if (checkedSessionKey.data === undefined) {
        return Promise.resolve({ valid: false });
    } else {
        return Promise.resolve({
            valid: true,
            is_coach: checkedSessionKey.is_coach,
            is_admin: checkedSessionKey.is_admin,
            account_status: checkedSessionKey.accountStatus,
        });
    }
}

/**
 *  Gets the router for all `/verify/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/user/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    router.post("/", (req, res) =>
        util.respOrErrorNoReinject(res, verifyKey(req))
    );

    util.addAllInvalidVerbs(router, ["/"]);

    return router;
}

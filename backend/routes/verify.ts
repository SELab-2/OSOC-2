import express from 'express';

import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';

/**
 *  Attempts to verify if the session key is valid.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function verifyKey(req: express.Request): Promise<Responses.VerifyKey> {
    const parsedRequest = await rq.parseUserAllRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data === undefined) {
        return Promise.resolve({success: false});
    }
    return Promise.resolve({success: true});
}

/**
 *  Gets the router for all `/verify/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/user/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, '/verify');
    router.post('/',
        (req, res) => util.respOrErrorNoReinject(res, verifyKey(req)));

    util.addAllInvalidVerbs(router, ["/"]);

    return router;
}

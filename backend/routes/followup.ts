import express from "express";

import * as ormJA from "../orm_functions/job_application";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { checkYearPermissionsFollowup, errors } from "../utility";
import { getOsocYearsForLoginUser } from "../orm_functions/login_user";
import { getLatestOsoc, getOsocById } from "../orm_functions/osoc";
import { getJobApplication } from "../orm_functions/job_application";

/**
 *  Attempts to get a single followup.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getFollowup(
    req: express.Request
): Promise<Responses.SingleFollowup> {
    return rq
        .parseGetFollowupStudentRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(checkYearPermissionsFollowup)
        .then((checked) =>
            ormJA
                .getJobApplication(checked.data.id)
                .then((data) => util.getOrReject(data))
                .then(async (data) => {
                    // check if this last year is visible for the loginUser
                    const visibleYears = await getOsocYearsForLoginUser(
                        checked.userId
                    );
                    const osoc = await getOsocById(data.osoc_id);

                    if (osoc !== null && visibleYears.includes(osoc.year)) {
                        return data;
                    }
                    return Promise.reject(errors.cookInsufficientRights());
                })
                .then((ja) =>
                    Promise.resolve({
                        student: ja.student_id,
                        application: ja.job_application_id,
                        status: ja.email_status,
                    })
                )
        );
}

/**
 *  Attempts to update a single followup.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function updateFollowup(
    req: express.Request
): Promise<Responses.SingleFollowup> {
    return rq
        .parseSetFollowupStudentRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(checkYearPermissionsFollowup)
        .then(async (checked) => {
            // modifications to a job application is only allowed if the job application is of the most recent osoc year
            const [jobApplication, latestOsoc] = await Promise.all([
                getJobApplication(checked.data.id),
                getLatestOsoc(),
            ]);

            if (jobApplication === null || latestOsoc === null) {
                return Promise.reject(errors.cookInvalidID());
            }

            if (jobApplication.osoc.year !== latestOsoc.year) {
                return Promise.reject(errors.cookWrongOsocYear());
            }

            // do the modifications itself
            return Promise.resolve(jobApplication)
                .then((ja) => util.getOrReject(ja))
                .then((ja) =>
                    ormJA.changeEmailStatusOfJobApplication(
                        ja.job_application_id,
                        checked.data.type
                    )
                )
                .then((res) =>
                    Promise.resolve({
                        student: res.student_id,
                        application: res.job_application_id,
                        status: res.email_status,
                    })
                );
        });
}

export function getRouter() {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/followup");
    util.route(router, "get", "/:id", getFollowup);
    util.route(router, "post", "/:id", updateFollowup);

    util.addAllInvalidVerbs(router, ["/", "/all"]);

    return router;
}

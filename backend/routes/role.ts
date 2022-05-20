import express from "express";
import { Responses } from "../types";
import * as rq from "../request";
import * as util from "../utility";
import * as ormRo from "../orm_functions/role";
import * as ormRole from "../orm_functions/role";

/**
 *  Attempts to list all roles in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listStudentRoles(
    req: express.Request
): Promise<Responses.StudentRoles> {
    return rq
        .parseRolesAllRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async () => {
            return ormRo.getAllRoles().then((roles) =>
                Promise.resolve({
                    data: roles,
                })
            );
        });
}

/**
 *  Attempts to create a new role in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createStudentRole(
    req: express.Request
): Promise<Responses.PartialStudent> {
    return rq
        .parseStudentRoleRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (parsed) => {
            let roleByName = await ormRole.getRolesByName(parsed.data.name);
            if (roleByName === null) {
                roleByName = await ormRole.createRole(parsed.data.name);
            }

            return Promise.resolve({
                name: roleByName.name,
                id: roleByName.role_id,
            });
        });
}

/**
 *  Gets the router for all `/role/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/role/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/role");

    util.route(router, "get", "/all", listStudentRoles);

    util.route(router, "post", "/create", createStudentRole);

    util.addAllInvalidVerbs(router, ["/", "/all", "/create"]);

    return router;
}

import express from "express";
import { InternalTypes, Responses } from "../types";
import * as rq from "../request";
import * as util from "../utility";
import * as ormRo from "../orm_functions/role";

/**
 *  Attempts to list all roles in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listStudentRoles(
  req: express.Request
): Promise<Responses.StudentList> {
  return rq
    .parseRolesAllRequest(req)
    .then((parsed) => util.checkSessionKey(parsed))
    .then((parsed) => {
      return ormRo
        .getAllRoles()
        .then((roles) =>
          Promise.resolve({ data: roles, sessionkey: parsed.data.sessionkey })
        );
    });
}

/**
 *  Attempts to create a new role in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentRole(
  req: express.Request
): Promise<Responses.Keyed<InternalTypes.IdName>> {
  return rq
    .parseStudentRoleRequest(req)
    .then((parsed) => util.checkSessionKey(parsed))
    .then(async (parsed) => {
      return ormRo.createRole(parsed.data.name).then((role) => {
        return Promise.resolve({
          data: { name: role.name, id: role.role_id },
          sessionkey: parsed.data.sessionkey,
        });
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

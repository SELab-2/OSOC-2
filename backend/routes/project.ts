import express from "express";

import * as ormCtr from "../orm_functions/contract";
import * as ormEv from "../orm_functions/evaluation";
import * as ormOsoc from "../orm_functions/osoc";
import * as ormPr from "../orm_functions/project";
import * as ormPrRole from "../orm_functions/project_role";
import * as ormPU from "../orm_functions/project_user";
import * as ormRole from "../orm_functions/role";
import * as rq from "../request";
import { InternalTypes, Responses, StringDict } from "../types";
import * as util from "../utility";
import { errors } from "../utility";

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createProject(req: express.Request): Promise<Responses.Project> {
    return rq
        .parseNewProjectRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormPr
                .createProject({
                    name: parsed.data.name,
                    partner: parsed.data.partner,
                    startDate: parsed.data.start,
                    endDate: parsed.data.end,
                    positions: parsed.data.positions,
                    osocId: parsed.data.osocId,
                })
                .then((project) =>
                    Promise.resolve({
                        sessionkey: parsed.data.sessionkey,
                        data: {
                            id: project.project_id,
                            name: project.name,
                            partner: project.partner,
                            start_date: project.start_date.toString(),
                            end_date: project.end_date.toString(),
                            positions: project.positions,
                            osoc_id: project.osoc_id,
                        },
                    })
                );
        });
}

/**
 *  Attempts to list all projects in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listProjects(
    req: express.Request
): Promise<Responses.ProjectList> {
    return rq
        .parseProjectAllRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (parsed) =>
            ormPr
                .getAllProjects()
                .then((obj) =>
                    Promise.all(
                        obj.map(async (val) => {
                            const students = await ormCtr.contractsByProject(
                                val.project_id
                            );
                            const users = await ormPU.getUsersFor(
                                val.project_id
                            );
                            return Promise.resolve({
                                id: Number(val.project_id),
                                name: val.name,
                                partner: val.partner,
                                start_date: val.start_date.toString(),
                                end_date: val.end_date.toString(),
                                positions: val.positions,
                                osoc_id: val.osoc_id,
                                students: students,
                                coaches: users,
                            });
                        })
                    )
                )
                .then((obj) =>
                    Promise.resolve({
                        sessionkey: parsed.data.sessionkey,
                        data: obj,
                    })
                )
        );
}

/**
 *  Attempts to get all data for a certain project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getProject(req: express.Request): Promise<Responses.Project> {
    return rq
        .parseSingleProjectRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.isValidID(parsed.data, "project"))
        .then(async (parsed) =>
            ormPr.getProjectById(parsed.id).then(async (obj) => {
                if (obj !== null) {
                    const students = await ormCtr.contractsByProject(
                        obj.project_id
                    );
                    const users = await ormPU.getUsersFor(obj.project_id);
                    return Promise.resolve({
                        sessionkey: parsed.sessionkey,
                        data: {
                            id: Number(obj.project_id),
                            name: obj.name,
                            partner: obj.partner,
                            start_date: obj.start_date.toString(),
                            end_date: obj.end_date.toString(),
                            positions: obj.positions,
                            osoc_id: obj.osoc_id,
                            students: students,
                            coaches: users,
                        },
                    });
                } else {
                    return Promise.reject(errors.cookInvalidID());
                }
            })
        );
}

async function modProject(req: express.Request): Promise<Responses.Project> {
    return rq
        .parseUpdateProjectRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.isValidID(parsed.data, "project"))
        .then(async (parsed) => {
            // UPDATING LOGIC
            return ormPr
                .updateProject({
                    projectId: parsed.id,
                    name: parsed.name,
                    partner: parsed.partner,
                    startDate: parsed.start,
                    endDate: parsed.end,
                    positions: parsed.positions,
                    osocId: parsed.osocId,
                })
                .then((project) =>
                    Promise.resolve({
                        sessionkey: parsed.sessionkey,
                        data: {
                            id: project.project_id,
                            name: project.name,
                            partner: project.partner,
                            start_date: project.start_date.toString(),
                            end_date: project.end_date.toString(),
                            positions: project.positions,
                            osoc_id: project.osoc_id,
                        },
                    })
                );
        });
}

/**
 *  Attempts to delete a project from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteProject(req: express.Request): Promise<Responses.Key> {
    return rq
        .parseDeleteProjectRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.isValidID(parsed.data, "project"))
        .then(async (parsed) => {
            return ormPr
                .deleteProject(parsed.id)
                .then(() => Promise.resolve({ sessionkey: parsed.sessionkey }));
        });
}

/**
 *  Attempts to get all drafted students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getDraftedStudents(
    req: express.Request
): Promise<Responses.ProjectDraftedStudents> {
    return rq
        .parseGetDraftedStudentsRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (parsed) => {
            const prName = await ormPr
                .getProjectById(parsed.data.id)
                .then((pr) => pr?.name);

            return ormCtr.contractsByProject(parsed.data.id).then(async (arr) =>
                Promise.resolve({
                    sessionkey: parsed.data.sessionkey,
                    data: {
                        id: parsed.data.id,
                        name: util.getOrDefault(prName, "(unnamed project)"),
                        students: arr.map((obj) => ({
                            student: obj.student,
                            status: obj.contract_status,
                        })),
                    },
                })
            );
        });
}

async function getFreeSpotsFor(
    role: string,
    project: number
): Promise<{ count: number; role: number }> {
    return ormPrRole
        .getProjectRolesByProject(project)
        .then((roles) =>
            Promise.all(
                roles.map(async (r) =>
                    ormRole.getRole(r.role_id).then((upd) =>
                        Promise.resolve({
                            project_role_id: r.project_role_id,
                            role_id: r.role_id,
                            block: upd,
                        })
                    )
                )
            )
        )
        .then((roles) => roles.filter((r) => r.block?.name == role))
        .then(async (rest) => {
            console.log("Resulting roles: " + JSON.stringify(rest));
            if (rest.length != 1) return Promise.reject();
            return ormPrRole
                .getNumberOfFreePositions(rest[0].project_role_id)
                .then((n) => {
                    if (n == null) return Promise.reject();
                    return Promise.resolve({
                        count: n,
                        role: rest[0].project_role_id,
                    });
                });
        });
}

async function createProjectRoleFor(
    project: number,
    role: string
): Promise<{ count: number; role: number }> {
    return ormRole
        .getRolesByName(role)
        .then((r) => {
            if (r == null)
                return Promise.reject({
                    http: 409,
                    reason: "That role doesn't exist.",
                });
            return ormPrRole.createProjectRole({
                projectId: project,
                roleId: r.role_id,
                positions: 1,
            });
        })
        .then((res) =>
            Promise.resolve({ count: res.positions, role: res.project_role_id })
        );
}

async function modProjectStudent(
    req: express.Request
): Promise<Responses.ModProjectStudent> {
    return rq
        .parseDraftStudentRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            console.log(
                "Attempting to modify project " +
                    parsed.data.id +
                    " by moving student " +
                    parsed.data.studentId +
                    " to role `" +
                    parsed.data.role +
                    "`"
            );
            return ormCtr
                .contractsByProject(parsed.data.id)
                .then((arr) =>
                    arr.filter(
                        (v) => v.student.student_id == parsed.data.studentId
                    )
                )
                .then((arr) => {
                    if (arr.length == 0) {
                        return Promise.reject({
                            http: 204,
                            reason: "The selected student is not assigned to this project.",
                        });
                    }

                    if (arr.length > 1) {
                        return Promise.reject({
                            http: 409,
                            reason: "The request is ambiguous.",
                        });
                    }

                    return Promise.resolve(arr[0]);
                })
                .then(async (ctr) => {
                    return getFreeSpotsFor(parsed.data.role, parsed.data.id)
                        .catch(() =>
                            createProjectRoleFor(
                                parsed.data.id,
                                parsed.data.role
                            )
                        )
                        .then((remaining) => {
                            if (remaining.count <= 0) {
                                return Promise.reject({
                                    http: 409,
                                    reason: "Can't add this role to the student. There are no more vacant spots.",
                                });
                            }

                            return ormCtr.updateContract({
                                contractId: ctr.contract_id,
                                loginUserId: parsed.userId,
                                projectRoleId: remaining.role,
                            });
                        });
                })
                .then((res) =>
                    ormPrRole.getProjectRoleById(res.project_role_id)
                )
                .then((res) =>
                    Promise.resolve({
                        sessionkey: parsed.data.sessionkey,
                        data: {
                            drafted: true,
                            role: util.getOrDefault(res?.role.name, ""),
                        },
                    })
                );
        });
}

async function unAssignStudent(req: express.Request): Promise<Responses.Key> {
    return rq
        .parseRemoveAssigneeRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (checked) => {
            return ormCtr
                .contractsForStudent(Number(checked.data.studentId))
                .then((ctrs) =>
                    ctrs.filter(
                        (contr) =>
                            contr.project_role.project_id == checked.data.id
                    )
                )
                .then(async (found) => {
                    if (found.length == 0) {
                        return Promise.reject({
                            http: 400,
                            reason:
                                "The student with ID " +
                                checked.data.studentId.toString() +
                                " is not assigned to project " +
                                checked.data.id,
                        });
                    }

                    for (const contr of found) {
                        await ormEv
                            .getEvaluationByPartiesFor(
                                checked.userId,
                                contr.student.student_id,
                                contr.project_role.project.osoc_id
                            )
                            .then((evl) => {
                                if (evl.length != 1) {
                                    return Promise.reject({
                                        http: 400,
                                        reason: "Multiple evaluations match.",
                                    });
                                }

                                return ormEv.updateEvaluationForStudent({
                                    evaluation_id: evl[0].evaluation_id,
                                    loginUserId: checked.userId,
                                    motivation:
                                        util.getOrDefault(
                                            evl[0].motivation,
                                            ""
                                        ) +
                                        " [Removed assignee from project " +
                                        checked.data.id +
                                        "]",
                                });
                            })
                            .then(() =>
                                ormCtr.removeContract(contr.contract_id)
                            );
                    }

                    return Promise.resolve({
                        sessionkey: checked.data.sessionkey,
                    });
                });
        });
}

async function getProjectConflicts(
    req: express.Request
): Promise<Responses.ConflictList> {
    return rq
        .parseProjectConflictsRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (checked) => {
            return ormOsoc
                .getNewestOsoc()
                .then((osoc) => util.getOrReject(osoc))
                .then((osoc) =>
                    ormCtr.sortedContractsByOsocEdition(osoc.osoc_id)
                )
                .then((contracts) => {
                    if (contracts.length == 0 || contracts.length == 1)
                        return Promise.resolve([]);
                    const res: StringDict<typeof contracts> = {};
                    let latestid = contracts[0].student_id;
                    for (let i = 1; i < contracts.length; i++) {
                        if (contracts[i].student_id == latestid) {
                            const idStr: string =
                                contracts[i].student_id.toString();
                            if (!(idStr in res)) {
                                res[idStr] = [contracts[i - 1], contracts[i]];
                            } else {
                                res[idStr].push(contracts[i]);
                            }
                        }
                        latestid = contracts[i].student_id;
                    }

                    const arr: InternalTypes.Conflict[] = [];
                    for (const idStr in res) {
                        arr.push({
                            student: Number(idStr),
                            projects: res[idStr].map((p) => ({
                                id: p.project_role.project.project_id,
                                name: p.project_role.project.name,
                            })),
                        });
                    }
                    return Promise.resolve(arr);
                })
                .then((arr) =>
                    Promise.resolve({
                        sessionkey: checked.data.sessionkey,
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
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/project");
    util.route(router, "get", "/all", listProjects);

    util.route(router, "get", "/:id", getProject);
    util.route(router, "post", "/:id", createProject);

    util.route(router, "post", "/:id", modProject);
    util.routeKeyOnly(router, "delete", "/:id", deleteProject);

    util.route(router, "get", "/:id/draft", getDraftedStudents);
    util.route(router, "post", "/:id/draft", modProjectStudent);

    util.routeKeyOnly(router, "delete", "/:id/assignee", unAssignStudent);

    util.route(router, "get", "/conflicts", getProjectConflicts);

    // TODO add project conflicts
    util.addAllInvalidVerbs(router, [
        "/",
        "/all",
        "/:id",
        "/:id/draft",
        "/request/:id",
    ]);

    return router;
}

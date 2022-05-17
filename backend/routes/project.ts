import express from "express";

import * as ormCtr from "../orm_functions/contract";
import * as ormEv from "../orm_functions/evaluation";
import * as ormOsoc from "../orm_functions/osoc";
import * as ormPr from "../orm_functions/project";
import * as ormPrRole from "../orm_functions/project_role";
import * as ormPU from "../orm_functions/project_user";
import * as ormOs from "../orm_functions/osoc";
import * as ormRole from "../orm_functions/role";
import * as rq from "../request";
import { ApiError, InternalTypes, Responses, StringDict } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
// import { project_role } from "@prisma/client";

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createProject(
    req: express.Request
): Promise<Responses.Project> {
    const parsedRequest = await rq.parseNewProjectRequest(req);
    const checkedSessionKey = await util
        .isAdmin(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const createdProject = await ormPr.createProject({
        name: checkedSessionKey.data.name,
        partner: checkedSessionKey.data.partner,
        startDate: new Date(checkedSessionKey.data.start),
        endDate: new Date(checkedSessionKey.data.end),
        osocId: Number(checkedSessionKey.data.osocId),
        description: checkedSessionKey.data.description,
    });

    const roleList = [];

    for (const role of checkedSessionKey.data.roles.roles) {
        let roleByName = await ormRole.getRolesByName(role.name);
        if (roleByName === null) {
            roleByName = await ormRole.createRole(role.name);
        }
        const createdProjectRole = await ormPrRole.createProjectRole({
            projectId: createdProject.project_id,
            roleId: roleByName.role_id,
            positions: role.positions,
        });

        roleList.push({
            name: role.name,
            positions: createdProjectRole.positions,
        });
    }

    return Promise.resolve({
        id: createdProject.project_id,
        name: createdProject.name,
        partner: createdProject.partner,
        start_date: createdProject.start_date.toString(),
        end_date: createdProject.end_date.toString(),
        osoc_id: createdProject.osoc_id,
        description: createdProject.description,
        roles: roleList,
    });
}

/**
 *  Attempts to list all projects in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listProjects(
    req: express.Request
): Promise<Responses.ProjectListAndContracts> {
    const parsedRequest = await rq.parseProjectAllRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const allProjects = [];
    for (const project of await ormPr.getAllProjects()) {
        const roles = await ormPrRole.getProjectRolesByProject(
            project.project_id
        );
        const projectRoles = [];
        for (const role of roles) {
            const foundRole = await ormRole.getRole(role.role_id);
            if (foundRole === null) {
                return Promise.reject(errors.cookNoDataError());
            }
            projectRoles.push({
                name: foundRole.name,
                positions: role.positions,
            });
        }

        const contracts = await ormCtr.contractsByProject(project.project_id);

        const newContracts: Responses.Contract[] = [];

        contracts.forEach((contract) => {
            const newStudentField = {
                evaluations: undefined,
                evaluation: undefined,
                jobApplication: undefined,
                roles: undefined,
                student:
                    contract.student === null
                        ? contract.student
                        : {
                              student_id: contract.student.student_id,
                              person_id: undefined,
                              person: contract.student.person,
                              alumni: contract.student.alumni,
                              nickname: contract.student.nickname,
                              gender: contract.student.gender,
                              pronouns: contract.student.pronouns,
                              phone_number: contract.student.phone_number,
                          },
            };

            newContracts.push({
                project_role: contract.project_role,
                contract_id: contract.contract_id,
                contract_status: contract.contract_status,
                login_user: contract.login_user,
                student: newStudentField,
            });
        });

        const users = await ormPU.getUsersFor(project.project_id);
        allProjects.push({
            id: Number(project.project_id),
            name: project.name,
            partner: project.partner,
            start_date: project.start_date.toString(),
            end_date: project.end_date.toString(),
            osoc_id: project.osoc_id,
            description: project.description,
            roles: projectRoles,
            contracts: newContracts,
            coaches: users,
        });
    }

    return Promise.resolve({
        data: allProjects,
    });
}

/**
 *  Attempts to get all data for a certain project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getProject(
    req: express.Request
): Promise<Responses.ProjectAndContracts> {
    const parsedRequest = await rq.parseSingleProjectRequest(req);
    const checked = await util.isAdmin(parsedRequest).catch((res) => res);
    if (checked.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const checkedId = await util.isValidID(checked.data, "project");

    const project = await ormPr.getProjectById(checkedId.id);
    if (project !== null) {
        const contracts = await ormCtr.contractsByProject(project.project_id);

        const newContracts: Responses.Contract[] = [];

        contracts.forEach((contract) => {
            const newStudentField = {
                evaluations: undefined,
                evaluation: undefined,
                jobApplication: undefined,
                roles: undefined,
                student:
                    contract.student === null
                        ? contract.student
                        : {
                              student_id: contract.student.student_id,
                              person_id: undefined,
                              person: contract.student.person,
                              alumni: contract.student.alumni,
                              nickname: contract.student.nickname,
                              gender: contract.student.gender,
                              pronouns: contract.student.pronouns,
                              phone_number: contract.student.phone_number,
                          },
            };

            newContracts.push({
                project_role: contract.project_role,
                contract_id: contract.contract_id,
                contract_status: contract.contract_status,
                login_user: contract.login_user,
                student: newStudentField,
            });
        });

        const roles = await ormPrRole.getProjectRolesByProject(
            project.project_id
        );
        const projectRoles = [];
        for (const role of roles) {
            const foundRole = await ormRole.getRole(role.role_id);
            if (foundRole === null) {
                return Promise.reject(errors.cookNoDataError());
            }
            projectRoles.push({
                name: foundRole.name,
                positions: role.positions,
            });
        }

        const users = await ormPU.getUsersFor(project.project_id);

        return Promise.resolve({
            id: Number(project.project_id),
            name: project.name,
            partner: project.partner,
            start_date: project.start_date.toString(),
            end_date: project.end_date.toString(),
            osoc_id: project.osoc_id,
            description: project.description,
            roles: projectRoles,
            contracts: newContracts,
            coaches: users,
        });
    }

    return Promise.reject(errors.cookInvalidID());
}

export async function modProject(
    req: express.Request
): Promise<Responses.Project> {
    const parsedRequest = await rq.parseUpdateProjectRequest(req);
    const checked = await util.isAdmin(parsedRequest).catch((res) => res);
    if (checked.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const checkedId = await util
        .isValidID(checked.data, "project")
        .catch((res) => res);

    const updatedProject = await ormPr.updateProject({
        projectId: checkedId.id,
        name: checkedId.name,
        partner: checkedId.partner,
        startDate: checkedId.start,
        endDate: checkedId.end,
        osocId: checkedId.osocId,
        description: checkedId.description,
    });

    if (checkedId.modifyRoles !== undefined) {
        for (const changeRolePositions of checkedId.modifyRoles.roles) {
            const foundRole = await ormRole.getRole(changeRolePositions.id);
            if (foundRole !== null) {
                await ormPrRole.updateProjectRole({
                    projectRoleId: changeRolePositions.id,
                    projectId: checkedId.id,
                    roleId: foundRole.role_id,
                    positions: changeRolePositions.positions,
                });
            }
        }
    }

    if (checkedId.deleteRoles !== undefined) {
        for (const deleteRoleId of checkedId.deleteRoles.roles) {
            await ormPrRole.deleteProjectRole(deleteRoleId);
        }
    }

    const projectRoles = await ormPrRole.getProjectRolesByProject(checkedId.id);
    const roles = [];
    for (const projectRole of projectRoles) {
        const foundRole = await ormRole.getRole(projectRole.role_id);
        if (foundRole === null) {
            return Promise.reject(errors.cookNoDataError());
        }

        roles.push({
            name: foundRole.name,
            positions: projectRole.positions,
        });
    }

    return Promise.resolve({
        id: updatedProject.project_id,
        name: updatedProject.name,
        partner: updatedProject.partner,
        start_date: updatedProject.start_date.toString(),
        end_date: updatedProject.end_date.toString(),
        osoc_id: updatedProject.osoc_id,
        roles: roles,
        description: updatedProject.description,
    });
}

/**
 *  Attempts to delete a project from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteProject(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseDeleteProjectRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((parsed) => util.isValidID(parsed.data, "project"))
        .then(async (parsed) => {
            return ormPr
                .deleteProject(parsed.id)
                .then(() => Promise.resolve({}));
        });
}

/**
 *  Attempts to get all drafted students in the system for a project.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getDraftedStudents(
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
                    id: parsed.data.id,
                    name: util.getOrDefault(prName, "(unnamed project)"),
                    students: arr.map((obj) => ({
                        student: obj.student,
                        status: obj.contract_status,
                    })),
                })
            );
        });
}

export async function getFreeSpotsFor(
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

export async function createProjectRoleFor(
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

export async function modProjectStudent(
    req: express.Request
): Promise<Responses.ModProjectStudent> {
    return rq
        .parseDraftStudentRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormCtr
                .contractsByProject(parsed.data.id)
                .then((arr) =>
                    arr.filter(
                        (v) => v.student?.student_id == parsed.data.studentId
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
                        drafted: true,
                        role: util.getOrDefault(res?.role.name, ""),
                    })
                );
        });
}

export async function unAssignCoach(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseRemoveCoachRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (checked) => {
            return ormPU
                .getUsersFor(Number(checked.data.id))
                .then((project_users) =>
                    project_users.filter(
                        (project_user) =>
                            project_user.project_user_id ==
                            checked.data.projectUserId
                    )
                )
                .then(async (found) => {
                    if (found.length == 0) {
                        return Promise.reject({
                            http: 400,
                            reason:
                                "The coach with ID " +
                                checked.data.projectUserId.toString() +
                                " is not assigned to project " +
                                checked.data.id,
                        });
                    }

                    for (const project_user of found) {
                        await ormPU.deleteProjectUser(
                            project_user.project_user_id
                        );
                    }

                    return Promise.resolve({});
                });
        });
}

export async function assignCoach(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseAssignCoachRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async (checked) => {
            return ormPU
                .getUsersFor(Number(checked.data.id))
                .then((project_users) =>
                    project_users.filter(
                        (project_user) =>
                            project_user.login_user.login_user_id ==
                            checked.data.loginUserId
                    )
                )
                .then(async (found) => {
                    if (found.length != 0) {
                        return Promise.reject({
                            http: 400,
                            reason:
                                "The coach with ID " +
                                checked.data.loginUserId.toString() +
                                " is already assigned to project " +
                                checked.data.id,
                        });
                    }

                    const project_user = await ormPU.createProjectUser({
                        projectId: checked.data.id,
                        loginUserId: checked.data.loginUserId,
                    });

                    return Promise.resolve(project_user);
                });
        });
}

export async function unAssignStudent(
    req: express.Request
): Promise<Responses.Empty> {
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
                                contr.student?.student_id,
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

                    return Promise.resolve({});
                });
        });
}

export async function getProjectConflicts(
    req: express.Request
): Promise<Responses.ConflictList> {
    // not implementing pagination as we don't expect the number of conflicts
    // to be > 50 (2 * page size); which is kind of a minimum...
    return rq
        .parseProjectConflictsRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(async () => {
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
                                contracts[i].student_id?.toString() || "";
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
                        data: arr,
                    })
                );
        });
}

export async function assignStudent(
    req: express.Request
): Promise<Responses.ModProjectStudent> {
    const alreadyContract: ApiError = {
        http: 409,
        reason: "This student does already have a contract",
    };
    const nonexist: ApiError = {
        http: 404,
        reason: "That role doesn't exist",
    };
    const noplace: ApiError = {
        http: 409,
        reason: "There are no more free spaces for that role",
    };

    // authenticate, parse, ...
    const checked = await rq
        .parseDraftStudentRequest(req)
        .then((parsed) => util.isAdmin(parsed));
    // check if edition is ready
    const latestOsoc = await ormOsoc
        .getLatestOsoc()
        .then((osoc) => util.getOrReject(osoc));
    // check if no contracts yet
    await ormCtr
        .contractsForStudent(checked.data.studentId)
        .then((data) =>
            data.filter(
                (x) => x.project_role.project.osoc_id == latestOsoc.osoc_id
            )
        )
        .then((filtered) =>
            filtered.length > 0
                ? Promise.reject(alreadyContract)
                : Promise.resolve()
        );

    // get project role
    // then create contract
    // then assign
    return getFreeSpotsFor(checked.data.role, checked.data.id)
        .catch(() => Promise.reject(nonexist))
        .then((r) =>
            r.count > 0 ? Promise.resolve(r) : Promise.reject(noplace)
        )
        .then((r) =>
            ormCtr
                .createContract({
                    studentId: checked.data.studentId,
                    projectRoleId: r.role,
                    loginUserId: checked.userId,
                    contractStatus: "DRAFT",
                })
                .then(() => ormRole.getRole(r.role))
        )
        .then(util.getOrReject)
        .then((r) => Promise.resolve({ drafted: true, role: r?.name }));
}

/**
 *  Attempts to filter projects in the system by name, client, coaches or fully assigned.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function filterProjects(
    req: express.Request
): Promise<Responses.ProjectListAndContracts> {
    const parsedRequest = await rq.parseFilterProjectsRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    let year = new Date().getFullYear();
    if (checkedSessionKey.data.osocYear === undefined) {
        const latestOsocYear = await ormOs.getLatestOsoc();
        if (latestOsocYear !== null) {
            year = latestOsocYear.year;
        }
    } else {
        year = checkedSessionKey.data.osocYear;
    }

    const projects = await ormPr.filterProjects(
        {
            currentPage: checkedSessionKey.data.currentPage,
            pageSize: checkedSessionKey.data.pageSize,
        },
        checkedSessionKey.data.projectNameFilter,
        checkedSessionKey.data.clientNameFilter,
        checkedSessionKey.data.assignedCoachesFilterArray,
        checkedSessionKey.data.fullyAssignedFilter,
        year,
        checkedSessionKey.data.projectNameSort,
        checkedSessionKey.data.clientNameSort
    );

    const allProjects = [];
    for (const project of projects.data) {
        const roles = await ormPrRole.getProjectRolesByProject(
            project.project_id
        );
        const projectRoles = [];
        for (const role of roles) {
            const foundRole = await ormRole.getRole(role.role_id);
            if (foundRole === null) {
                return Promise.reject(errors.cookNoDataError());
            }
            projectRoles.push({
                name: foundRole.name,
                positions: role.positions,
            });
        }

        const contracts = await ormCtr.contractsByProject(project.project_id);

        const newContracts: Responses.Contract[] = [];

        contracts.forEach((contract) => {
            const newStudentField = {
                evaluations: undefined,
                evaluation: undefined,
                jobApplication: undefined,
                roles: undefined,
                student:
                    contract.student === null
                        ? contract.student
                        : {
                              student_id: contract.student.student_id,
                              person_id: undefined,
                              person: contract.student.person,
                              alumni: contract.student.alumni,
                              nickname: contract.student.nickname,
                              gender: contract.student.gender,
                              pronouns: contract.student.pronouns,
                              phone_number: contract.student.phone_number,
                          },
            };

            newContracts.push({
                project_role: contract.project_role,
                contract_id: contract.contract_id,
                contract_status: contract.contract_status,
                login_user: contract.login_user,
                student: newStudentField,
            });
        });

        const users = await ormPU.getUsersFor(project.project_id);
        allProjects.push({
            id: Number(project.project_id),
            name: project.name,
            partner: project.partner,
            start_date: project.start_date.toString(),
            end_date: project.end_date.toString(),
            osoc_id: project.osoc_id,
            description: project.description,
            roles: projectRoles,
            contracts: newContracts,
            coaches: users,
        });
    }

    return Promise.resolve({
        pagination: projects.pagination,
        data: allProjects,
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
    util.route(router, "get", "/filter", filterProjects);
    util.route(router, "get", "/all", listProjects);

    util.route(router, "get", "/:id", getProject);
    util.route(router, "post", "/", createProject);

    util.route(router, "post", "/:id", modProject);
    util.route(router, "delete", "/:id", deleteProject);

    util.route(router, "get", "/:id/draft", getDraftedStudents);
    util.route(router, "post", "/:id/draft", modProjectStudent);

    util.route(router, "post", "/:id/assignee", assignStudent);
    util.route(router, "delete", "/:id/assignee", unAssignStudent);
    util.route(router, "delete", "/:id/coach", unAssignCoach);
    util.route(router, "post", "/:id/coach", assignCoach);

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

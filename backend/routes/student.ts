import express from "express";

import * as ormEv from "../orm_functions/evaluation";
import * as ormJo from "../orm_functions/job_application";
import * as ormLa from "../orm_functions/language";
import * as ormRo from "../orm_functions/role";
import * as ormSt from "../orm_functions/student";
import * as ormLU from "../orm_functions/login_user";
import * as ormOs from "../orm_functions/osoc";
import * as rq from "../request";
import { Responses, InternalTypes } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import * as ormP from "../orm_functions/person";

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function listStudents(
    req: express.Request
): Promise<Responses.StudentList> {
    const parsedRequest = await rq.parseStudentAllRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }
    const studentList: InternalTypes.Student[] = [];
    const studentsP = await ormSt.filterStudents(
        {
            pageSize: checkedSessionKey.data.pageSize,
            currentPage: checkedSessionKey.data.currentPage,
        },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        checkedSessionKey.userId
    );

    const students = studentsP.data;
    for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
            students[studentIndex].student_id
        );
        if (jobApplication != null) {
            const roles = [];
            for (const applied_role of jobApplication.applied_role) {
                const role = await ormRo.getRole(applied_role.role_id);
                if (role != null) {
                    roles.push(role.name);
                } else {
                    return Promise.reject(errors.cookInvalidID());
                }
            }

            const evaluations = await ormJo.getStudentEvaluationsTotal(
                students[studentIndex].student_id
            );

            for (
                let skillIndex = 0;
                skillIndex < jobApplication.job_application_skill.length;
                skillIndex++
            ) {
                if (
                    jobApplication.job_application_skill[skillIndex]
                        .language_id != null
                ) {
                    const language = await ormLa.getLanguage(
                        Number(
                            jobApplication.job_application_skill[skillIndex]
                                .language_id
                        )
                    );
                    if (language != null) {
                        jobApplication.job_application_skill[skillIndex].skill =
                            language.name;
                    } else {
                        return Promise.reject(errors.cookInvalidID());
                    }
                }
            }

            studentList.push({
                student: students[studentIndex],
                jobApplication: jobApplication,
                evaluations: evaluations,
                evaluation: undefined,
                roles: roles,
            });
        } else {
            return Promise.reject(errors.cookInvalidID());
        }
    }

    return Promise.resolve({
        pagination: studentsP.pagination,
        data: studentList,
    });
}

/**
 *  Attempts to get all data for a certain student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getStudent(
    req: express.Request
): Promise<Responses.Student> {
    const parsedRequest = await rq.parseSingleStudentRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
        student.student_id
    );
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const roles = [];
    for (const applied_role of jobApplication.applied_role) {
        const role = await ormRo.getRole(applied_role.role_id);
        if (role != null) {
            roles.push(role.name);
        } else {
            return Promise.reject(errors.cookInvalidID());
        }
    }

    let year = new Date().getFullYear();
    if (checkedSessionKey.data.year === undefined) {
        const latestOsocYear = await ormOs.getLatestOsoc();
        if (latestOsocYear !== null) {
            year = latestOsocYear.year;
        }
    } else {
        year = checkedSessionKey.data.year;
    }

    const evaluations = await ormJo.getEvaluationsByYearForStudent(
        checkedSessionKey.data.id,
        year
    );

    for (const job_application_skill of jobApplication.job_application_skill) {
        if (job_application_skill.language_id != null) {
            const language = await ormLa.getLanguage(
                job_application_skill.language_id
            );
            if (language == null) {
                return Promise.reject(errors.cookInvalidID());
            }
            job_application_skill.skill = language.name;
        }
    }

    return Promise.resolve({
        student: student,
        jobApplication: jobApplication,
        evaluation: {
            evaluations: evaluations !== null ? evaluations.evaluation : [],
            osoc: {
                year: year,
            },
        },
        evaluations: undefined,
        roles: roles,
    });
}

/**
 *  Attempts to delete a student from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function deleteStudent(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseDeleteStudentRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormSt
                .deleteStudent(parsed.data.id)
                .then((student) =>
                    ormP
                        .deletePersonById(student.person_id)
                        .then(() => Promise.resolve({}))
                );
        });
}

/**
 *  Attempts to create a student suggestion in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createStudentSuggestion(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseSuggestStudentRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const osocYear = await ormOs.getLatestOsoc();

    if (osocYear == null) {
        return Promise.reject(errors.cookNoDataError());
    }

    const suggestionsTotal = (
        await ormJo.getStudentEvaluationsTemp(student.student_id)
    ).filter(
        (suggestion) =>
            suggestion.osoc.year === osocYear.year &&
            suggestion.evaluation.some(
                (evaluation) =>
                    evaluation.login_user?.login_user_id ===
                    checkedSessionKey.userId
            )
    );

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
        student.student_id
    );
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    let newEvaluation;
    if (suggestionsTotal.length > 0) {
        const suggestion = suggestionsTotal[0].evaluation.filter(
            (evaluation) =>
                evaluation.login_user?.login_user_id ===
                checkedSessionKey.userId
        );

        newEvaluation = await ormEv.updateEvaluationForStudent({
            evaluation_id: suggestion[0].evaluation_id,
            loginUserId: checkedSessionKey.userId,
            decision: checkedSessionKey.data.suggestion,
            motivation: checkedSessionKey.data.reason,
        });
    } else {
        newEvaluation = await ormEv.createEvaluationForStudent({
            loginUserId: checkedSessionKey.userId,
            jobApplicationId: jobApplication.job_application_id,
            decision: checkedSessionKey.data.suggestion,
            motivation: checkedSessionKey.data.reason,
            isFinal: false,
        });
    }

    let loginUser;
    if (newEvaluation.login_user_id) {
        loginUser = await ormLU.getLoginUserById(newEvaluation.login_user_id);
    }
    if (loginUser === null || loginUser === undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    return Promise.resolve({});
}

/**
 *  Attempts to list all suggestions for a certain student.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getStudentSuggestions(
    req: express.Request
): Promise<Responses.AllStudentEvaluationsResponse> {
    const parsedRequest = await rq.parseGetSuggestionsStudentRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    let year = new Date().getFullYear();
    if (checkedSessionKey.data.year === undefined) {
        const latestOsocYear = await ormOs.getLatestOsoc();
        if (latestOsocYear !== null) {
            year = latestOsocYear.year;
        }
    } else {
        year = checkedSessionKey.data.year;
    }

    const evaluations = await ormJo.getEvaluationsByYearForStudent(
        student.student_id,
        year
    );

    return Promise.resolve({
        evaluation: {
            evaluations: evaluations !== null ? evaluations.evaluation : [],
            osoc: {
                year: year,
            },
        },
    });
}

/**
 *  Attempts to create a student confirmation in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createStudentConfirmation(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseFinalizeDecisionRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const isAdminCheck = await util.isAdmin(parsedRequest);

    if (isAdminCheck.is_admin) {
        const student = await ormSt.getStudent(checkedSessionKey.data.id);
        if (student == null) {
            return Promise.reject(errors.cookInvalidID());
        }

        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
            student.student_id
        );
        if (jobApplication == null) {
            return Promise.reject(errors.cookInvalidID());
        }

        await ormEv.createEvaluationForStudent({
            loginUserId: checkedSessionKey.userId,
            jobApplicationId: jobApplication.job_application_id,
            decision: checkedSessionKey.data.reply,
            motivation: checkedSessionKey.data.reason,
            isFinal: true,
        });

        return Promise.resolve({});
    }

    return Promise.reject(errors.cookInsufficientRights());
}

/**
 *  Attempts to filter students in the system by name, role, alumni, student coach, status or email.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
export async function filterStudents(
    req: express.Request
): Promise<Responses.StudentList> {
    const parsedRequest = await rq.parseFilterStudentsRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest);
    // .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const students = await ormSt.filterStudents(
        {
            currentPage: checkedSessionKey.data.currentPage,
            pageSize: checkedSessionKey.data.pageSize,
        },
        checkedSessionKey.data.nameFilter,
        checkedSessionKey.data.emailFilter,
        checkedSessionKey.data.roleFilter,
        checkedSessionKey.data.alumniFilter,
        checkedSessionKey.data.coachFilter,
        checkedSessionKey.data.statusFilter,
        checkedSessionKey.data.osocYear,
        checkedSessionKey.data.emailStatusFilter,
        checkedSessionKey.data.nameSort,
        checkedSessionKey.data.emailSort,
        checkedSessionKey.userId
    );

    const studentlist: InternalTypes.Student[] = [];

    let year = new Date().getFullYear();
    if (checkedSessionKey.data.osocYear === undefined) {
        const latestOsocYear = await ormOs.getLatestOsoc();
        if (latestOsocYear !== null) {
            year = latestOsocYear.year;
        }
    } else {
        year = checkedSessionKey.data.osocYear;
    }

    for (const student of students.data) {
        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
            student.student_id
        );
        if (jobApplication == null) {
            return Promise.reject(errors.cookInvalidID());
        }

        const roles = [];
        for (const applied_role of jobApplication.applied_role) {
            const role = await ormRo.getRole(applied_role.role_id);
            if (role != null) {
                roles.push(role.name);
            } else {
                return Promise.reject(errors.cookInvalidID());
            }
        }

        const evaluations = await ormJo.getEvaluationsByYearForStudent(
            student.student_id,
            year
        );

        for (const job_application_skill of jobApplication.job_application_skill) {
            if (job_application_skill.language_id != null) {
                const language = await ormLa.getLanguage(
                    job_application_skill.language_id
                );
                if (language == null) {
                    return Promise.reject(errors.cookInvalidID());
                }
                job_application_skill.skill = language.name;
            }
        }

        studentlist.push({
            student: student,
            jobApplication: jobApplication,
            evaluation: {
                evaluations: evaluations !== null ? evaluations.evaluation : [],
                osoc: {
                    year: year,
                },
            },
            evaluations: undefined,
            roles: roles,
        });
    }

    return Promise.resolve({
        pagination: students.pagination,
        data: studentlist,
    });
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/student");
    util.route(router, "get", "/filter", filterStudents);
    util.route(router, "get", "/all", listStudents);
    util.route(router, "get", "/:id", getStudent);
    util.route(router, "delete", "/:id", deleteStudent);

    util.route(router, "post", "/:id/suggest", createStudentSuggestion);

    util.route(router, "get", "/:id/suggest", getStudentSuggestions);

    util.route(router, "post", "/:id/confirm", createStudentConfirmation);

    util.addAllInvalidVerbs(router, [
        "/",
        "/all",
        "/:id",
        "/:id/suggest",
        "/:id/confirm",
        "/filter",
    ]);

    return router;
}

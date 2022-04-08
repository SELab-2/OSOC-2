import express from 'express';

import * as ormEv from '../orm_functions/evaluation';
import * as ormJo from '../orm_functions/job_application';
import * as ormLa from '../orm_functions/language';
import * as ormRo from '../orm_functions/role';
import * as ormSt from '../orm_functions/student';
import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';
import {errors} from '../utility';

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listStudents(req: express.Request): Promise<Responses.StudentList> {
    const parsedRequest = await rq.parseStudentAllRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID);
    }
    const studentList: object[] = [];
    const students = await ormSt.getAllStudents();
    for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
        if(students[studentIndex].pronouns.length > 0 && students[studentIndex].pronouns[0] == "None") {
            students[studentIndex].pronouns = [];
        }
        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(students[studentIndex].student_id);
        if (jobApplication != null) {
            const roles = [];
            for(const applied_role of jobApplication.applied_role) {
                const role = await ormRo.getRole(applied_role.role_id);
                if(role != null) {
                    roles.push(role.name);
                } else {
                    return Promise.reject(errors.cookInvalidID);
                }
            }

            const evaluations = await ormJo.getStudentEvaluationsTotal(students[studentIndex].student_id);

            const languages: string[] = [];
            for (let skillIndex = 0; skillIndex < jobApplication.job_application_skill.length; skillIndex++) {
                const language = await ormLa.getLanguage(jobApplication.job_application_skill[skillIndex].language_id);
                if (language != null) {
                    languages.push(language.name);
                } else {
                    return Promise.reject(errors.cookInvalidID);
                }
            }

            studentList.push({
                student : students[studentIndex],
                jobApplication : jobApplication,
                evaluations : evaluations,
                languages : languages,
                roles: roles
            })
        } else {
            return Promise.reject(errors.cookInvalidID);
        }
    }

    return Promise.resolve({data : studentList, sessionkey : checkedSessionKey.data.sessionkey});
}

/**
 *  Attempts to get all data for a certain student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudent(req: express.Request): Promise<Responses.Student> {
    const parsedRequest = await rq.parseSingleStudentRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID);
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if(student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    if(student.pronouns.length > 0 && student.pronouns[0] == "None") {
        student.pronouns = [];
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(student.student_id);
    if(jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const roles = [];
    for(const applied_role of jobApplication.applied_role) {
        const role = await ormRo.getRole(applied_role.role_id);
        if(role != null) {
            roles.push(role.name);
        } else {
            return Promise.reject(errors.cookInvalidID);
        }
    }

    const evaluations = await ormJo.getStudentEvaluationsTotal(student.student_id);

    const languages : string[] = [];
    for(const job_application_skill of jobApplication.job_application_skill) {
        const language = await ormLa.getLanguage(job_application_skill.language_id);
        if(language == null) {
            return Promise.reject(errors.cookInvalidID);
        }
        languages.push(language.name);
    }

    return Promise.resolve({
        data : {
            firstname : student.person.firstname,
            lastname : student.person.lastname,
            email : student.person.email,
            github: student.person.github,
            pronouns : student.pronouns,
            phoneNumber : student.phone_number,
            nickname : student.nickname,
            alumni : student.alumni,
            languages : languages,
            jobApplication : jobApplication,
            evaluations : evaluations,
            roles: roles
        },
        sessionkey : checkedSessionKey.data.sessionkey
    });
}

/**
 *  Attempts to update a student.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function modStudent(req: express.Request): Promise<Responses.Student> {
    return rq.parseUpdateStudentRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(() => {
            return Promise.reject({http : 410, reason : 'Deprecated endpoint.'});
        });
}

/**
 *  Attempts to delete a student from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteStudent(req: express.Request): Promise<Responses.Key> {
    return rq.parseDeleteStudentRequest(req)
        .then(parsed => util.isAdmin(parsed))
        .then(async parsed => {return ormSt.deleteStudent(parsed.data.id).then(
            () => {return Promise.resolve({sessionkey : parsed.data.sessionkey})})});
}

/**
 *  Attempts to create a student suggestion in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentSuggestion(req: express.Request): Promise<Responses.Key> {
    const parsedRequest = await rq.parseSuggestStudentRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID);
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID);
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(student.student_id);
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID);
    }

    await ormEv.createEvaluationForStudent({
        loginUserId : checkedSessionKey.userId,
        jobApplicationId : jobApplication.job_application_id,
        decision : checkedSessionKey.data.suggestion,
        motivation : checkedSessionKey.data.reason,
        isFinal : false
    });

    return Promise.resolve({sessionkey : checkedSessionKey.data.sessionkey});
}

/**
 *  Attempts to list all student suggestions in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudentSuggestions(req: express.Request): Promise<Responses.SuggestionInfo> {
    return rq.parseStudentGetSuggestsRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(parsed => util.isValidID(parsed.data, 'student'))
        .then(parsed => {
        /*let suggestionsList : InternalTypes.SuggestionInfo[] = [];
        ormSt.getStudent(parsed.id)
            .then(student => {
                if (student !== null) {
                    ormJo.getLatestJobApplicationOfStudent(student.student_id)
                        .then(jobApplication => {
                            if (jobApplication !== null) {
                                ormJo.getStudentEvaluationsTemp(student.student_id)
                                    .then(suggestions => {
                                        suggestions.forEach(suggestion =>
                                            suggestion.evaluation.forEach(sug
        => { ormEv.getLoginUserByEvaluationId(sug.evaluation_id) .then(loginUser
        => { if(loginUser !== null) { suggestionsList.push({ suggestion:
        sug.decision, sender: { name: loginUser.login_user.person.firstname +
        loginUser.login_user.person.lastname, id: loginUser.login_user_id
                                                                },
                                                                reason:
        sug.motivation
                                                            }))
                                                    }
                                            })
                                        )
                                        suggestions.forEach(suggestion =>
                                            suggestion.evaluation.forEach()
                                            ormEv.getLoginUserByEvaluationId()
                                        )
                                    })

                            } else {
                                return Promise.reject(errors.cookInvalidID());
                            }
                        })
                } else {
                    return Promise.reject(errors.cookInvalidID());
                }
            })*/

            return Promise.resolve({
                data : [ {
                    suggestion : "YES",
                    sender : {id : 0, name : "Darth Vader"},
                    reason : "no reason"
                } ],
                sessionkey : parsed.sessionkey
            });
        });
}

/**
 *  Attempts to create a student confirmation in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentConfirmation(req: express.Request): Promise<Responses.Keyed<InternalTypes.Suggestion>> {
    return rq.parseFinalizeDecisionRequest(req)
        .then(parsed => util.isAdmin(parsed))
        .then(parsed => util.isValidID(parsed.data, 'student'))
        .then(parsed => {
            // UPDATING LOGIC
            /*return ormEv.createEvaluationForStudent({
            loginUserId: parsed.
            })*/
            return Promise.resolve({data : 'YES', sessionkey : parsed.sessionkey});
        });
}

/**
 *  Attempts to filter students in the system by name, role, status or mail
 * status.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function searchStudents(req: express.Request): Promise<Responses.IdNameList> {
    // SEARCHING NOT DISCUSSED YET - NO PARSER EITHER
    return Promise.resolve({data : [], sessionkey : req.body.sessionkey});
}

/**
 *  Attempts to create a new role in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentRole(req: express.Request): Promise<Responses.Keyed<InternalTypes.IdName>> {
    return rq.parseStudentRoleRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(async parsed => {
            return ormRo.createRole(parsed.data.name)
                .then(role => {return Promise.resolve({
                    data : {name : role.name, id : role.role_id},
                    sessionkey : parsed.data.sessionkey
                })});
        });
}

/**
 *  Attempts to list all roles in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listStudentRoles(req: express.Request): Promise<Responses.StudentList> {
    return rq.parseRolesAllRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(parsed => {
            return ormRo.getAllRoles().then(
                (roles) => Promise.resolve({data : roles, sessionkey : parsed.data.sessionkey}));
        });
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, '/student');
    util.route(router, "get", "/all", listStudents);
    util.route(router, "get", "/:id", getStudent);
    util.route(router, "post", "/:id", modStudent);
    util.routeKeyOnly(router, 'delete', '/:id', deleteStudent);

    util.routeKeyOnly(router, 'post', '/:id', createStudentSuggestion);

    util.route(router, "get", "/:id/suggest", getStudentSuggestions);

    util.route(router, "post", "/:id/confirm", createStudentConfirmation);

    util.route(router, "get", "/search", searchStudents);

    util.route(router, "post", "/roles", createStudentRole);

    util.route(router, "get", "roles/all", listStudentRoles);

    util.addAllInvalidVerbs(router, [ "/", "/all", "/:id", "/:id/suggest", "/:id/confirm", "/search" ]);

    return router;
}

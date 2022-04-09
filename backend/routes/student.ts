import express from 'express';

import * as ormEv from '../orm_functions/evaluation';
import * as ormJo from '../orm_functions/job_application';
import * as ormLa from '../orm_functions/language';
import * as ormRo from '../orm_functions/role';
import * as ormSt from '../orm_functions/student';
import * as ormOs from '../orm_functions/osoc';
import * as rq from '../request';
import {Responses} from '../types';
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
        return Promise.reject(errors.cookInvalidID());
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
                    return Promise.reject(errors.cookInvalidID());
                }
            }

            const evaluations = await ormJo.getStudentEvaluationsTotal(students[studentIndex].student_id);

            const languages: string[] = [];
            for (let skillIndex = 0; skillIndex < jobApplication.job_application_skill.length; skillIndex++) {
                const language = await ormLa.getLanguage(jobApplication.job_application_skill[skillIndex].language_id);
                if (language != null) {
                    languages.push(language.name);
                } else {
                    return Promise.reject(errors.cookInvalidID());
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
            return Promise.reject(errors.cookInvalidID());
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
        return Promise.reject(errors.cookInvalidID());
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
            return Promise.reject(errors.cookInvalidID());
        }
    }

    const evaluations = await ormJo.getStudentEvaluationsTotal(student.student_id);

    const languages : string[] = [];
    for(const job_application_skill of jobApplication.job_application_skill) {
        const language = await ormLa.getLanguage(job_application_skill.language_id);
        if(language == null) {
            return Promise.reject(errors.cookInvalidID());
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
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(student.student_id);
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
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
    const parsedRequest = await rq.parseGetSuggestionsStudentRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(student.student_id);
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const year = checkedSessionKey.data.year == undefined ? await ormOs.getLatestOsoc() : checkedSessionKey.data.year;
    if(year == null) {
        return Promise.resolve({data: [], sessionkey : checkedSessionKey.data.sessionkey});
    }
    const suggestionsTotal = (await ormJo.getStudentEvaluationsTotal(student.student_id))
        .filter(suggestion => suggestion.osoc.year === year);

    const suggestionsInfo = [];
    for(const suggestion of suggestionsTotal) {
        for(const evaluation of suggestion.evaluation) {
            suggestionsInfo.push({
                senderFirstname: evaluation.login_user.person.firstname,
                senderLastname: evaluation.login_user.person.lastname,
                reason: evaluation.motivation,
                decision: evaluation.decision,
                isFinal: evaluation.is_final
            })
        }
    }

    return Promise.resolve({data: suggestionsInfo, sessionkey : checkedSessionKey.data.sessionkey});
}

/**
 *  Attempts to create a student confirmation in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentConfirmation(req: express.Request): Promise<Responses.Key> {
    const parsedRequest = await rq.parseFinalizeDecisionRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(student.student_id);
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    await ormEv.createEvaluationForStudent({
        loginUserId : checkedSessionKey.userId,
        jobApplicationId : jobApplication.job_application_id,
        decision : checkedSessionKey.data.reply,
        motivation : checkedSessionKey.data.reason,
        isFinal : true
    });

    return Promise.resolve({sessionkey : checkedSessionKey.data.sessionkey});
}

/**
 *  Attempts to filter students in the system by name, role, status or mail
 * status.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function filterStudents(req: express.Request): Promise<Responses.StudentList> {
    const parsedRequest = await rq.parseFilterStudentsRequest(req);
    const checkedSessionKey = await util.checkSessionKey(parsedRequest).catch(res => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const students = await ormSt.filterStudents(checkedSessionKey.data.firstNameFilter, checkedSessionKey.data.lastNameFilter,
        checkedSessionKey.data.emailFilter, checkedSessionKey.data.roleFilter, checkedSessionKey.data.alumniFilter,
        checkedSessionKey.data.coachFilter, checkedSessionKey.data.statusFilter, checkedSessionKey.data.firstNameSort,
        checkedSessionKey.data.lastNameSort, checkedSessionKey.data.emailSort, checkedSessionKey.data.roleSort,
        checkedSessionKey.data.alumniSort);

    const studentlist = [];

    for (const student of students) {
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
                return Promise.reject(errors.cookInvalidID());
            }
        }

        const evaluations = await ormJo.getStudentEvaluationsTotal(student.student_id);

        const languages : string[] = [];
        for(const job_application_skill of jobApplication.job_application_skill) {
            const language = await ormLa.getLanguage(job_application_skill.language_id);
            if(language == null) {
                return Promise.reject(errors.cookInvalidID());
            }
            languages.push(language.name);
        }

        studentlist.push({
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
        });
    }

    return Promise.resolve({data : studentlist, sessionkey : req.body.sessionkey});
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, '/student');
    util.route(router, "get", "/filter", filterStudents);
    util.route(router, "get", "/all", listStudents);
    util.route(router, "get", "/:id", getStudent);
    util.routeKeyOnly(router, 'delete', '/:id', deleteStudent);

    util.routeKeyOnly(router, 'post', '/:id/suggest', createStudentSuggestion);

    util.route(router, "get", "/:id/suggest", getStudentSuggestions);

    util.routeKeyOnly(router, "post", "/:id/confirm", createStudentConfirmation);

    util.addAllInvalidVerbs(router, [ "/", "/all", "/:id", "/:id/suggest", "/:id/confirm", "/filter" ]);

    return router;
}

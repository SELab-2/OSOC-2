import express from 'express';

import * as ormEv from '../orm_functions/evaluation';
import * as ormJo from '../orm_functions/job_application';
import * as ormLa from '../orm_functions/language';
import * as ormSt from '../orm_functions/student';
import * as ormRo from '../orm_functions/role';
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
    if(checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID);
    }
    const studentList : object[] = [];
    const students = await ormSt.getAllStudents();
    for(let studentIndex = 0; studentIndex < students.length; studentIndex++) {
        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(students[studentIndex].student_id);
        if(jobApplication != null) {
            const evaluations = await ormJo.getStudentEvaluationsTotal(students[studentIndex].student_id);

            const languages : string[] = [];
            for(let skillIndex = 0; skillIndex < jobApplication.job_application_skill.length; skillIndex++) {
                const language = await ormLa.getLanguage(jobApplication.job_application_skill[skillIndex].language_id);
                if(language != null) {
                    languages.push(language.name);
                } else {
                    return Promise.reject(errors.cookInvalidID);
                }
            }

            studentList.push({
                student: students[studentIndex],
                jobApplication: jobApplication,
                evaluations: evaluations,
                languages: languages
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
  return rq.parseSingleStudentRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => util.isValidID(parsed.data, "student"))
      .then(async parsed => {
                return ormSt.getStudent(parsed.id).then(async student => {
                  if (student !== null) {
                    return ormJo
                        .getLatestJobApplicationOfStudent(student.student_id)
                        .then(async jobApplication => {
                          if (jobApplication !== null) {
                            return ormJo
                                .getStudentEvaluationsTotal(student.student_id)
                                .then(evaluations => {
                                  const languages: string[] = [];
                                  jobApplication.job_application_skill.forEach(
                                      skill => {
                                          ormLa.getLanguage(skill.language_id)
                                              .then(language => {
                                                if (language !== null) {
                                                  languages.push(language.name);
                                                } else {
                                                  return Promise.reject(
                                                      errors.cookInvalidID);
                                                }
                                              })});
                                  return Promise.resolve({
                                    data : {
                                      firstname : student.person.firstname,
                                      lastname : student.person.lastname,
                                      email : student.person.email,
                                      pronouns : student.pronouns,
                                      phoneNumber : student.phone_number,
                                      nickname : student.nickname,
                                      alumni : student.alumni,
                                      languages : languages,
                                      jobApplication : jobApplication,
                                      evaluations : evaluations,
                                    },
                                    sessionkey : parsed.sessionkey
                                  })
                                })
                          } else {
                            return Promise.reject(errors.cookInvalidID);
                          }
                        })
                  } else {
                    return Promise.reject(errors.cookInvalidID());
                  }
                })});
}

/**
 *  Attempts to update a student.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function modStudent(req: express.Request): Promise<Responses.Student> {
  return rq.parseUpdateStudentRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => util.isValidID(parsed.data, 'student'))
      .then(async parsed => {// UPDATE LOGIC
                             return ormSt
                                 .updateStudent({
                                   studentId : parsed.id,
                                   gender : parsed.gender,
                                   pronouns : parsed.pronouns,
                                   phoneNumber : parsed.phone,
                                   nickname : parsed.nickname,
                                   alumni : parsed.alumni
                                 })
                                 .then(student => {return Promise.resolve({
                                         data : {
                                           pronouns : student.pronouns,
                                           phone_number : student.phone_number,
                                           nickname : student.nickname,
                                           alumni : student.alumni,
                                         },
                                         sessionkey : parsed.sessionkey
                                       })})});
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
      .then(parsed => util.isValidID(parsed.data, 'student'))
      .then(async parsed => {
          return ormSt.deleteStudent(parsed.id).then(
              () => {return Promise.resolve(
                  {sessionkey : parsed.sessionkey})})});
}

/**
 *  Attempts to create a student suggestion in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentSuggestion(req: express.Request):
    Promise<Responses.Key> {
    return rq.parseSuggestStudentRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(async parsed => {
            return ormSt.getStudent(parsed.data.id).then(async student => {
                if (student !== null) {
                    return ormJo
                        .getLatestJobApplicationOfStudent(student.student_id)
                        .then(async jobApplication => {
                            if (jobApplication !== null) {
                                return ormEv
                                    .createEvaluationForStudent({
                                        loginUserId : parsed.userId,
                                        jobApplicationId : jobApplication.job_application_id,
                                        decision : parsed.data.suggestion,
                                        motivation : parsed.data.reason,
                                        isFinal : true
                                    })
                                    .then(() => {return Promise.resolve({sessionkey : parsed.data.sessionkey})})
                            } else {
                                return Promise.reject(errors.cookInvalidID());
                            }
                        })
                } else {
                    return Promise.reject(errors.cookInvalidID());
                }
            })});
}

/**
 *  Attempts to list all student suggestions in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudentSuggestions(req: express.Request):
    Promise<Responses.SuggestionInfo> {
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
                                            suggestion.evaluation.forEach(sug => {
                                                ormEv.getLoginUserByEvaluationId(sug.evaluation_id)
                                                    .then(loginUser => {
                                                        if(loginUser !== null) {
                                                            suggestionsList.push({
                                                                suggestion: sug.decision,
                                                                sender: {
                                                                    name: loginUser.login_user.person.firstname + loginUser.login_user.person.lastname,
                                                                    id: loginUser.login_user_id
                                                                },
                                                                reason: sug.motivation
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
async function createStudentConfirmation(req: express.Request):
    Promise<Responses.Keyed<InternalTypes.Suggestion>> {
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
async function searchStudents(req: express.Request):
    Promise<Responses.IdNameList> {
  // SEARCHING NOT DISCUSSED YET - NO PARSER EITHER
  return Promise.resolve({data : [], sessionkey : req.body.sessionkey});
}

/**
 *  Attempts to create a new role in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
 async function createStudentRole(req: express.Request):
 Promise<Responses.Keyed<InternalTypes.IdName>> {
 return rq.parseStudentRoleRequest(req)
     .then(parsed => util.checkSessionKey(parsed))
     .then(async parsed => {
        return ormRo
            .createRole(parsed.data.name)
            .then(role => {return Promise.resolve({
                data : {
                  name: role.name,
                  id: role.role_id
                },
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
            return ormRo.getAllRoles()
            .then((roles) => Promise.resolve({data : roles, sessionkey : parsed.data.sessionkey}));
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
  router.delete('/:id', (req, res) => util.respOrErrorNoReinject(
                            res, deleteStudent(req)));

  router.post('/:id', (req, res) => util.respOrErrorNoReinject(
                          res, createStudentSuggestion(req)));

  util.route(router, "get", "/:id/suggest", getStudentSuggestions);

  util.route(router, "post", "/:id/confirm", createStudentConfirmation);

  util.route(router, "get", "/search", searchStudents);

  util.route(router, "post", "/roles", createStudentRole);

  util.route(router, "get", "roles/all", listStudentRoles);

  util.addAllInvalidVerbs(
      router,
      [ "/", "/all", "/:id", "/:id/suggest", "/:id/confirm", "/search" ]);

  return router;
}

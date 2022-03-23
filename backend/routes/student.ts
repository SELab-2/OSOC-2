import express from 'express';

import * as rq from '../request';
import {InternalTypes, Responses} from '../types';
import * as util from '../utility';
import {errors} from '../utility';
import * as ormSt from '../orm_functions/student';
import * as ormJo from '../orm_functions/job_application';
import * as ormLa from '../orm_functions/language';
import * as ormEv from '../orm_functions/evaluation';

/* eslint-disable no-unused-vars */

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listStudents(req: express.Request):
    Promise<Responses.StudentList> {
    return rq.parseStudentAllRequest(req)
        .then(parsed => util.checkSessionKey(parsed))
        .then(parsed => {
            const studentList : InternalTypes.Student[] = [];
            ormSt.getAllStudents().then(students => {
                students.forEach(student => {
                    ormJo.getLatestJobApplicationOfStudent(student.student_id).then(jobApplication => {
                        if(jobApplication !== null) {
                            ormJo.getStudentEvaluationsTotal(student.student_id).then(evaluations => {
                                let languages : string[] = [];
                                jobApplication.job_application_skill.forEach(skill => {
                                    ormLa.getLanguage(skill.language_id).then(language => {
                                        if(language !== null) {
                                            languages.push(language.name);
                                        } else {
                                            return Promise.reject(errors.cookInvalidID);
                                        }
                                    })
                                });
                                studentList.push({
                                    firstname: student.person.firstname,
                                    lastname: student.person.lastname,
                                    email: student.person.email,
                                    gender: student.gender,
                                    pronouns: student.pronouns,
                                    phoneNumber: student.phone_number,
                                    nickname: student.nickname,
                                    alumni: student.alumni,
                                    languages: languages,
                                    jobApplication: jobApplication,
                                    evaluations: evaluations
                                })
                            })
                        } else {
                            return Promise.reject(errors.cookInvalidID);
                        }
                    })
                })
            });

            return Promise.resolve({data : studentList, sessionkey : parsed.sessionkey});
        });
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
      .then(parsed => util.isValidID(parsed, "student"))
      .then(parsed => {
          // FETCHING LOGIC
          return ormSt
              .getStudent(parsed.id)
              .then(student => {
                  if(student !== null) {
                      return ormJo.getLatestJobApplicationOfStudent(student.student_id).then(jobApplication => {
                          if(jobApplication !== null) {
                              return ormJo.getStudentEvaluationsTotal(student.student_id).then(evaluations => {
                                  let languages : string[] = [];
                                  jobApplication.job_application_skill.forEach(skill => {
                                      ormLa.getLanguage(skill.language_id).then(language => {
                                          if(language !== null) {
                                              languages.push(language.name);
                                          } else {
                                              return Promise.reject(errors.cookInvalidID);
                                          }
                                      })
                                  });
                                  return Promise.resolve({data: {
                                          firstname: student.person.firstname,
                                          lastname: student.person.lastname,
                                          email: student.person.email,
                                          gender: student.gender,
                                          pronouns: student.pronouns,
                                          phoneNumber: student.phone_number,
                                          nickname: student.nickname,
                                          alumni: student.alumni,
                                          languages: languages,
                                          jobApplication: jobApplication,
                                          evaluations: evaluations,
                                      },
                                      sessionkey: parsed.sessionkey
                                  })
                              })
                          } else {
                              return Promise.reject(errors.cookInvalidID);
                          }
                      })
                  } else {
                      return Promise.reject(errors.cookInvalidID());
                  }
              })
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
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
          // UPDATE LOGIC
          return ormSt.updateStudent({
              studentId: parsed.id,
              gender: parsed.gender,
              pronouns: parsed.pronouns,
              phoneNumber: parsed.phone,
              nickname: parsed.nickname,
              alumni: parsed.alumni
          }).then(student => {
              return Promise.resolve({data: {
                      pronouns: student.pronouns,
                      phone_number: student.phone_number,
                      nickname: student.nickname,
                      alumni: student.alumni,
                  },
                  sessionkey: parsed.sessionkey
              })
          })
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
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
          // DELETE LOGIC
          return ormSt.deleteStudent(parsed.id).then(() => {
              return Promise.resolve({
                  sessionkey: parsed.sessionkey
              })
          })
      });
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
      .then(parsed => {
          // SUGGESTING LOGIC
          return ormSt
              .getStudent(parsed.id)
              .then(student => {
                  if (student !== null) {
                      return ormJo.getLatestJobApplicationOfStudent(student.student_id).then(jobApplication => {
                            if(jobApplication !== null) {
                                return ormEv.createEvaluationForStudent({
                                    loginUserId: parsed.senderId,
                                    jobApplicationId: jobApplication.job_application_id,
                                    decision: parsed.suggestion,
                                    motivation: parsed.reason,
                                    isFinal: true
                                }).then(() => {
                                    return Promise.resolve({
                                        sessionkey: parsed.sessionkey
                                    })
                                })
                            } else {
                                return Promise.reject(errors.cookInvalidID());
                            }
                      })
                  } else {
                      return Promise.reject(errors.cookInvalidID());
                  }
              })
      });
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
      .then(parsed => util.isValidID(parsed, 'student'))
      .then(parsed => {
          // FETCHING LOGIC
          /*let suggestionsList : InternalTypes.SuggestionInfo[] = [];
          ormSt.getStudent(parsed.id)
              .then(student => {
                  if (student !== null) {
                      ormJo.getLatestJobApplicationOfStudent(student.student_id).then(jobApplication => {
                          if(jobApplication !== null) {
                              ormJo.getStudentEvaluationsTemp(student.student_id).then(suggestions => {
                                  suggestions.forEach(suggestion => {
                                      suggestionsList.push({
                                          suggestion: suggestion,
                                          sender: ormEv.getLoginUserByEvaluationId(suggestion.evaluation.evaluation_id)
                                      })
                                  })
                              })
                          } else {
                              return Promise.reject(errors.cookInvalidID());
                          }
                      })
                  } else {
                      return Promise.reject(errors.cookInvalidID());
                  }
              })*/

          return Promise.resolve({data : [{suggestion: "YES", sender: {id: 0, name: "Darth Vader"}, reason: "no reason"}], sessionkey : parsed.sessionkey});
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
      .then(parsed => util.isValidID(parsed, 'student'))
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
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router();

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

  util.addAllInvalidVerbs(
      router,
      [ "/", "/all", "/:id", "/:id/suggest", "/:id/confirm", "/search" ]);

  return router;
}

import express from 'express';

import * as ormP from '../orm_functions/person';
import * as ormSt from '../orm_functions/student';
import * as rq from '../request';
import {Requests, Responses} from '../types';
import * as util from "../utility";
import {errors} from "../utility";
import * as validator from 'validator';

/**
 *  This function searches a question with a given key in the form.
 *  @param form The form with the answers.
 *  @returns The question that corresponds with the given key.
 */
function filterQuestion(form: Requests.Form, key: string): Responses.FormResponse<Requests.Question> {
    const filteredQuestion = form.data.fields.filter(question => question.key == key);
    return filteredQuestion.length > 0 ? {data : filteredQuestion[0]} : {data : null};
}

/**
 *  This function searches the chosen option for a given question.
 *  @param question The question.
 *  @returns The option that corresponds with the given answer.
 */
function filterChosenOption(question: Requests.Question): Responses.FormResponse<Requests.Option> {
    if(question.options != undefined) {
        const filteredOption = question.options.filter(option => option.id === question.value);
        return {data : filteredOption[0]};
    }
    return {data : null}
}

/**
 *  This function checks if the answer on a certain question contains a word.
 *  @param question The question.
 *  @returns True if the question options contain the word, else false.
 */
function checkWordInAnswer(question: Requests.Question, word : string): Responses.FormResponse<boolean> {
    const chosenOption : Responses.FormResponse<Requests.Option> = filterChosenOption(question);
    return chosenOption.data != null ? {data : chosenOption.data.text.toLowerCase().includes(word)} : {data : null};
}

function checkQuestionsExist(questions: Responses.FormResponse<Requests.Question>[]) : boolean {
    const checkErrorInForm : Responses.FormResponse<Requests.Question>[] = questions.filter(dataError => dataError.data == null);
    return checkErrorInForm.length === 0;
}

/* parse form to person
***********************/

/**
 *  Parse the form to the birth name of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getBirthName(form: Requests.Form) : Promise<string> {
    const questionBirthName: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_npDErJ");
    const questionsExist : boolean = checkQuestionsExist([questionBirthName]);
    if(!questionsExist || questionBirthName.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(questionBirthName.data.value);
}

/**
 *  Parse the form to the last name of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getLastName(form: Requests.Form) : Promise<string> {
    const questionLastName: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_319eXp");
    const questionsExist : boolean = checkQuestionsExist([questionLastName]);
    if(!questionsExist || questionLastName.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(questionLastName.data.value);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEmail(form: Requests.Form) : Promise<string> {
    const questionEmail: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mY46PB");
    const questionsExist : boolean = checkQuestionsExist([questionEmail]);
    if(!questionsExist || questionEmail.data?.value == null || !validator.default.isEmail(questionEmail.data.value)) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(validator.default.normalizeEmail(questionEmail.data.value).toString());
}

/**
 *  Attempts to parse the answers in the form into a person entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToPerson(form: Requests.Form): Promise<Responses.Person> {
    return getBirthName(form)
        .then(birthNameResponse => {
            return getLastName(form)
                .then(lastNameResponse => {
                    return getEmail(form)
                        .then(emailResponse => {
                            return ormP
                                .createPerson({
                                    firstname : birthNameResponse,
                                    lastname : lastNameResponse,
                                    email : emailResponse
                                })
                                .then(person => Promise.resolve({
                                    person_id : person.person_id,
                                    firstname : person.firstname,
                                    lastname : person.lastname,
                                    email : emailResponse
                                }));
                        })
                })
        })
}

/* parse form to student
***********************/

/**
 *  Parse the form to the pronouns of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getPronouns(form: Requests.Form) : Promise<string[]> {
    const questionPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3yJQMg");
    const questionPreferedPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3X4aLg");
    const questionEnterPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w8ZBq5");

    const questionsExist : boolean = checkQuestionsExist([questionPronouns, questionPreferedPronouns, questionEnterPronouns]);
    if(!questionsExist || questionPronouns.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let pronouns: string[] = [];

    const wordInAnswer :  Responses.FormResponse<boolean> = checkWordInAnswer(questionPronouns.data, "yes");

    if(wordInAnswer.data == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(wordInAnswer) {
        const chosenOption : Responses.FormResponse<Requests.Option> = filterChosenOption(questionPreferedPronouns.data as Requests.Question);
        if(chosenOption.data == null || chosenOption.data?.id.length === 0 || questionPreferedPronouns.data?.value == null || checkWordInAnswer(questionPreferedPronouns.data, "other").data == null) {
            return Promise.reject(util.errors.cookArgumentError());
        } else if(!checkWordInAnswer(questionPreferedPronouns.data, "other").data && chosenOption.data?.text != undefined) {
            pronouns = chosenOption.data.text.split("/");
        } else {
            if(questionEnterPronouns.data?.value == null) {
                return Promise.reject(util.errors.cookArgumentError());
            }
            pronouns = questionEnterPronouns.data.value.split("/");
        }
    }

    return Promise.resolve(pronouns);
}

/**
 *  Parse the form to the gender of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getGender(form: Requests.Form) : Promise<string> {
    const questionGender: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wg9laO");
    const questionsExist : boolean = checkQuestionsExist([questionGender]);
    if(!questionsExist || questionGender.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let gender;
    const chosenGender : Responses.FormResponse<Requests.Option> = filterChosenOption(questionGender.data);

    if(chosenGender.data == null || chosenGender.data.id.length === 0) {
        return Promise.reject(errors.cookArgumentError());
    } else {
        gender = chosenGender.data.text;
    }

    return Promise.resolve(gender);
}

/**
 *  Parse the form to the phone number of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getPhoneNumber(form: Requests.Form) : Promise<string> {
    const questionPhoneNumber: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wd9MEo");
    const questionsExist : boolean = checkQuestionsExist([questionPhoneNumber]);
    if(!questionsExist || questionPhoneNumber.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(questionPhoneNumber.data.value);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getNickname(form: Requests.Form) : Promise<string | null> {
    const questionCheckNickname: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wME4XM");
    const questionEnterNickname: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mJOPqo");

    const questionsExist : boolean = checkQuestionsExist([questionCheckNickname, questionEnterNickname]);
    if(!questionsExist || questionCheckNickname.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let nickname = null;

    if (checkWordInAnswer(questionCheckNickname.data, "yes")) {
        if(questionEnterNickname.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }
        nickname = questionEnterNickname.data.value;
    }

    return Promise.resolve(nickname);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getAlumni(form: Requests.Form) : Promise<boolean> {
    const questionCheckAlumni: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mVzejJ");

    const questionsExist : boolean = checkQuestionsExist([questionCheckAlumni]);

    if(!questionsExist || questionCheckAlumni.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const wordInAnswer : boolean | null = checkWordInAnswer(questionCheckAlumni.data, "yes").data;

    if(wordInAnswer == null) {
        return Promise.reject(errors.cookArgumentError());
    } else {
        return Promise.resolve(wordInAnswer);
    }
}

/**
 *  Attempts to parse the answers in the form into a student entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToStudent(form: Requests.Form, person: Responses.Person): Promise<Responses.Empty> {
    return getPronouns(form)
        .then(pronounsResponse => {
            return getGender(form)
                .then(genderResponse => {
                    return getPhoneNumber(form)
                        .then(phoneNumberResponse => {
                            return getNickname(form)
                                .then(nicknameResponse => {
                                    return getAlumni(form)
                                        .then(alumniResponse => {
                                            if(nicknameResponse == null) {
                                                return ormSt.createStudent({
                                                    personId : person.person_id,
                                                    gender : genderResponse,
                                                    pronouns : pronounsResponse,
                                                    phoneNumber : phoneNumberResponse,
                                                    nickname : nicknameResponse,
                                                    alumni : alumniResponse
                                                }).then(() => Promise.resolve({}));
                                            } else {
                                                return ormSt.createStudent({
                                                    personId : person.person_id,
                                                    gender : genderResponse,
                                                    pronouns : pronounsResponse,
                                                    phoneNumber : phoneNumberResponse,
                                                    alumni : alumniResponse
                                                }).then(() => Promise.resolve({}));
                                            }
                                        });
                                });
                        });
                });
        });
}

/**
 *  Attempts to parse the answers in the form into a job application entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
/*function jsonToJobApplication(form: Requests.Form, student:
Responses.Student): Promise<Responses.Empty> {
    // The volunteer info of the student
    const questionVolunteerInfo: Requests.Question =
        filterQuestion(form, "question_wvPZM0");

    let volunteerInfo : string = "";

    if(questionVolunteerInfo.options !== undefined) {
        volunteerInfo = questionVolunteerInfo.options?.filter(option =>
option.id === questionVolunteerInfo.value)[0].text;
    }

    // The responsibilities of the student
    const responsibilities: string | null =
        filterQuestion(form, "question_wLPr9v").value;

    // A fun fact of this student
    const funFact : string | null = filterQuestion(form, "question_nPzxpV").value;

    // Does this student want to be a student-coach
    const questionStudentCoach: Requests.Question =
        filterQuestion(form, "question_nPzxD5");

    let studentCoach : Boolean = false;

    if(questionStudentCoach.options !== undefined && questionStudentCoach.value !== null && questionStudentCoach.value === "2055442c-a9a6-429d-9ada-045078295f86") {
        studentCoach = true;
    }

    // The educations of the student
    const questionStudentCoach: Requests.Question =
        filterQuestion(form, "question_nPzxD5");

    let studentCoach : Boolean = false;

    if(questionStudentCoach.options !== undefined && questionStudentCoach.value !== null && questionStudentCoach.value === "2055442c-a9a6-429d-9ada-045078295f86") {
        studentCoach = true;
    }
}*/


/**
 *  Attempts to create a new form in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
/*async function createForm(req: express.Request): Promise<Responses.Empty> {
  return rq.parseFormRequest(req).then(async form => {
    // Checks if the student will be in Belgium in July and if the student can
    // work enough in July.
    if (!checkWordInAnswer(filterQuestion(form, "question_wkNolR")) ||
        !checkWordInAnswer(filterQuestion(form, "question_mKVEz8"))) {
      return Promise.reject(util.errors.cookNonJSON("Invalid json"));
    }

    return jsonToPerson(form)
        .then(person => { return jsonToStudent(form, person); })
        .then(() => { return Promise.resolve({}); });
  });
}*/

/**
 *  Gets the router for all `/form/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/form/`
 *  endpoints.
 */
export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  /*router.post('/',
              (req, res) => util.respOrErrorNoReinject(res, createForm(req)));*/

  util.addAllInvalidVerbs(router, [ "/" ]);

  return router;
}

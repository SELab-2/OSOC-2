import express from 'express';

import * as ormP from '../orm_functions/person';
import * as ormSt from '../orm_functions/student';
import * as rq from '../request';
import {Requests, Responses} from '../types';
import * as util from "../utility";

/**
 *  This function searches a question with a given key in the form.
 *  @param form The form with the answers.
 *  @returns The question that corresponds with the given key.
 */
function filterQuestion(form: Requests.Form, key: string): Requests.Question {
  return form.data.fields.filter(question => question.key == key)[0];
}

/**
 *  This function checks if the answer on a certain question is 'yes' or 'no'.
 *  @param question The question with 'yes' and 'no' as possible answers.
 *  @returns A boolean that answers the question.
 */
function checkYesAnswer(question: Requests.Question): Boolean {
  if (question.options !== undefined) {
    return question.options.filter(option => option.id === question.value)[0]
        .text.toLowerCase()
        .includes("yes");
  }
  return false;
}

/**
 *  Attempts to parse the answers in the form into a person entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function jsonToPerson(form: Requests.Form) : Promise<Responses.Person> {
  let questionBirthName: Requests.Question =
      filterQuestion(form, "question_npDErJ");
  let questionLastName: Requests.Question =
      filterQuestion(form, "question_319eXp");
  let questionEmail: Requests.Question =
      filterQuestion(form, "question_mY46PB");

  if(questionBirthName.value == null || questionLastName.value == null || questionEmail.value == null) {
      return Promise.reject(util.errors.cookArgumentError());
  }

  // TODO check email

  return ormP
      .createPerson({
        firstname : questionBirthName.value,
        lastname : questionLastName.value,
        email : questionEmail.value
      }).then(person => {
          return Promise.resolve({
              person_id: person.person_id,
              firstname: person.firstname,
              lastname: person.lastname,
              email: questionEmail.value
          })
      });
}

/**
 *  Attempts to parse the answers in the form into a student entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function jsonToStudent(form: Requests.Form, person: Responses.Person): Promise<Responses.Empty> {
    // The pronouns of this student
    const questionAddPronouns: Requests.Question =
        filterQuestion(form, "question_3yJQMg");
    const questionPreferedPronouns: Requests.Question =
        filterQuestion(form, "question_3X4aLg");
    const questionEnterPronouns: Requests.Question =
        filterQuestion(form, "question_w8ZBq5");

    let pronouns : string[] = [];

    if(checkYesAnswer(questionAddPronouns) && questionPreferedPronouns.options !== undefined) {
        const chosenValue = questionPreferedPronouns.options?.filter(option => option.id === questionPreferedPronouns.value)[0];
        if(chosenValue.text !== "other") {
            pronouns = chosenValue.text.split("/");
        } else {
            pronouns = questionEnterPronouns.value.split("/");
        }
    }

    // The gender of this student
    const questionGender: Requests.Question =
        filterQuestion(form, "question_wg9laO");
    let gender: string = "";
    if (questionGender.options !== undefined) {
      gender = questionGender.options
                   .filter(option => option.id === questionGender.value)[0]
                   .text;
    }

    // The phone number of this student
    const questionPhoneNumber: Requests.Question =
        filterQuestion(form, "question_wd9MEo");
    const phoneNumber = questionPhoneNumber.value;

    // The nickname of this student
    const questionCheckNicknamePronouns: Requests.Question =
        filterQuestion(form, "question_wME4XM");
    const questionEnterNicknamePronouns: Requests.Question =
        filterQuestion(form, "question_mJOPqo");

    let nickname;

    if(checkYesAnswer(questionCheckNicknamePronouns)) {
        nickname = questionEnterNicknamePronouns.value;
    }

    // Checks if this student has participated before
    const questionAlumni: Requests.Question =
        filterQuestion(form, "question_mVzejJ");
    let alumni = false;

    if(questionAlumni.options !== undefined) {
        alumni = questionAlumni.options?.filter(option => option.id === questionAlumni.value)[0].text.includes("yes");
    }

    return ormSt
        .createStudent({
            personId : person.person_id,
            gender : gender,
            pronouns : pronouns,
            phoneNumber : phoneNumber,
            nickname : nickname,
            alumni : alumni
        })
        .then(() => { return Promise.resolve({}); });
}



/**
 *  Attempts to create a new form in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function createForm(req: express.Request):
    Promise<Responses.Empty> {
    return rq.parseFormRequest(req).then(async form => {
        // Checks if the student will be in Belgium in July and if the student can work enough in July.
        if(!checkYesAnswer(filterQuestion(form, "question_wkNolR")) || !checkYesAnswer(filterQuestion(form, "question_mKVEz8"))) {
            return Promise.reject(util.errors.cookNonJSON("Invalid json"));
        }

        // TODO kan je 128 uur werken
        // TODO gender verandert naar student

        return jsonToPerson(form)
            .then(person => {
                return jsonToStudent(form, person);
            })
            .then(() => {
                return Promise.resolve({});
            });
    });
}

/**
 *  Gets the router for all `/form/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/form/`
 *  endpoints.
 */
export function getRouter(): express.Router {
  let router: express.Router = express.Router();

  router.post('/',
        (req, res) => util.respOrErrorNoReinject(res, createForm(req)));

  util.addAllInvalidVerbs(router, [ "/" ]);

  return router;
}

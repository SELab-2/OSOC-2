import express from 'express';

import * as ormP from '../orm_functions/person';
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
 *  Checks if the student will be in Belgium in July.
 *  @param form The form with the answers.
 *  @returns A boolean that answers the question.
 */
function checkInBelgium(form: Requests.Form): Boolean {
  return checkYesAnswer(filterQuestion(form, "question_wkNolR"));
}

/**
 *  Checks if the student can work enough in July.
 *  @param form The form with the answers.
 *  @returns A boolean that answers the question.
 */
function checkCanWorkJuly(form: Requests.Form): Boolean {
  return checkYesAnswer(filterQuestion(form, "question_mKVEz8"));
}

/**
 *  Attempts to parse the answers in the form into a person entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function jsonToPerson(form: Requests.Form): Promise<Responses.Empty> {
  let questionBirthName: Requests.Question =
      filterQuestion(form, "question_npDErJ");
  let questionLastName: Requests.Question =
      filterQuestion(form, "question_319eXp");
  let questionEmail: Requests.Question =
      filterQuestion(form, "question_mY46PB");
  // TODO check email
  /*let questionGender: Requests.Question =
      filterQuestion(form, "question_wg9laO");
  let gender: string = "";
  if (questionGender.options !== undefined) {
    gender = questionGender.options
                 .filter(option => option.id === questionGender.value)[0]
                 .text;
  }*/

  return ormP
      .createPerson({
        firstname : questionBirthName.value,
        lastname : questionLastName.value,
        email : questionEmail.value
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
        if(!checkInBelgium(form) || !checkCanWorkJuly(form)) {
            return Promise.reject(util.errors.cookNonJSON("Invalid json"));
        }

        // TODO kan je 128 uur werken
        // TODO gender verandert naar student

        return jsonToPerson(form)
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

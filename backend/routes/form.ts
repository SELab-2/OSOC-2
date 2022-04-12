/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';

import * as ormP from '../orm_functions/person';
import * as ormSt from '../orm_functions/student';
import * as ormOs from '../orm_functions/osoc';
import * as ormJo from '../orm_functions/job_application';
import * as ormJoSk from '../orm_functions/job_application_skill';
import * as ormLa from '../orm_functions/language';
import * as ormAtt from '../orm_functions/attachment';
import * as ormRo from '../orm_functions/role';
import * as ormAppRo from '../orm_functions/applied_role';
import {Requests, Responses} from '../types';
import * as util from "../utility";
import {errors} from "../utility";
import {type_enum} from "@prisma/client";
import * as validator from 'validator';
import * as rq from '../request';
import {getLanguageByName} from "../orm_functions/language";

/**
 *  This function searches a question with a given key in the form.
 *  @param form The form with the answers.
 *  @param key The key of the question.
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
 *  @param word the word we are searching for in the answer.
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
    console.log("end of getBirthname");
    return Promise.resolve(questionBirthName.data.value as string);
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
    console.log("end of getLastName");

    return Promise.resolve(questionLastName.data.value as string);
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
    if(!questionsExist || questionEmail.data?.value == null || !validator.default.isEmail(questionEmail.data.value as string)) {
        return Promise.reject(errors.cookArgumentError());
    }
    console.log("end of getEmail");

    return Promise.resolve(validator.default.normalizeEmail(questionEmail.data.value as string).toString());
}

/**
 *  Attempts to parse the answers in the form into a person entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToPerson(form: Requests.Form): Promise<Responses.Id> {
    const birthName = await getBirthName(form);
    const lastName = await getLastName(form);
    const email = await getEmail(form);

    const allPersons = await ormP.getAllPersons();

    const checkIfEmailInDb = allPersons.filter(person => person.email === email);

    let personId;

    if(checkIfEmailInDb.length > 0) {
        await ormP.updatePerson({
            personId : checkIfEmailInDb[0].person_id,
            firstname : birthName,
            lastname : lastName,
            github : null,
            email : email
        });
        personId = checkIfEmailInDb[0].person_id;
    } else {
        const person = await ormP.createPerson({firstname : birthName, lastname : lastName, email : email});
        personId = person.person_id;
    }

    console.log("end of jsonToPerson");

    return Promise.resolve({id: personId});
}

/* parse form to student
************************/

/**
 *  Parse the form to the pronouns of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getPronouns(form: Requests.Form) : Promise<string[] | null> {
    const questionPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3yJQMg");
    const questionPreferredPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3X4aLg");
    const questionEnterPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w8ZBq5");

    const questionsExist : boolean = checkQuestionsExist([questionPronouns, questionPreferredPronouns, questionEnterPronouns]);
    if(!questionsExist || questionPronouns.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let pronouns: string[] = [];

    const wordInAnswer :  Responses.FormResponse<boolean> = checkWordInAnswer(questionPronouns.data, "yes");

    if(wordInAnswer.data == null) {
        return Promise.resolve([]);
    }

    if(wordInAnswer.data) {
        const chosenOption : Responses.FormResponse<Requests.Option> = filterChosenOption(questionPreferredPronouns.data as Requests.Question);
        if(chosenOption.data == null || chosenOption.data?.id.length === 0 || questionPreferredPronouns.data?.value == null || checkWordInAnswer(questionPreferredPronouns.data, "other").data == null) {
            return Promise.reject(util.errors.cookArgumentError());
        } else if(!checkWordInAnswer(questionPreferredPronouns.data, "other").data && chosenOption.data?.text != undefined) {
            pronouns = chosenOption.data.text.split("/");
        } else {
            if(questionEnterPronouns.data?.value == null) {
                return Promise.reject(util.errors.cookArgumentError());
            }
            const value = questionEnterPronouns.data.value as string;
            pronouns = value.split("/");
        }
    }
    console.log("end of getPronouns");

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

    const chosenGender : Responses.FormResponse<Requests.Option> = filterChosenOption(questionGender.data);

    if(chosenGender.data == null || chosenGender.data.id.length === 0) {
        return Promise.reject(errors.cookArgumentError());
    }
    console.log("end of getGender");

    return Promise.resolve(chosenGender.data.text);
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

    console.log("end of getPhoneNumber");

    return Promise.resolve(questionPhoneNumber.data.value as string);
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
    const addNickName = checkWordInAnswer(questionCheckNickname.data, "yes");
    console.log(addNickName);
    if (addNickName.data != null && addNickName.data) {
        if(questionEnterNickname.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }
        nickname = questionEnterNickname.data.value as string;
    }

    console.log("end of getNickname");

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
    }

    console.log("end of getAlumni");

    return Promise.resolve(wordInAnswer);
}

/**
 *  Attempts to parse the answers in the form into a student entity.
 *  @param form The form with the answers.
 *  @param personId The id of a person.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToStudent(form: Requests.Form, personId: Responses.Id): Promise<Responses.Id_alumni> {
    const pronouns = await getPronouns(form);
    const gender = await getGender(form);
    const phoneNumber = await getPhoneNumber(form);
    const nickname = await getNickname(form);
    const alumni = await getAlumni(form);

    const allStudents = await ormSt.getAllStudents();

    const checkIfIdInDb = allStudents.filter(student => student.person_id === personId.id);

    let studentId;

    if(checkIfIdInDb.length > 0) {
        await ormSt.updateStudent({
            studentId : checkIfIdInDb[0].student_id,
            gender : gender,
            pronouns : pronouns == null ? [] : pronouns,
            phoneNumber : phoneNumber,
            nickname : nickname,
            alumni : alumni
        })
        studentId = checkIfIdInDb[0].student_id;
    } else {
        const student = await ormSt.createStudent({
            personId : personId.id,
            gender : gender,
            pronouns : pronouns != null ? pronouns : undefined,
            phoneNumber : phoneNumber,
            nickname : nickname != null ? nickname : undefined,
            alumni : alumni
        });
        studentId = student.student_id;
    }

    console.log("end of jsonToStudent");

    return Promise.resolve({id: studentId, hasAlreadyTakenPart: alumni});
}

/* parse form to job application
********************************/

/**
 *  Parse the form to the responsibilities of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getResponsibilities(form: Requests.Form) : Promise<string | null> {
    const questionCheckResponsibilities: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wLPr9v");

    const questionsExist : boolean = checkQuestionsExist([questionCheckResponsibilities]);

    if(!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(questionCheckResponsibilities.data?.value == undefined) {
        return Promise.resolve(null);
    }

    console.log("end of getResponsibilities");


    return Promise.resolve(questionCheckResponsibilities.data?.value as string);
}

/**
 *  Parse the form to the fun fact of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getFunFact(form: Requests.Form) : Promise<string> {
    const questionFunFact: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nPzxpV");

    const questionsExist : boolean = checkQuestionsExist([questionFunFact]);

    if(!questionsExist || questionFunFact.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }


    console.log("end of getFunFact");

    return Promise.resolve(questionFunFact.data.value as string);
}

/**
 *  Parse the form to the volunteer info of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getVolunteerInfo(form: Requests.Form) : Promise<string> {
    const questionCheckVolunteerInfo: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wvPZM0");

    const questionsExist : boolean = checkQuestionsExist([questionCheckVolunteerInfo]);

    if(!questionsExist || questionCheckVolunteerInfo.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenVolunteerInfo : Responses.FormResponse<Requests.Option> = filterChosenOption(questionCheckVolunteerInfo.data);

    if(chosenVolunteerInfo.data == null || chosenVolunteerInfo.data.id.length === 0) {
        return Promise.reject(errors.cookArgumentError());
    }

    console.log("end of getVolunteerInfo");


    return Promise.resolve(chosenVolunteerInfo.data.text);
}

/**
 *  Parse the form to the choice of being a student coach.
 *  @param form The form with the answers.
 *  @param hasAlreadyParticipated true if the student from the job application has already taken part in osoc previous years
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function isStudentCoach(form: Requests.Form, hasAlreadyParticipated: boolean) : Promise<boolean | null> {
    if (hasAlreadyParticipated) {
        const questionStudentCoach: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nPzxD5");

        const questionsExist : boolean = checkQuestionsExist([questionStudentCoach]);

        if(!questionsExist || questionStudentCoach.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }

        const wordInAnswer : boolean | null = checkWordInAnswer(questionStudentCoach.data, "yes").data;

        if(wordInAnswer == null) {
            return Promise.reject(errors.cookArgumentError());
        }

        console.log("end of isStudentCoach");

        return Promise.resolve(wordInAnswer);
    }
    return Promise.resolve(null);
}

/**
 *  Parse the form to the educations of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducations(form: Requests.Form) : Promise<string[]> {
    const questionCheckEducations: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3ExRK4");

    const questionsExist : boolean = checkQuestionsExist([questionCheckEducations]);

    if(!questionsExist || questionCheckEducations.data?.value == null ||
        questionCheckEducations.data.value.length === 0 || questionCheckEducations.data.value.length > 2) {
        return Promise.reject(errors.cookArgumentError());
    }

    const educations : string[] = [];

    for(let i = 0; i < questionCheckEducations.data.value.length; i++) {
        if(questionCheckEducations.data.options != undefined) {
            const filteredOption = questionCheckEducations.data.options.filter(option => option.id === questionCheckEducations.data?.value[i]);
            if(filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if(filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nro45N");
                const questionsExistOther : boolean = checkQuestionsExist([questionCheckOther]);

                if(!questionsExistOther || questionCheckOther.data?.value == null) {
                    return Promise.reject(errors.cookArgumentError());
                }

                educations.push(questionCheckOther.data.value as string);
            } else {
                educations.push(filteredOption[0].text);
            }
        }
    }

    console.log("end of getEducations");


    return Promise.resolve(educations);
}

/**
 *  Parse the form to the education levels of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationLevel(form: Requests.Form) : Promise<string[]> {
    const questionCheckEducationLevel: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w4K6BX");

    const questionsExist : boolean = checkQuestionsExist([questionCheckEducationLevel]);

    if(!questionsExist || questionCheckEducationLevel.data?.value == null ||
        questionCheckEducationLevel.data.value.length === 0 || questionCheckEducationLevel.data.value.length > 2) {
        return Promise.reject(errors.cookArgumentError());
    }

    const educationLevels : string[] = [];

    for(let i = 0; i < questionCheckEducationLevel.data.value.length; i++) {
        if(questionCheckEducationLevel.data.options != undefined) {
            const filteredOption = questionCheckEducationLevel.data.options.filter(option => option.id === questionCheckEducationLevel.data?.value[i]);
            if(filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if(filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3jlRba");
                const questionsExistOther : boolean = checkQuestionsExist([questionCheckOther]);

                if(!questionsExistOther || questionCheckOther.data?.value == null) {
                    return Promise.reject(errors.cookArgumentError());
                }

                educationLevels.push(questionCheckOther.data.value as string);
            } else {
                educationLevels.push(filteredOption[0].text);
            }
        }
    }

    console.log("end of getEducationLevel");


    return Promise.resolve(educationLevels);
}

/**
 *  Parse the form to the duration of the education of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationDuration(form: Requests.Form) : Promise<number> {
    const questionEducationDuration: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w2KWBj");

    const questionsExist : boolean = checkQuestionsExist([questionEducationDuration]);

    if(!questionsExist || questionEducationDuration.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    console.log("end of getEducationDuration");


    return Promise.resolve(Number(questionEducationDuration.data.value));
}

/**
 *  Parse the form to the current year of the education of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationYear(form: Requests.Form) : Promise<string> {
    const questionEducationYear: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3xJqjr");

    const questionsExist : boolean = checkQuestionsExist([questionEducationYear]);

    if(!questionsExist || questionEducationYear.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionEducationYear.data.value as string);
}

/**
 *  Parse the form to the university of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationUniversity(form: Requests.Form) : Promise<string> {
    const questionEducationUniversity: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mRDNdd");

    const questionsExist : boolean = checkQuestionsExist([questionEducationUniversity]);

    if(!questionsExist || questionEducationUniversity.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    console.log("end of getEducationUniversity");


    return Promise.resolve(questionEducationUniversity.data.value as string);
}

/**
 *  Attempts to parse the answers in the form into a job application entity.
 *  @param form The form with the answers.
 *  @param student_id The student id object.
 *  @param hasAlreadyTakenPart true if the student has already taken part in osoc in a prev edition
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToJobApplication(form: Requests.Form, student_id: Responses.Id, hasAlreadyTakenPart: boolean): Promise<Responses.Id> {
    const studentId = student_id.id;
    const responsibilities = await getResponsibilities(form);
    const funFact = await getFunFact(form);
    const volunteerInfo = await getVolunteerInfo(form);
    const studentCoach = await isStudentCoach(form, hasAlreadyTakenPart);
    const latestOsoc = await ormOs.getLatestOsoc();
    if(latestOsoc == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    const osocId = latestOsoc.osoc_id;
    const educations = await getEducations(form);
    const educationLevel = await getEducationLevel(form);
    const educationDuration = await getEducationDuration(form);
    const educationYear = await getEducationYear(form);
    const educationInstitute = await getEducationUniversity(form);
    const emailStatus = "NONE";
    let createdAt = new Date(Date.now()).toString();
    if(form.createdAt != undefined) {
        createdAt = form.createdAt;
    }

    const jobApplication = await ormJo.createJobApplication({
        studentId : studentId,
        responsibilities : responsibilities,
        funFact : funFact,
        studentVolunteerInfo : volunteerInfo,
        studentCoach : studentCoach == null ? false : studentCoach,
        osocId : osocId,
        edus : educations,
        eduLevel : educationLevel,
        eduDuration : educationDuration,
        eduYear : educationYear,
        eduInstitute : educationInstitute,
        emailStatus : emailStatus,
        createdAt : createdAt
    });

    console.log("end of jsontojobapplication");

    return Promise.resolve({id: jobApplication.job_application_id});
}

/* parse form to job application skills
***************************************/

/**
 *  Parse the form to the most fluent language of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getMostFluentLanguage(form: Requests.Form) : Promise<string> {
    const questionMostFluentLanguage: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_n0e9dy");

    const questionsExist : boolean = checkQuestionsExist([questionMostFluentLanguage]);

    if(!questionsExist || questionMostFluentLanguage.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenLanguage : Responses.FormResponse<Requests.Option> = filterChosenOption(questionMostFluentLanguage.data);

    if(chosenLanguage.data == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let language = "";

    if(chosenLanguage.data.text.includes("Other")) {
        const questionCheckOther: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wz79jR");
        const questionsExistOther : boolean = checkQuestionsExist([questionCheckOther]);

        if(!questionsExistOther || questionCheckOther.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }

        language = questionCheckOther.data.value as string;
    } else {
        language = chosenLanguage.data.text;
    }

    console.log("end of getmostfluentlanguages");


    return Promise.resolve(language);
}

/**
 *  Parse the form to the english level of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEnglishLevel(form: Requests.Form) : Promise<number> {
    const questionEnglishLevel: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w5Z7bo");

    const questionsExist : boolean = checkQuestionsExist([questionEnglishLevel]);

    if(!questionsExist || questionEnglishLevel.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenLanguage : Responses.FormResponse<Requests.Option> = filterChosenOption(questionEnglishLevel.data);

    if(chosenLanguage.data == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(chosenLanguage.data.text.toLowerCase().includes("★★★★★")) {
        return Promise.resolve(5);
    } else if(chosenLanguage.data.text.toLowerCase().includes("★★★★")) {
        return Promise.resolve(4);
    } else if(chosenLanguage.data.text.toLowerCase().includes("★★★")) {
        return Promise.resolve(3);
    } else if(chosenLanguage.data.text.toLowerCase().includes("★★")) {
        return Promise.resolve(2);
    }

    console.log("end of getEnglishlevel");

    return Promise.resolve(1);
}

/**
 *  Parse the form to the best skill this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getBestSkill(form: Requests.Form) : Promise<string> {
    const questionBestSkill: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mO72l7");

    const questionsExist : boolean = checkQuestionsExist([questionBestSkill]);

    if(!questionsExist || questionBestSkill.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    console.log("end of getBestSkill");


    return Promise.resolve(questionBestSkill.data.value as string);
}

/**
 *  Attempts to parse the answers in the form into job application skills entities.
 *  @param form The form with the answers.
 *  @param job_applicationId The job_application id object.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToSkills(form: Requests.Form, job_applicationId: Responses.Id): Promise<Responses.Empty> {
    const job_application_id = job_applicationId.id;
    const most_fluent_language = await getMostFluentLanguage(form);
    const english_level = await getEnglishLevel(form);
    const best_skill = await getBestSkill(form);

    let most_fl_la_id;
    const getMostFluentLanguageInDb = await getLanguageByName(most_fluent_language);
    if(getMostFluentLanguageInDb == null) {
        const most_fl_la = await ormLa.createLanguage(most_fluent_language);
        most_fl_la_id = most_fl_la.language_id;
    } else {
        most_fl_la_id = getMostFluentLanguageInDb.language_id;
    }

    await ormJoSk.createJobApplicationSkill({
        jobApplicationId : job_application_id,
        skill : null,
        languageId : most_fl_la_id,
        level : null,
        isPreferred : true,
        isBest : false
    });

    let english_id;
    const getEnglishLanguage = await getLanguageByName("English");
    if(getEnglishLanguage == null) {
        const english_language = await ormLa.createLanguage("English");
        english_id = english_language.language_id;
    } else {
        english_id = getEnglishLanguage.language_id;
    }

    await ormJoSk.createJobApplicationSkill({
        jobApplicationId : job_application_id,
        skill : null,
        languageId : english_id,
        level : english_level,
        isPreferred : false,
        isBest : false
    });

    await ormJoSk.createJobApplicationSkill({
        jobApplicationId : job_application_id,
        skill : best_skill,
        languageId : null,
        level : null,
        isPreferred : false,
        isBest : true
    });

    console.log("end of jsonToSkills");


    return Promise.resolve({});
}

/* parse form to attachments
****************************/

/**
 *  Parse the form to the cv of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getCV(form: Requests.Form) : Promise<Responses.FormAttachmentResponse> {
    const questionCVUpload: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mD78BR");
    const questionCVLink: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3l6GBk");

    const questionsExist : boolean = checkQuestionsExist([questionCVUpload, questionCVLink]);

    const links : string[] = [];
    const types : type_enum[] = [];

    if(!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }
    // TODO: don't put empty arrays in the database (same for portfolio and motivation)
    if(questionCVUpload.data?.value == null && questionCVLink.data?.value == null) {
        return Promise.resolve({data: [], types: []});
    }

    if(questionCVLink.data?.value != null) {
        links.push(questionCVLink.data?.value as string);
        types.push("CV_URL");
    }

    if(questionCVUpload.data?.value != null) {
        for(let linkIndex = 0; linkIndex < questionCVUpload.data?.value.length; linkIndex++) {
            if((questionCVUpload.data?.value[linkIndex] as Requests.FormValues).url == undefined) {
                return Promise.reject(errors.cookArgumentError());
            }

            links.push((questionCVUpload.data?.value[linkIndex] as Requests.FormValues).url);
            types.push("CV_URL");
        }
    }

    console.log("end of getCV");


    return Promise.resolve({data : links, types : types});
}

/**
 *  Parse the form to the portfolio of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getPortfolio(form: Requests.Form) : Promise<Responses.FormAttachmentResponse> {
    const questionPortfolioUpload: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mRDNx9");
    const questionPortfolioLink: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wo2PEP");

    const questionsExist : boolean = checkQuestionsExist([questionPortfolioUpload, questionPortfolioLink]);

    const links : string[] = [];
    const types : type_enum[] = [];

    if(!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(questionPortfolioUpload.data?.value == null && questionPortfolioLink.data?.value == null) {
        return Promise.resolve({data: [], types: []});
    }

    if(questionPortfolioLink.data?.value != null) {
        links.push(questionPortfolioLink.data?.value as string);
        types.push("PORTFOLIO_URL");
    }

    if(questionPortfolioUpload.data?.value != null) {
        for(let linkIndex = 0; linkIndex < questionPortfolioUpload.data?.value.length; linkIndex++) {
            if((questionPortfolioUpload.data?.value[linkIndex] as Requests.FormValues).url == undefined) {
                return Promise.reject(errors.cookArgumentError());
            }
            links.push((questionPortfolioUpload.data?.value[linkIndex] as Requests.FormValues).url);
            types.push("PORTFOLIO_URL");
        }
    }

    console.log("end of getPortfolio");


    return Promise.resolve({data : links, types : types});
}

/**
 *  Parse the form to the motivation of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getMotivation(form: Requests.Form) : Promise<Responses.FormAttachmentResponse> {
    const questionMotivationUpload: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nGRG6Z");
    const questionMotivationLink: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mO72aR");
    const questionMotivationString: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mVzeGg");

    const questionsExist : boolean = checkQuestionsExist([questionMotivationUpload, questionMotivationLink, questionMotivationString]);

    const data : string[] = [];
    const types : type_enum[] = [];

    if(!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(questionMotivationUpload.data?.value == null && questionMotivationLink.data?.value == null && questionMotivationString.data?.value == null) {
        return Promise.resolve({data: [], types: []});
    }

    if(questionMotivationLink.data?.value != null) {
        data.push(questionMotivationLink.data?.value as string);
        types.push("MOTIVATION_URL");
    }

    if(questionMotivationUpload.data?.value != null) {
        for(let linkIndex = 0; linkIndex < questionMotivationUpload.data?.value.length; linkIndex++) {
            if((questionMotivationUpload.data?.value[linkIndex] as Requests.FormValues).url == undefined) {
                return Promise.reject(errors.cookArgumentError());
            }
            data.push((questionMotivationUpload.data?.value[linkIndex] as Requests.FormValues).url);
            types.push("MOTIVATION_URL");
        }
    }

    if(questionMotivationString.data?.value != null) {
        data.push(questionMotivationString.data?.value as string);
        types.push("MOTIVATION_URL");
    }

    console.log("end of getMotivation");


    return Promise.resolve({data : data, types : types});
}

/**
 *  Attempts to parse the answers in the form into attachment entities.
 *  @param form The form with the answers.
 *  @param job_applicationId The job_application id object.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToAttachments(form: Requests.Form, job_applicationId: Responses.Id): Promise<Responses.Empty> {
    const job_application_id = job_applicationId.id;
    const cv_links = await getCV(form);
    const portfolio_links = await getPortfolio(form);
    const motivations = await getMotivation(form);

    await ormAtt.createAttachment(job_application_id, cv_links.data, cv_links.types);
    await ormAtt.createAttachment(job_application_id, portfolio_links.data, portfolio_links.types);
    await ormAtt.createAttachment(job_application_id, motivations.data, motivations.types);

    console.log("end of jsonToAttachment");


    return Promise.resolve({});
}

/* parse form to applied roles
******************************/

/**
 *  Parse the form to the roles of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getAppliedRoles(form: Requests.Form) : Promise<string[]> {
    const questionAppliedRoles: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wo2PDe");

    const questionsExist : boolean = checkQuestionsExist([questionAppliedRoles]);

    if(!questionsExist || questionAppliedRoles.data?.value == null ||
        questionAppliedRoles.data.value.length === 0 || questionAppliedRoles.data.value.length > 2) {
        return Promise.reject(errors.cookArgumentError());
    }

    const appliedRoles : string[] = [];

    for(let i = 0; i < questionAppliedRoles.data.value.length; i++) {
        if(questionAppliedRoles.data.options != undefined) {
            const filteredOption = questionAppliedRoles.data.options.filter(option => option.id === questionAppliedRoles.data?.value[i]);
            if(filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if(filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nGRGKp");
                const questionsExistOther : boolean = checkQuestionsExist([questionCheckOther]);

                if(!questionsExistOther || questionCheckOther.data?.value == null) {
                    return Promise.reject(errors.cookArgumentError());
                }

                appliedRoles.push(questionCheckOther.data.value as string);
            } else {
                appliedRoles.push(filteredOption[0].text);
            }
        }
    }


    console.log("end of getAppliedRole");

    return Promise.resolve(appliedRoles);
}

/**
 *  Attempts to parse the answers in the form into role entities.
 *  @param form The form with the answers.
 *  @param job_applicationId The job_application id object.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToRoles(form: Requests.Form, job_applicationId: Responses.Id): Promise<Responses.Empty> {
    const job_application_id = job_applicationId.id;
    const roles = await getAppliedRoles(form);

    for(let role_index = 0; role_index < roles.length; role_index++) {
        const role_exists = await ormRo.getRolesByName(roles[role_index]);
        if(role_exists == null) {
            const created_role = await ormRo.createRole(roles[role_index]);
            await ormAppRo.createAppliedRole({jobApplicationId : job_application_id, roleId : created_role.role_id});
        } else {
            await ormAppRo.createAppliedRole({jobApplicationId : job_application_id, roleId : role_exists.role_id});
        }
    }

    console.log("end of jsonToRoles");


    return Promise.resolve({});
}

/**
 *  Attempts to create a new form in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function createForm(req: express.Request): Promise<Responses.Empty> {
    console.log(req.body);
    const parsedRequest = await rq.parseFormRequest(req);
    if (parsedRequest.data == null || parsedRequest.eventId == null
        || parsedRequest.eventType == null || parsedRequest.createdAt == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const questionInBelgium: Responses.FormResponse<Requests.Question> = filterQuestion(parsedRequest, "question_wkNolR");
    const questionCanWorkEnough: Responses.FormResponse<Requests.Question> = filterQuestion(parsedRequest, "question_mKVEz8");

    const questionsExist : boolean = checkQuestionsExist([questionInBelgium, questionCanWorkEnough]);
    if(!questionsExist || questionInBelgium.data?.value == null || questionCanWorkEnough.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const wordInAnswerInBelgium :  Responses.FormResponse<boolean> = checkWordInAnswer(questionInBelgium.data, "yes");
    const wordInAnswerCanWorkEnough :  Responses.FormResponse<boolean> = checkWordInAnswer(questionCanWorkEnough.data, "yes");

    if(wordInAnswerInBelgium && wordInAnswerCanWorkEnough) {
        const person = await jsonToPerson(parsedRequest);
        const student = await jsonToStudent(parsedRequest, {id : person.id});
        const jobApplication = await jsonToJobApplication(parsedRequest, {id : student.id}, student.hasAlreadyTakenPart);
        await jsonToSkills(parsedRequest, {id : jobApplication.id});
        await jsonToAttachments(parsedRequest, {id : jobApplication.id});
        await jsonToRoles(parsedRequest, {id : jobApplication.id});
        return Promise.resolve({});
    }



    return Promise.reject(errors.cookArgumentError());
}

/**
 *  Gets the router for all `/form/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/form/`
 *  endpoints.
 */
export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  router.post('/',
              (req, res) => util.respOrErrorNoReinject(res, createForm(req)));

  util.addAllInvalidVerbs(router, [ "/" ]);

  return router;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";

import * as ormP from "../orm_functions/person";
import * as ormLU from "../orm_functions/login_user";
import * as ormSt from "../orm_functions/student";
import * as ormOs from "../orm_functions/osoc";
import * as ormJo from "../orm_functions/job_application";
import * as ormJoSk from "../orm_functions/job_application_skill";
import * as ormLa from "../orm_functions/language";
import * as ormAtt from "../orm_functions/attachment";
import * as ormRo from "../orm_functions/role";
import * as ormAppRo from "../orm_functions/applied_role";
import { Requests, Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import { type_enum } from "@prisma/client";
import * as validator from "validator";
import * as rq from "../request";
import * as config from "./form_keys.json";

/**
 *  This function searches a question with a given key in the form.
 *  @param form The form with the answers.
 *  @param key The key of the question.
 *  @returns The question that corresponds with the given key.
 */
export function filterQuestion(
    form: Requests.Form,
    key: string
): Responses.FormResponse<Requests.Question> {
    const filteredQuestion = form.data.fields.filter(
        (question) => question.key == key
    );
    return filteredQuestion.length > 0
        ? { data: filteredQuestion[0] }
        : { data: null };
}

/**
 *  This function searches the chosen option for a given question.
 *  @param question The question.
 *  @returns The option that corresponds with the given answer.
 */
export function filterChosenOption(
    question: Requests.Question
): Responses.FormResponse<Requests.Option> {
    if (question.options != undefined) {
        const filteredOption = question.options.filter(
            (option) =>
                option.id != undefined &&
                option.text != undefined &&
                option.id === question.value
        );
        if (filteredOption.length === 0) {
            return { data: null };
        }
        return { data: filteredOption[0] };
    }
    return { data: null };
}

/**
 *  This function checks if the answer on a certain question contains a word.
 *  @param question The question.
 *  @param word the word we are searching for in the answer.
 *  @returns True if the question options contain the word, else false.
 */
export function checkWordInAnswer(
    question: Requests.Question,
    word: string
): Responses.FormResponse<boolean> {
    const chosenOption: Responses.FormResponse<Requests.Option> =
        filterChosenOption(question);
    return chosenOption.data != null
        ? { data: chosenOption.data.text.toLowerCase().includes(word) }
        : { data: null };
}

export function checkQuestionsExist(
    questions: Responses.FormResponse<Requests.Question>[]
): boolean {
    const checkErrorInForm: Responses.FormResponse<Requests.Question>[] =
        questions.filter((dataError) => dataError.data == null);
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
export function getBirthName(form: Requests.Form): Promise<string> {
    const questionBirthName: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.birthName);
    const questionsExist: boolean = checkQuestionsExist([questionBirthName]);
    if (!questionsExist || questionBirthName.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionBirthName.data.value as string);
}

/**
 *  Parse the form to the last name of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getLastName(form: Requests.Form): Promise<string> {
    const questionLastName: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.lastName);
    const questionsExist: boolean = checkQuestionsExist([questionLastName]);
    if (!questionsExist || questionLastName.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionLastName.data.value as string);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function getEmail(form: Requests.Form): Promise<string> {
    const questionEmail: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.emailAddress);
    const questionsExist: boolean = checkQuestionsExist([questionEmail]);
    if (
        !questionsExist ||
        questionEmail.data?.value == null ||
        !validator.default.isEmail(questionEmail.data.value as string)
    ) {
        return Promise.reject(errors.cookArgumentError());
    }

    const normalizedEmail = validator.default
        .normalizeEmail(questionEmail.data.value as string)
        .toString();

    const personFound = await ormP.searchPersonByLogin(normalizedEmail);
    if (personFound.length !== 0) {
        const loginUserFound = await ormLU.searchLoginUserByPerson(
            personFound[0].person_id
        );

        if (loginUserFound !== null) {
            return Promise.reject(errors.cookInsufficientRights());
        }
    }

    return Promise.resolve(
        validator.default
            .normalizeEmail(questionEmail.data.value as string)
            .toString()
    );
}

/**
 *  Attempts to parse the answers in the form into a person entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function jsonToPerson(
    form: Requests.Form
): Promise<Responses.FormPerson> {
    const birthName = await getBirthName(form);
    const lastName = await getLastName(form);
    const email = await getEmail(form);

    return Promise.resolve({
        birthName: birthName,
        lastName: lastName,
        email: email,
    });
}

/* parse form to student
 ************************/

/**
 *  Parse the form to the pronouns of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getPronouns(form: Requests.Form): Promise<string | null> {
    const questionPronouns: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.addPronouns);
    const questionPreferredPronouns: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.preferredPronouns);
    const questionEnterPronouns: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.pronounsInput);

    const questionsExist: boolean = checkQuestionsExist([
        questionPronouns,
        questionPreferredPronouns,
        questionEnterPronouns,
    ]);
    if (!questionsExist || questionPronouns.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let pronouns = "";

    const wordInAnswer: Responses.FormResponse<boolean> = checkWordInAnswer(
        questionPronouns.data,
        "yes"
    );

    if (wordInAnswer.data == null) {
        return Promise.resolve(null);
    }

    if (wordInAnswer.data) {
        const chosenOption: Responses.FormResponse<Requests.Option> =
            filterChosenOption(
                questionPreferredPronouns.data as Requests.Question
            );
        if (
            chosenOption.data == null ||
            chosenOption.data?.id.length === 0 ||
            questionPreferredPronouns.data?.value == null ||
            checkWordInAnswer(questionPreferredPronouns.data, "other").data ==
                null
        ) {
            return Promise.reject(util.errors.cookArgumentError());
        } else if (
            !checkWordInAnswer(questionPreferredPronouns.data, "other").data &&
            chosenOption.data?.text != undefined
        ) {
            pronouns = chosenOption.data.text;
        } else {
            if (questionEnterPronouns.data?.value == null) {
                return Promise.resolve(null);
            }
            pronouns = questionEnterPronouns.data.value as string;
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
export function getGender(form: Requests.Form): Promise<string> {
    const questionGender: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.gender);
    const questionsExist: boolean = checkQuestionsExist([questionGender]);
    if (!questionsExist || questionGender.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenGender: Responses.FormResponse<Requests.Option> =
        filterChosenOption(questionGender.data);

    if (chosenGender.data == null || chosenGender.data.id.length === 0) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(chosenGender.data.text);
}

/**
 *  Parse the form to the phone number of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getPhoneNumber(form: Requests.Form): Promise<string> {
    const questionPhoneNumber: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.phoneNumber);
    const questionsExist: boolean = checkQuestionsExist([questionPhoneNumber]);
    if (!questionsExist || questionPhoneNumber.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionPhoneNumber.data.value as string);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getNickname(form: Requests.Form): Promise<string | null> {
    const questionCheckNickname: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.nickname);
    const questionEnterNickname: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.nicknameInput);

    const questionsExist: boolean = checkQuestionsExist([
        questionCheckNickname,
        questionEnterNickname,
    ]);
    if (!questionsExist || questionCheckNickname.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let nickname = null;
    const addNickName = checkWordInAnswer(questionCheckNickname.data, "yes");
    if (addNickName.data != null && addNickName.data) {
        if (questionEnterNickname.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }
        nickname = questionEnterNickname.data.value as string;
    }

    return Promise.resolve(nickname);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getAlumni(form: Requests.Form): Promise<boolean> {
    const questionCheckAlumni: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.alumni);

    const questionsExist: boolean = checkQuestionsExist([questionCheckAlumni]);

    if (!questionsExist || questionCheckAlumni.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const wordInAnswer: boolean | null = checkWordInAnswer(
        questionCheckAlumni.data,
        "yes"
    ).data;

    if (wordInAnswer == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(wordInAnswer);
}

/**
 *  Attempts to parse the answers in the form into a student entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function jsonToStudent(
    form: Requests.Form
): Promise<Responses.FormStudent> {
    const pronouns = await getPronouns(form);
    const gender = await getGender(form);
    const phoneNumber = await getPhoneNumber(form);
    const nickname = await getNickname(form);
    const alumni = await getAlumni(form);

    return Promise.resolve({
        pronouns: pronouns,
        gender: gender,
        phoneNumber: phoneNumber,
        nickname: nickname,
        alumni: alumni,
    });
}

/* parse form to job application
 ********************************/

/**
 *  Parse the form to the responsibilities of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getResponsibilities(
    form: Requests.Form
): Promise<string | null> {
    const questionCheckResponsibilities: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.responsibilities);

    const questionsExist: boolean = checkQuestionsExist([
        questionCheckResponsibilities,
    ]);

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (questionCheckResponsibilities.data?.value == undefined) {
        return Promise.resolve(null);
    }

    return Promise.resolve(questionCheckResponsibilities.data?.value as string);
}

/**
 *  Parse the form to the fun fact of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getFunFact(form: Requests.Form): Promise<string> {
    const questionFunFact: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.funFact);

    const questionsExist: boolean = checkQuestionsExist([questionFunFact]);

    if (!questionsExist || questionFunFact.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionFunFact.data.value as string);
}

/**
 *  Parse the form to the volunteer info of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getVolunteerInfo(form: Requests.Form): Promise<string> {
    const questionCheckVolunteerInfo: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.volunteerInfo);

    const questionsExist: boolean = checkQuestionsExist([
        questionCheckVolunteerInfo,
    ]);

    if (!questionsExist || questionCheckVolunteerInfo.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenVolunteerInfo: Responses.FormResponse<Requests.Option> =
        filterChosenOption(questionCheckVolunteerInfo.data);

    if (
        chosenVolunteerInfo.data == null ||
        chosenVolunteerInfo.data.id.length === 0
    ) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(chosenVolunteerInfo.data.text);
}

/**
 *  Parse the form to the choice of being a student coach.
 *  @param form The form with the answers.
 *  @param hasAlreadyParticipated true if the student from the job application has already taken part in osoc previous years
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function isStudentCoach(
    form: Requests.Form,
    hasAlreadyParticipated: boolean
): Promise<boolean | null> {
    if (hasAlreadyParticipated) {
        const questionStudentCoach: Responses.FormResponse<Requests.Question> =
            filterQuestion(form, config.studentCoach);

        const questionsExist: boolean = checkQuestionsExist([
            questionStudentCoach,
        ]);

        if (!questionsExist || questionStudentCoach.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }

        const wordInAnswer: boolean | null = checkWordInAnswer(
            questionStudentCoach.data,
            "yes"
        ).data;

        if (wordInAnswer == null) {
            return Promise.reject(errors.cookArgumentError());
        }

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
export function getEducations(form: Requests.Form): Promise<string[]> {
    const questionCheckEducations: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.edus);

    const questionsExist: boolean = checkQuestionsExist([
        questionCheckEducations,
    ]);

    if (
        !questionsExist ||
        questionCheckEducations.data?.value == null ||
        (questionCheckEducations.data.value as string[]).length === 0 ||
        (questionCheckEducations.data.value as string[]).length > 2
    ) {
        return Promise.reject(errors.cookArgumentError());
    }

    const educations: string[] = [];

    const questionValue = questionCheckEducations.data.value as string[];

    for (let i = 0; i < questionValue.length; i++) {
        if (questionCheckEducations.data.options != undefined) {
            const filteredOption = questionCheckEducations.data.options.filter(
                (option) => option.id === questionValue?.[i]
            );
            if (filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if (filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> =
                    filterQuestion(form, config.edusInput);
                const questionsExistOther: boolean = checkQuestionsExist([
                    questionCheckOther,
                ]);

                if (
                    !questionsExistOther ||
                    questionCheckOther.data?.value == null
                ) {
                    return Promise.reject(errors.cookArgumentError());
                }

                educations.push(questionCheckOther.data.value as string);
            } else {
                educations.push(filteredOption[0].text);
            }
        }
    }

    return Promise.resolve(educations);
}

/**
 *  Parse the form to the education levels of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getEducationLevel(form: Requests.Form): Promise<string> {
    const questionCheckEducationLevel: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.eduLevel);

    const questionsExist: boolean = checkQuestionsExist([
        questionCheckEducationLevel,
    ]);

    if (
        !questionsExist ||
        questionCheckEducationLevel.data?.value == null ||
        (questionCheckEducationLevel.data.value as string[]).length !== 1
    ) {
        return Promise.reject(errors.cookArgumentError());
    }

    let educationLevel;

    const educationLevelValue = questionCheckEducationLevel.data
        ?.value as string[];

    if (questionCheckEducationLevel.data.options != undefined) {
        const filteredOption = questionCheckEducationLevel.data.options.filter(
            (option) => option.id === educationLevelValue?.[0]
        );
        if (filteredOption.length !== 1) {
            return Promise.reject(errors.cookArgumentError());
        }
        if (filteredOption[0].text.includes("Other")) {
            const questionCheckOther: Responses.FormResponse<Requests.Question> =
                filterQuestion(form, config.eduLevelInput);
            const questionsExistOther: boolean = checkQuestionsExist([
                questionCheckOther,
            ]);

            if (
                !questionsExistOther ||
                questionCheckOther.data?.value == null
            ) {
                return Promise.reject(errors.cookArgumentError());
            }

            educationLevel = questionCheckOther.data.value as string;
        } else {
            educationLevel = filteredOption[0].text;
        }
    } else {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(educationLevel);
}

/**
 *  Parse the form to the duration of the education of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getEducationDuration(
    form: Requests.Form
): Promise<number | null> {
    const questionEducationDuration: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.eduDuration);

    const questionsExist: boolean = checkQuestionsExist([
        questionEducationDuration,
    ]);

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (questionEducationDuration.data?.value == null) {
        return Promise.resolve(null);
    }

    return Promise.resolve(Number(questionEducationDuration.data?.value));
}

/**
 *  Parse the form to the current year of the education of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getEducationYear(form: Requests.Form): Promise<string | null> {
    const questionEducationYear: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.eduYear);

    const questionsExist: boolean = checkQuestionsExist([
        questionEducationYear,
    ]);

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (questionEducationYear.data?.value == null) {
        return Promise.resolve(null);
    }

    return Promise.resolve(questionEducationYear.data.value as string);
}

/**
 *  Parse the form to the university of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getEducationUniversity(
    form: Requests.Form
): Promise<string | null> {
    const questionEducationUniversity: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.eduInstitute);

    const questionsExist: boolean = checkQuestionsExist([
        questionEducationUniversity,
    ]);

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (questionEducationUniversity.data?.value == null) {
        return Promise.resolve(null);
    }

    return Promise.resolve(questionEducationUniversity.data.value as string);
}

/**
 *  Attempts to parse the answers in the form into a job application entity.
 *  @param form The form with the answers.
 *  @param hasAlreadyTakenPart true if the student has already taken part in osoc in a prev edition
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function jsonToJobApplication(
    form: Requests.Form,
    hasAlreadyTakenPart: boolean
): Promise<Responses.FormJobApplication> {
    const responsibilities = await getResponsibilities(form);
    const funFact = await getFunFact(form);
    const volunteerInfo = await getVolunteerInfo(form);
    const studentCoach = await isStudentCoach(form, hasAlreadyTakenPart);
    const latestOsoc = await ormOs.getLatestOsoc();
    if (latestOsoc == null) {
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
    if (form.createdAt != undefined) {
        createdAt = form.createdAt;
    }

    return Promise.resolve({
        responsibilities: responsibilities,
        funFact: funFact,
        volunteerInfo: volunteerInfo,
        studentCoach: studentCoach,
        osocId: osocId,
        educations: educations,
        educationLevel: educationLevel,
        educationDuration: educationDuration,
        educationYear: educationYear,
        educationInstitute: educationInstitute,
        emailStatus: emailStatus,
        createdAt: createdAt,
    });
}

/* parse form to job application skills
 ***************************************/

/**
 *  Parse the form to the most fluent language of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getMostFluentLanguage(form: Requests.Form): Promise<string> {
    const questionMostFluentLanguage: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.mostFluentLanguage);

    const questionsExist: boolean = checkQuestionsExist([
        questionMostFluentLanguage,
    ]);

    if (!questionsExist || questionMostFluentLanguage.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenLanguage: Responses.FormResponse<Requests.Option> =
        filterChosenOption(questionMostFluentLanguage.data);

    if (chosenLanguage.data == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let language = "";

    if (chosenLanguage.data.text.includes("Other")) {
        const questionCheckOther: Responses.FormResponse<Requests.Question> =
            filterQuestion(form, config.mostFluentLanguageInput);
        const questionsExistOther: boolean = checkQuestionsExist([
            questionCheckOther,
        ]);

        if (!questionsExistOther || questionCheckOther.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }

        language = questionCheckOther.data.value as string;
    } else {
        language = chosenLanguage.data.text;
    }

    return Promise.resolve(language);
}

/**
 *  Parse the form to the english level of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getEnglishLevel(form: Requests.Form): Promise<number> {
    const questionEnglishLevel: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.englishLevel);

    const questionsExist: boolean = checkQuestionsExist([questionEnglishLevel]);

    if (!questionsExist || questionEnglishLevel.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenLanguage: Responses.FormResponse<Requests.Option> =
        filterChosenOption(questionEnglishLevel.data);

    if (chosenLanguage.data == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (chosenLanguage.data.text.toLowerCase().includes("★★★★★")) {
        return Promise.resolve(5);
    } else if (chosenLanguage.data.text.toLowerCase().includes("★★★★")) {
        return Promise.resolve(4);
    } else if (chosenLanguage.data.text.toLowerCase().includes("★★★")) {
        return Promise.resolve(3);
    } else if (chosenLanguage.data.text.toLowerCase().includes("★★")) {
        return Promise.resolve(2);
    }

    return Promise.resolve(1);
}

/**
 *  Parse the form to the best skill this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getBestSkill(form: Requests.Form): Promise<string> {
    const questionBestSkill: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.bestSkill);

    const questionsExist: boolean = checkQuestionsExist([questionBestSkill]);

    if (!questionsExist || questionBestSkill.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionBestSkill.data.value as string);
}

/**
 *  Attempts to parse the answers in the form into job application skills entities.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function jsonToSkills(
    form: Requests.Form
): Promise<Responses.FormJobApplicationSkill> {
    const most_fluent_language = await getMostFluentLanguage(form);
    const english_level = await getEnglishLevel(form);
    const best_skill = await getBestSkill(form);

    return Promise.resolve({
        most_fluent_language: most_fluent_language,
        english_level: english_level,
        best_skill: best_skill,
    });
}

/* parse form to attachments
 ****************************/

/**
 *  Parse the form to the cv of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getCV(
    form: Requests.Form
): Promise<Responses.FormAttachmentResponse> {
    const questionCVUpload: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.cvUpload);
    const questionCVLink: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.cvLink);

    const questionsExist: boolean = checkQuestionsExist([
        questionCVUpload,
        questionCVLink,
    ]);

    const links: string[] = [];
    const types: type_enum[] = [];

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }
    if (
        questionCVUpload.data?.value == null &&
        questionCVLink.data?.value == null
    ) {
        return Promise.resolve({ data: [], types: [] });
    }

    if (questionCVLink.data?.value != null) {
        if ((questionCVLink.data?.value as string).trim() != "") {
            links.push(questionCVLink.data?.value as string);
            types.push("CV_URL");
        }
    }

    const cvUploadValue = questionCVUpload.data?.value as Requests.FormValues[];

    if (questionCVUpload.data?.value != null) {
        for (let linkIndex = 0; linkIndex < cvUploadValue.length; linkIndex++) {
            if (
                (cvUploadValue[linkIndex] as Requests.FormValues).url ==
                undefined
            ) {
                return Promise.reject(errors.cookArgumentError());
            }

            if (
                (cvUploadValue[linkIndex] as Requests.FormValues).url.trim() !=
                ""
            ) {
                links.push(
                    (cvUploadValue[linkIndex] as Requests.FormValues).url
                );
                types.push("CV_URL");
            }
        }
    }

    return Promise.resolve({ data: links, types: types });
}

/**
 *  Parse the form to the portfolio of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getPortfolio(
    form: Requests.Form
): Promise<Responses.FormAttachmentResponse> {
    const questionPortfolioUpload: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.portfolioUpload);
    const questionPortfolioLink: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.portfolioLink);

    const questionsExist: boolean = checkQuestionsExist([
        questionPortfolioUpload,
        questionPortfolioLink,
    ]);

    const links: string[] = [];
    const types: type_enum[] = [];

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (
        questionPortfolioUpload.data?.value == null &&
        questionPortfolioLink.data?.value == null
    ) {
        return Promise.resolve({ data: [], types: [] });
    }

    if (questionPortfolioLink.data?.value != null) {
        if ((questionPortfolioLink.data?.value as string).trim() != "") {
            links.push(questionPortfolioLink.data?.value as string);
            types.push("PORTFOLIO_URL");
        }
    }

    const portfolioUploadValue = questionPortfolioUpload.data
        ?.value as Requests.FormValues[];

    if (questionPortfolioUpload.data?.value != null) {
        for (
            let linkIndex = 0;
            linkIndex < portfolioUploadValue.length;
            linkIndex++
        ) {
            if (
                (portfolioUploadValue[linkIndex] as Requests.FormValues).url ==
                undefined
            ) {
                return Promise.reject(errors.cookArgumentError());
            }

            if (
                (
                    portfolioUploadValue[linkIndex] as Requests.FormValues
                ).url.trim() != ""
            ) {
                links.push(
                    (portfolioUploadValue[linkIndex] as Requests.FormValues).url
                );
                types.push("PORTFOLIO_URL");
            }
        }
    }

    return Promise.resolve({ data: links, types: types });
}

/**
 *  Parse the form to the motivation of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getMotivation(
    form: Requests.Form
): Promise<Responses.FormAttachmentResponse> {
    const questionMotivationUpload: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.motivationUpload);
    const questionMotivationLink: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.motivationLink);
    const questionMotivationString: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.motivationInput);

    const questionsExist: boolean = checkQuestionsExist([
        questionMotivationUpload,
        questionMotivationLink,
        questionMotivationString,
    ]);

    const data: string[] = [];
    const types: type_enum[] = [];

    if (!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if (
        questionMotivationUpload.data?.value == null &&
        questionMotivationLink.data?.value == null &&
        questionMotivationString.data?.value == null
    ) {
        return Promise.resolve({ data: [], types: [] });
    }

    if (questionMotivationLink.data?.value != null) {
        if ((questionMotivationLink.data?.value as string).trim() != "") {
            data.push(questionMotivationLink.data?.value as string);
            types.push("MOTIVATION_URL");
        }
    }

    const motivationUploadValue = questionMotivationUpload.data
        ?.value as Requests.FormValues[];

    if (questionMotivationUpload.data?.value != null) {
        for (
            let linkIndex = 0;
            linkIndex < motivationUploadValue.length;
            linkIndex++
        ) {
            if (
                (motivationUploadValue[linkIndex] as Requests.FormValues).url ==
                undefined
            ) {
                return Promise.reject(errors.cookArgumentError());
            }

            if (
                (
                    motivationUploadValue[linkIndex] as Requests.FormValues
                ).url.trim() != ""
            ) {
                data.push(
                    (motivationUploadValue[linkIndex] as Requests.FormValues)
                        .url
                );
                types.push("MOTIVATION_URL");
            }
        }
    }

    if (questionMotivationString.data?.value != null) {
        if ((questionMotivationString.data?.value as string).trim() != "") {
            data.push(questionMotivationString.data?.value as string);
            types.push("MOTIVATION_URL");
        }
    }

    return Promise.resolve({ data: data, types: types });
}

/**
 *  Attempts to parse the answers in the form into attachment entities.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function jsonToAttachments(
    form: Requests.Form
): Promise<Responses.FormAttachment> {
    const cv_links = await getCV(form);
    const portfolio_links = await getPortfolio(form);
    const motivations = await getMotivation(form);

    return Promise.resolve({
        cv_links: cv_links,
        portfolio_links: portfolio_links,
        motivations: motivations,
    });
}

/* parse form to applied roles
 ******************************/

/**
 *  Parse the form to the roles of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export function getAppliedRoles(form: Requests.Form): Promise<string[]> {
    const questionAppliedRoles: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.appliedRole);

    const questionsExist: boolean = checkQuestionsExist([questionAppliedRoles]);

    if (
        !questionsExist ||
        questionAppliedRoles.data?.value == null ||
        (questionAppliedRoles.data.value as string[]).length === 0 ||
        (questionAppliedRoles.data.value as string[]).length > 2
    ) {
        return Promise.reject(errors.cookArgumentError());
    }

    const appliedRolesValue = questionAppliedRoles.data?.value as string[];

    const appliedRoles: string[] = [];

    for (let i = 0; i < appliedRolesValue.length; i++) {
        if (questionAppliedRoles.data.options != undefined) {
            const filteredOption = questionAppliedRoles.data.options.filter(
                (option) => option.id === appliedRolesValue?.[i]
            );
            if (filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if (filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> =
                    filterQuestion(form, config.appliedRoleInput);
                const questionsExistOther: boolean = checkQuestionsExist([
                    questionCheckOther,
                ]);

                if (
                    !questionsExistOther ||
                    questionCheckOther.data?.value == null
                ) {
                    return Promise.reject(errors.cookArgumentError());
                }

                appliedRoles.push(questionCheckOther.data.value as string);
            } else {
                appliedRoles.push(filteredOption[0].text);
            }
        }
    }

    return Promise.resolve(appliedRoles);
}

/**
 *  Attempts to parse the answers in the form into role entities.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function jsonToRoles(
    form: Requests.Form
): Promise<Responses.FormRoles> {
    const roles = await getAppliedRoles(form);

    return Promise.resolve({ roles: roles });
}

/**
 *  Attempts to add a person to the database.
 *  @param formResponse The response with the data.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function addPersonToDatabase(
    formResponse: Responses.FormPerson
): Promise<Responses.Id> {
    const allPersons = await ormP.getAllPersons();

    const checkIfEmailInDb = allPersons.filter(
        (person) => person.email === formResponse.email
    );

    let personId;

    if (checkIfEmailInDb.length > 0) {
        await ormP.updatePerson({
            personId: checkIfEmailInDb[0].person_id,
            firstname: formResponse.birthName,
            lastname: formResponse.lastName,
            github: null,
            email: formResponse.email,
        });
        personId = checkIfEmailInDb[0].person_id;
    } else {
        const person = await ormP.createPerson({
            firstname: formResponse.birthName,
            lastname: formResponse.lastName,
            email: formResponse.email,
        });
        personId = person.person_id;
    }

    return Promise.resolve({ id: personId });
}

/**
 *  Attempts to add a student to the database.
 *  @param formResponse The response with the data.
 *  @param personId The id of a person.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function addStudentToDatabase(
    formResponse: Responses.FormStudent,
    personId: Responses.Id
): Promise<Responses.Id_alumni> {
    const allStudents = await ormSt.getAllStudents();

    const checkIfIdInDb = allStudents.filter(
        (student) => student.person_id === personId.id
    );

    let studentId;

    if (checkIfIdInDb.length > 0) {
        await ormSt.updateStudent({
            studentId: checkIfIdInDb[0].student_id,
            gender: formResponse.gender,
            pronouns:
                formResponse.pronouns == null ? "" : formResponse.pronouns,
            phoneNumber: formResponse.phoneNumber,
            nickname: formResponse.nickname,
            alumni: formResponse.alumni,
        });
        studentId = checkIfIdInDb[0].student_id;
    } else {
        const student = await ormSt.createStudent({
            personId: personId.id,
            gender: formResponse.gender,
            pronouns:
                formResponse.pronouns != null
                    ? formResponse.pronouns
                    : undefined,
            phoneNumber: formResponse.phoneNumber,
            nickname:
                formResponse.nickname != null
                    ? formResponse.nickname
                    : undefined,
            alumni: formResponse.alumni,
        });
        studentId = student.student_id;
    }

    return Promise.resolve({
        id: studentId,
        hasAlreadyTakenPart: formResponse.alumni,
    });
}

/**
 *  Attempts to add a job application to the database.
 *  @param formResponse The response with the data.
 *  @param student_id The student id object.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function addJobApplicationToDatabase(
    formResponse: Responses.FormJobApplication,
    student_id: Responses.Id
): Promise<Responses.Id> {
    const studentId = student_id.id;

    const latestJobApplication = await ormJo.getLatestJobApplicationOfStudent(
        studentId
    );

    if (
        latestJobApplication !== null &&
        latestJobApplication.osoc_id === formResponse.osocId
    ) {
        await Promise.all([
            ormAppRo.deleteAppliedRolesByJobApplication(
                latestJobApplication.job_application_id
            ),
            ormAtt.deleteAllAttachmentsForApplication(
                latestJobApplication.job_application_id
            ),
            ormJoSk.deleteSkillsByJobApplicationId(
                latestJobApplication.job_application_id
            ),
        ]);
        await ormJo.deleteJobApplication(
            latestJobApplication.job_application_id
        );
    }

    const jobApplication = await ormJo.createJobApplication({
        studentId: studentId,
        responsibilities: formResponse.responsibilities,
        funFact: formResponse.funFact,
        studentVolunteerInfo: formResponse.volunteerInfo,
        studentCoach:
            formResponse.studentCoach == null
                ? false
                : formResponse.studentCoach,
        osocId: formResponse.osocId,
        edus: formResponse.educations,
        eduLevel: formResponse.educationLevel,
        eduDuration: formResponse.educationDuration,
        eduYear: formResponse.educationYear,
        eduInstitute: formResponse.educationInstitute,
        emailStatus: formResponse.emailStatus,
        createdAt: formResponse.createdAt,
    });

    return Promise.resolve({ id: jobApplication.job_application_id });
}

/**
 *  Attempts to add a job application skill to the database.
 *  @param formResponse The response with the data.
 *  @param job_applicationId The job application id.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function addSkillsToDatabase(
    formResponse: Responses.FormJobApplicationSkill,
    job_applicationId: Responses.Id
): Promise<Responses.Empty> {
    const job_application_id = job_applicationId.id;

    let most_fl_la_id;
    const getMostFluentLanguageInDb = await ormLa.getLanguageByName(
        formResponse.most_fluent_language
    );
    if (getMostFluentLanguageInDb == null) {
        const most_fl_la = await ormLa.createLanguage(
            formResponse.most_fluent_language
        );
        most_fl_la_id = most_fl_la.language_id;
    } else {
        most_fl_la_id = getMostFluentLanguageInDb.language_id;
    }

    if (!formResponse.most_fluent_language.includes("English")) {
        await ormJoSk.createJobApplicationSkill({
            jobApplicationId: job_application_id,
            skill: null,
            languageId: most_fl_la_id,
            level: null,
            isPreferred: true,
            isBest: false,
        });
    }

    let english_id;
    const getEnglishLanguage = await ormLa.getLanguageByName("English");
    if (getEnglishLanguage == null) {
        const english_language = await ormLa.createLanguage("English");
        english_id = english_language.language_id;
    } else {
        english_id = getEnglishLanguage.language_id;
    }

    await ormJoSk.createJobApplicationSkill({
        jobApplicationId: job_application_id,
        skill: null,
        languageId: english_id,
        level: formResponse.english_level,
        isPreferred: false,
        isBest: false,
    });

    await ormJoSk.createJobApplicationSkill({
        jobApplicationId: job_application_id,
        skill: formResponse.best_skill,
        languageId: null,
        level: null,
        isPreferred: false,
        isBest: true,
    });

    return Promise.resolve({});
}

/**
 *  Attempts to add attachments to the database.
 *  @param formResponse The response with the data.
 *  @param job_applicationId The job_application id object.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function addAttachmentsToDatabase(
    formResponse: Responses.FormAttachment,
    job_applicationId: Responses.Id
): Promise<Responses.Empty> {
    const job_application_id = job_applicationId.id;

    if (formResponse.cv_links.data.length > 0) {
        await ormAtt.createAttachment(
            job_application_id,
            formResponse.cv_links.data,
            formResponse.cv_links.types
        );
    }

    if (formResponse.portfolio_links.data.length > 0) {
        await ormAtt.createAttachment(
            job_application_id,
            formResponse.portfolio_links.data,
            formResponse.portfolio_links.types
        );
    }

    if (formResponse.motivations.data.length > 0) {
        await ormAtt.createAttachment(
            job_application_id,
            formResponse.motivations.data,
            formResponse.motivations.types
        );
    }

    return Promise.resolve({});
}

/**
 *  Attempts to add roles to the database.
 *  @param formResponse The response with the data.
 *  @param job_applicationId The job_application id object.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function addRolesToDatabase(
    formResponse: Responses.FormRoles,
    job_applicationId: Responses.Id
): Promise<Responses.Empty> {
    const job_application_id = job_applicationId.id;

    for (
        let role_index = 0;
        role_index < formResponse.roles.length;
        role_index++
    ) {
        const role_exists = await ormRo.getRolesByName(
            formResponse.roles[role_index]
        );
        if (role_exists == null) {
            const created_role = await ormRo.createRole(
                formResponse.roles[role_index]
            );
            await ormAppRo.createAppliedRole({
                jobApplicationId: job_application_id,
                roleId: created_role.role_id,
            });
        } else {
            await ormAppRo.createAppliedRole({
                jobApplicationId: job_application_id,
                roleId: role_exists.role_id,
            });
        }
    }

    return Promise.resolve({});
}

/**
 *  Attempts to create a new form in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
export async function createForm(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseFormRequest(req);

    const questionInBelgium: Responses.FormResponse<Requests.Question> =
        filterQuestion(parsedRequest, config.liveInBelgium);
    const questionCanWorkEnough: Responses.FormResponse<Requests.Question> =
        filterQuestion(parsedRequest, config.workInJuly);

    const questionsExist: boolean = checkQuestionsExist([
        questionInBelgium,
        questionCanWorkEnough,
    ]);
    if (
        !questionsExist ||
        questionInBelgium.data?.value == null ||
        questionCanWorkEnough.data?.value == null
    ) {
        return Promise.reject(errors.cookArgumentError());
    }

    const wordInAnswerInBelgium: Responses.FormResponse<boolean> =
        checkWordInAnswer(questionInBelgium.data, "yes");
    const wordInAnswerCanWorkEnough: Responses.FormResponse<boolean> =
        checkWordInAnswer(questionCanWorkEnough.data, "yes");

    if (
        wordInAnswerInBelgium.data == null ||
        wordInAnswerCanWorkEnough.data == null
    ) {
        console.log("test");
        return Promise.resolve({});
    }

    if (wordInAnswerInBelgium.data && wordInAnswerCanWorkEnough.data) {
        const person: Responses.FormPerson = await jsonToPerson(parsedRequest);
        const student: Responses.FormStudent = await jsonToStudent(
            parsedRequest
        );
        const jobApplication: Responses.FormJobApplication =
            await jsonToJobApplication(parsedRequest, student.alumni);
        const jobApplicationSkills: Responses.FormJobApplicationSkill =
            await jsonToSkills(parsedRequest);
        const attachments: Responses.FormAttachment = await jsonToAttachments(
            parsedRequest
        );
        const roles: Responses.FormRoles = await jsonToRoles(parsedRequest);

        const addedPersonToDatabase = await addPersonToDatabase(person);
        const addedStudentToDatabase = await addStudentToDatabase(student, {
            id: addedPersonToDatabase.id,
        });
        const addedJobApplicationToDatabase = await addJobApplicationToDatabase(
            jobApplication,
            { id: addedStudentToDatabase.id }
        );
        await addSkillsToDatabase(jobApplicationSkills, {
            id: addedJobApplicationToDatabase.id,
        });
        await addAttachmentsToDatabase(attachments, {
            id: addedJobApplicationToDatabase.id,
        });
        await addRolesToDatabase(roles, {
            id: addedJobApplicationToDatabase.id,
        });
        return Promise.resolve({});
    }

    return Promise.resolve({});
}

/**
 *  Gets the router for all `/form/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/form/`
 *  endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    router.post("/", (req, res) =>
        util.respOrErrorNoReinject(res, createForm(req))
    );

    util.addAllInvalidVerbs(router, ["/"]);

    return router;
}

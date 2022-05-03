import { getMockReq } from "@jest-mock/express";

import * as form_router from "../../routes/form";

import * as T from "../../types";
import express from "express";
import * as Rq from "../../request";
import { errors } from "../../utility";
/*import express from "express";
import * as Rq from "../../request";
import { errors } from "../../utility";*/
// setup mock for form
//jest.mock("../../routes/form");
//const formMock = form as jest.Mocked<typeof form>;
import * as fs from "fs";
import * as path from "path";
/*import { Requests, Responses } from "../../types";
import * as config from "../../routes/form_keys.json";
import {
    checkQuestionsExist,
    checkWordInAnswer,
    filterQuestion,
} from "../../routes/form";*/

const keys = [
    "question_mK177D",
    "question_wLpAAJ",
    "question_npOjjP",
    "question_31VZZb",
    "question_wMRkk8",
    "question_mJzaaX",
    "question_wgGyyJ",
    "question_3yYKKd",
    "question_3X0VVz",
    "question_w8xvvr",
    "question_n0O22A",
    "question_wzYppg",
    "question_w5x66Q",
    "question_wddLLV",
    "question_mYaEEv",
    "question_mDzrrE",
    "question_3lrooX",
    "question_mRPXXQ",
    "question_woGrrN",
    "question_nGlNNO",
    "question_mOGppM",
    "question_mVJRR6",
    "question_nPOMMx",
    "question_3EWjj2",
    "question_nrPNNX",
    "question_w4rWW5",
    "question_3jPdd1",
    "question_w2PqqM",
    "question_3xYkkk",
    "question_mZ6555",
    "question_3NW55p",
    "question_3qAZZ5",
    "question_wQ5221",
    "question_n9DGGX",
    "question_meeZZQ",
    "question_nW599R",
    "question_waYNN2",
];

function readDataTestForms(): T.Requests.Form[] {
    return Object.values(
        fs.readdirSync(path.join(__dirname, "/../../../testforms"))
    )
        .filter((filename) => filename.includes("testform"))
        .map((filename) => {
            const readFile = (path: string) => fs.readFileSync(path, "utf8");
            const fileData = readFile(
                path.join(__dirname, `/../../../testforms/${filename}`)
            );
            return JSON.parse(fileData);
        });
}

/*function checkIfFirstQuestionsAreValid(
    form: T.Requests.Form
): Promise<boolean> {
    if (form.data.fields == undefined) {
        return Promise.reject(errors.cookArgumentError());
    }

    const questionInBelgium: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.liveInBelgium);
    const questionCanWorkEnough: Responses.FormResponse<Requests.Question> =
        filterQuestion(form, config.workInJuly);

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
        return Promise.resolve(false);
    }

    if (wordInAnswerInBelgium.data && wordInAnswerCanWorkEnough.data) {
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}*/

test("Can parse form request", () => {
    const resultList: Promise<void>[] = [];
    const req: express.Request = getMockReq();

    req.body = {};
    resultList.push(
        expect(Rq.parseFormRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        )
    );

    const req2: express.Request = getMockReq();
    req2.body = { data: {} };
    resultList.push(
        expect(Rq.parseFormRequest(req2)).rejects.toBe(
            errors.cookArgumentError()
        )
    );

    const req3: express.Request = getMockReq();
    req3.body = { data: { fields: [{ value: "value" }] } };
    resultList.push(
        expect(Rq.parseFormRequest(req3)).rejects.toBe(
            errors.cookArgumentError()
        )
    );

    readDataTestForms().forEach((data) => {
        const req4: express.Request = getMockReq();
        req4.body = { ...data };
        const v1 = expect(Rq.parseFormRequest(req4)).resolves.toHaveProperty(
            "data",
            data.data
        );
        const v2 = expect(Rq.parseFormRequest(req4)).resolves.toHaveProperty(
            "createdAt",
            data.createdAt
        );

        resultList.push(v1);
        resultList.push(v2);
    });

    return Promise.all(resultList);
});

describe.each(keys)("Questions present", (key) => {
    readDataTestForms().forEach((form) => {
        it(`Question with key ${key} is present`, () => {
            const res = form_router.filterQuestion(form, key);
            expect(res.data).not.toBe(null);
        });
    });
});

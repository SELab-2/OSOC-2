import { readDataTestForms } from "./filter_question.test";
import express from "express";
import { getMockReq } from "@jest-mock/express";
import * as Rq from "../../../request";
import { errors } from "../../../utility";

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

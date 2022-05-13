import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { getGender, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("gender question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/gender_files",
        "genderQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getGender(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Gender options fail", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/gender_files",
        "genderFailChosenOption.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getGender(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

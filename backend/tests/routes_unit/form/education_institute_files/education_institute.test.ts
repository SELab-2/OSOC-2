import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { getEducationUniversity, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Education institute question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_institute_files",
        "educationInstituteQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getEducationUniversity(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Education institute value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_institute_files",
        "educationInstituteValueNull.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getEducationUniversity(data as Form)).resolves.toStrictEqual(
        null
    );
});

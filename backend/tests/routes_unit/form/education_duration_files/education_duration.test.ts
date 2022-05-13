import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { getEducationDuration, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Education duration question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_duration_files",
        "educationDurationQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getEducationDuration(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Education duration value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_duration_files",
        "educationDurationValueNull.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getEducationDuration(data as Form)).resolves.toStrictEqual(
        null
    );
});

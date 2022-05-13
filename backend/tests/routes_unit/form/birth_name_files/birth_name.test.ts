import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { createForm, readFile } from "../../../../routes/form";

test("Birth name question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/birth_name_files",
        "failBirthNameQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

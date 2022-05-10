import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../utility";

import { readFile } from "./create_form.test";
import { createForm } from "../../../routes/form";

test("Birth name question absent", async () => {
    const data = readFile(
        "failBirthNameQuestionAbsent.json",
        "./birth_name_files"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { createForm } from "../../../../routes/form";
import * as T from "../../../../types";
import fs from "fs";
import path from "path";

export function readFile(file: string): T.Requests.Form | null {
    const readFile = (path: string) => fs.readFileSync(path, "utf8");
    const fileData = readFile(path.join(__dirname, `./${file}`));
    return JSON.parse(fileData);
}

test("Birth name question absent", async () => {
    const data = readFile("failBirthNameQuestionAbsent.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

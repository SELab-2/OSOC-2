import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { getGender } from "../../../../routes/form";
import * as T from "../../../../types";
import fs from "fs";
import path from "path";
import { Requests } from "../../../../types";
import Form = Requests.Form;

export function readFile(file: string): T.Requests.Form | null {
    const readFile = (path: string) => fs.readFileSync(path, "utf8");
    const fileData = readFile(path.join(__dirname, `./${file}`));
    return JSON.parse(fileData);
}

test("gender question absent", async () => {
    const data = readFile("genderQuestionAbsent.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getGender(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Gender options fail", async () => {
    const data = readFile("genderFailChosenOption.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getGender(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

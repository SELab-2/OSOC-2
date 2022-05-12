import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { getNickname } from "../../../../routes/form";
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

test("Nickname question absent", async () => {
    const data = readFile("nicknameQuestionAbsent.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getNickname(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Nickname text field value is null", async () => {
    const data = readFile("nicknameFieldValueNull.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getNickname(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Nickname text field value is not null", async () => {
    const data = readFile("nicknameFieldValueNotNull.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getNickname(data as Form)).resolves.toStrictEqual("Luc");
});

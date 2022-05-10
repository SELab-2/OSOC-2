import { getMockReq } from "@jest-mock/express";

import * as T from "../../../../types";
import express from "express";
import { errors } from "../../../../utility";
import * as fs from "fs";
import * as path from "path";
import { createForm } from "../../../../routes/form";

function readFile(file: string): T.Requests.Form | null {
    const readFile = (path: string) => fs.readFileSync(path, "utf8");
    const fileData = readFile(path.join(__dirname, `./${file}`));
    return JSON.parse(fileData);
}

test("Live in Belgium question absent", async () => {
    const data = readFile("failLiveInBelgiumAbsent.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in July question absent", async () => {
    const data = readFile("failWorkInJulyAbsent.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in July 'no' answer", async () => {
    const data = readFile("liveInBelgiumAnswerNo.json");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).resolves.toStrictEqual({});
});

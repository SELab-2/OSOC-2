import { getMockReq } from "@jest-mock/express";

import * as T from "../../../types";
import express from "express";
import { errors } from "../../../utility";
import * as fs from "fs";
import * as path from "path";
import { createForm } from "../../../routes/form";

export function readFile(
    file: string,
    directory: string
): T.Requests.Form | null {
    const fileData = Object.values(
        fs.readdirSync(path.join(__dirname, directory))
    )
        .filter((filename) => filename.includes(file))
        .map((filename) => {
            const readFile = (path: string) => fs.readFileSync(path, "utf8");
            const fileData = readFile(
                path.join(__dirname, `${directory}/${filename}`)
            );
            return JSON.parse(fileData);
        });

    if (fileData.length === 0) {
        return null;
    }

    return fileData[0];
}

test("Live in Belgium question absent", async () => {
    const data = readFile(
        "failLiveInBelgiumAbsent.json",
        "./create_form_files"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in July question absent", async () => {
    const data = readFile("failWorkInJulyAbsent.json", "./create_form_files");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in July 'no' answer", async () => {
    const data = readFile("liveInBelgiumAnswerNo.json", "./create_form_files");
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).resolves.toStrictEqual({});
});

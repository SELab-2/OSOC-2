import express from "express";
import { getMockReq } from "@jest-mock/express";
import { errors } from "../../../../utility";

import { getEnglishLevel, readFile } from "../../../../routes/form";
import form_keys from "../../../../routes/form_keys.json";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("english level question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/english_level_files",
        "englishLevelQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getEnglishLevel(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("English level options absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/english_level_files",
        "englishLevelOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(getEnglishLevel(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("English level amount of stars test", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/english_level_files",
        "englishLevelStars.json"
    );
    expect(data).not.toBeNull();

    await expect(getEnglishLevel(data as Form)).resolves.toStrictEqual(5);

    data?.data.fields.map((question) => {
        if (question.key === form_keys.englishLevel) {
            question.value = "6023fc5b-6ae2-4280-a691-37dc781044d8";
            return question;
        }
        return question;
    });
    await expect(getEnglishLevel(data as Form)).resolves.toStrictEqual(3);

    data?.data.fields.map((question) => {
        if (question.key === form_keys.englishLevel) {
            question.value = "eeba838b-5a34-4c92-a8ca-4cab70d19f93";
            return question;
        }
        return question;
    });
    await expect(getEnglishLevel(data as Form)).resolves.toStrictEqual(2);

    data?.data.fields.map((question) => {
        if (question.key === form_keys.englishLevel) {
            question.value = "18419bd9-82b4-40f8-980a-10ce9a022db3";
            return question;
        }
        return question;
    });
    await expect(getEnglishLevel(data as Form)).resolves.toStrictEqual(1);
});

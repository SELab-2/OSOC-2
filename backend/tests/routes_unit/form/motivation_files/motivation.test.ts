import { errors } from "../../../../utility";

import { getMotivation } from "../../../../routes/form";
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

test("The value of the motivation link field is not empty", async () => {
    const data = readFile("motivationLinkValueNotEmpty.json");
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["MOTIVATION_URL"],
    });
});

test("The motivation link question is absent", async () => {
    const data = readFile("motivationLinkQuestionAbsent.json");
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The url field in the motivation upload question is undefined", async () => {
    const data = readFile("motivationUrlNotDefined.json");
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The value of the motivation upload field is valid", async () => {
    const data = readFile("motivationUploadValueValid.json");
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["MOTIVATION_URL"],
    });
});

test("The value of the motivation string field is valid", async () => {
    const data = readFile("motivationStringFieldValid.json");
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).resolves.toStrictEqual({
        data: ["I am motivated"],
        types: ["MOTIVATION_STRING"],
    });
});

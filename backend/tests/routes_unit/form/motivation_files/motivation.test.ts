import { errors } from "../../../../utility";

import { getMotivation, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("The value of the motivation link field is not empty", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/motivation_files",
        "motivationLinkValueNotEmpty.json"
    );
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["MOTIVATION_URL"],
    });
});

test("The motivation link question is absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/motivation_files",
        "motivationLinkQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The url field in the motivation upload question is undefined", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/motivation_files",
        "motivationUrlNotDefined.json"
    );
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The value of the motivation upload field is valid", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/motivation_files",
        "motivationUploadValueValid.json"
    );
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["MOTIVATION_URL"],
    });
});

test("The value of the motivation string field is valid", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/motivation_files",
        "motivationStringFieldValid.json"
    );
    expect(data).not.toBeNull();

    await expect(getMotivation(data as Form)).resolves.toStrictEqual({
        data: ["I am motivated"],
        types: ["MOTIVATION_STRING"],
    });
});

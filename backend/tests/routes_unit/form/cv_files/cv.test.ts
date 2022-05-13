import { errors } from "../../../../utility";

import { getCV, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("The cv link question is absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/cv_files",
        "cvLinkQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getCV(data as Form)).rejects.toBe(errors.cookArgumentError());
});

test("The value of the cv link question is not empty", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/cv_files",
        "cvLinkValueNotEmpty.json"
    );
    expect(data).not.toBeNull();

    await expect(getCV(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/b1a201e0-9d51-4cba-811b-a6c62c0ba098/attachment.txt",
        ],
        types: ["CV_URL"],
    });
});

test("The url field in the cv upload question is undefined", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/cv_files",
        "cvUrlNotDefined.json"
    );
    expect(data).not.toBeNull();

    await expect(getCV(data as Form)).rejects.toBe(errors.cookArgumentError());
});

test("The value of the cv upload field is valid", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/cv_files",
        "cvUploadValueValid.json"
    );
    expect(data).not.toBeNull();

    await expect(getCV(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["CV_URL"],
    });
});

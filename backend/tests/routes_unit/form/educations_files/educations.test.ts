import { errors } from "../../../../utility";
import { getEducations, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Educations question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/educations_files",
        "educationsQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducations(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Educations options have the same value", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/educations_files",
        "educationsOptionsWithSameId.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducations(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Educations other question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/educations_files",
        "educationsOtherQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducations(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

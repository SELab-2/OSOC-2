import { errors } from "../../../../utility";
import { getEducationLevel, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Education level question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_level_files",
        "educationLevelQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationLevel(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Education level options with the same id", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_level_files",
        "educationLevelOptionsWithSameId.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationLevel(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Education level other question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_level_files",
        "educationLevelOtherQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationLevel(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Education level other question value not null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_level_files",
        "educationLevelOtherQuestionNotNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationLevel(data as Form)).resolves.toStrictEqual(
        "No diploma"
    );
});

test("Education level options absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_level_files",
        "educationLevelOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationLevel(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

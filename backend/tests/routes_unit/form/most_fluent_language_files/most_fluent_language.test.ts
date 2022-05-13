import { errors } from "../../../../utility";
import { getMostFluentLanguage, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Most fluent language question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/most_fluent_language_files",
        "mostFluentLanguageQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getMostFluentLanguage(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Most fluent language options absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/most_fluent_language_files",
        "mostFluentLanguageOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getMostFluentLanguage(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Most fluent language other option question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/most_fluent_language_files",
        "otherQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getMostFluentLanguage(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Most fluent language other option question not absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/most_fluent_language_files",
        "otherQuestionNotAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getMostFluentLanguage(data as Form)).resolves.toStrictEqual(
        "Danish"
    );
});

test("Most fluent language value is not other", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/most_fluent_language_files",
        "mostFluentLanguageNotOther.json"
    );
    expect(data).not.toBeNull();

    await expect(getMostFluentLanguage(data as Form)).resolves.toStrictEqual(
        "Dutch"
    );
});

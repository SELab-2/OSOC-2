import { errors } from "../../../../utility";
import { getPronouns, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Pronouns question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/pronouns_files",
        "pronounsQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getPronouns(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Pronouns options absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/pronouns_files",
        "pronounsOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getPronouns(data as Form)).resolves.toBeNull();
});

test("Preferred pronouns value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/pronouns_files",
        "preferredPronounsValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getPronouns(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The chosen option is not the other option", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/pronouns_files",
        "preferredPronounsNotOtherOption.json"
    );
    expect(data).not.toBeNull();

    await expect(getPronouns(data as Form)).resolves.toStrictEqual(
        "by call name"
    );
});

test("The enter pronouns field value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/pronouns_files",
        "enterPronounsValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getPronouns(data as Form)).resolves.toBeNull();
});

test("The enter pronouns field value is not null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/pronouns_files",
        "enterPronounsValueNotNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getPronouns(data as Form)).resolves.toStrictEqual(
        "by firstname"
    );
});

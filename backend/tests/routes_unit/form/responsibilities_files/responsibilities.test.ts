import { errors } from "../../../../utility";
import { getResponsibilities, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Responsibilities question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/responsibilities_files",
        "responsibilitiesQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getResponsibilities(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Responsibilities value undefined", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/responsibilities_files",
        "responsibilitiesValueUndefined.json"
    );
    expect(data).not.toBeNull();

    await expect(getResponsibilities(data as Form)).resolves.toStrictEqual(
        null
    );
});

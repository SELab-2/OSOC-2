import { errors } from "../../../../utility";

import { getBirthName, readFile } from "../../../../routes/form";

test("Birth name question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/birth_name_files",
        "failBirthNameQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getBirthName(data)).rejects.toBe(errors.cookArgumentError());
});

test("Birth name value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/birth_name_files",
        "failBirthNameValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getBirthName(data)).rejects.toBe(errors.cookArgumentError());
});

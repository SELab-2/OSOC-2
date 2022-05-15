import { errors } from "../../../../utility";
import { getEducationYear, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Education year question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_year_files",
        "educationYearQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationYear(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Education year value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/education_year_files",
        "educationYearValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getEducationYear(data as Form)).resolves.toStrictEqual(null);
});

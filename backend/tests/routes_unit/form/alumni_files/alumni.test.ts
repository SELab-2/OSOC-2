import { errors } from "../../../../utility";
import { getAlumni, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Alumni question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/alumni_files",
        "alumniQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getAlumni(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Alumni options absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/alumni_files",
        "alumniOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getAlumni(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

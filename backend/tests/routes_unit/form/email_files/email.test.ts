import { errors } from "../../../../utility";
import { getEmail, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Email question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/email_files",
        "emailQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getEmail(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

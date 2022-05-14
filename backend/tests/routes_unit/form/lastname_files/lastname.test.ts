import { errors } from "../../../../utility";

import { getLastName, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Lastname question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/lastname_files",
        "lastnameQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getLastName(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

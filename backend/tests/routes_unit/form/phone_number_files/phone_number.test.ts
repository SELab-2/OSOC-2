import { errors } from "../../../../utility";
import { getPhoneNumber, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Phone number question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/phone_number_files",
        "phoneNumberQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getPhoneNumber(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

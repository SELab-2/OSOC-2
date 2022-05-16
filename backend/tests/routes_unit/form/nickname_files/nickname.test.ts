import { errors } from "../../../../utility";
import { getNickname, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Nickname question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/nickname_files",
        "nicknameQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getNickname(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Nickname text field value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/nickname_files",
        "nicknameFieldValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getNickname(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Nickname text field value is not null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/nickname_files",
        "nicknameFieldValueNotNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getNickname(data as Form)).resolves.toStrictEqual("Luc");
});

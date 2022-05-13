import { errors } from "../../../../utility";
import { getEmail, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

import * as ormP from "../../../../orm_functions/person";
jest.mock("../../../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;

import * as ormLu from "../../../../orm_functions/login_user";
jest.mock("../../../../orm_functions/login_user");
const ormLuMock = ormLu as jest.Mocked<typeof ormLu>;

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

test("Email person already in the database", async () => {
    ormPMock.searchPersonByLogin.mockResolvedValue([
        {
            name: "Lucas Chen",
            person_id: 1,
            email: "lucas.chen@student.com",
            github: null,
            github_id: null,
        },
    ]);

    ormLuMock.searchLoginUserByPerson.mockResolvedValue({
        login_user_id: 1,
        person_id: 1,
        password: "pass",
        is_admin: true,
        is_coach: true,
        account_status: "ACTIVATED",
        person: {
            name: "Lucas Chen",
            person_id: 1,
            email: "lucas.chen@student.com",
            github: null,
            github_id: null,
        },
    });

    const data = await readFile(
        "../tests/routes_unit/form/email_files",
        "emailAlreadyInDatabase.json"
    );
    expect(data).not.toBeNull();

    await expect(getEmail(data as Form)).rejects.toBe(
        errors.cookInsufficientRights()
    );

    ormPMock.searchPersonByLogin.mockReset();
    ormLuMock.searchLoginUserByPerson.mockReset();
});

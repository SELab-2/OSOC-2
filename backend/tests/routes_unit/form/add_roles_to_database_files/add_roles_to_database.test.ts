import { addRolesToDatabase } from "../../../../routes/form";

import * as ormRo from "../../../../orm_functions/role";
jest.mock("../../../../orm_functions/role");
const ormRoMock = ormRo as jest.Mocked<typeof ormRo>;

import * as ormApRo from "../../../../orm_functions/applied_role";
jest.mock("../../../../orm_functions/applied_role");
const ormApRoMock = ormApRo as jest.Mocked<typeof ormApRo>;

test("Insert attachments in the database", async () => {
    ormRoMock.getRolesByName.mockResolvedValueOnce(null);

    ormRoMock.getRolesByName.mockResolvedValueOnce({
        role_id: 1,
        name: "Back-end developer",
    });

    ormRoMock.createRole.mockResolvedValue({
        role_id: 1,
        name: "Front-end developer",
    });

    ormApRoMock.createAppliedRole.mockResolvedValueOnce({
        applied_role_id: 1,
        job_application_id: 1,
        role_id: 1,
    });

    ormApRoMock.createAppliedRole.mockResolvedValueOnce({
        applied_role_id: 1,
        job_application_id: 1,
        role_id: 2,
    });

    await expect(
        addRolesToDatabase(
            {
                roles: ["Front-end developer", "Back-end developer"],
            },
            { id: 1 }
        )
    ).resolves.toStrictEqual({});

    ormRoMock.getRolesByName.mockReset();
    ormRoMock.createRole.mockReset();
    ormApRoMock.createAppliedRole.mockReset();
});

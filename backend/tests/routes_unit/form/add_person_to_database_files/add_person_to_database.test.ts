import { person } from "@prisma/client";

import { addPersonToDatabase } from "../../../../routes/form";

import * as ormP from "../../../../orm_functions/person";
jest.mock("../../../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;

const people: person[] = [
    {
        person_id: 1,
        name: "Test1",
        email: "test1@mail.com",
        github: null,
        github_id: null,
    },
    {
        person_id: 2,
        name: "Test2",
        email: "test2@mail.com",
        github: null,
        github_id: null,
    },
];

// setup
beforeEach(() => {
    // mocks for orm
    ormPMock.getAllPersons.mockResolvedValue(people);
    ormPMock.createPerson.mockResolvedValue({
        name: "Test3",
        person_id: 3,
        email: "test3@mail.com",
        github: null,
        github_id: null,
    });
    ormPMock.updatePerson.mockResolvedValue({
        name: "Test4",
        person_id: 2,
        email: "test2@mail.com",
        github: null,
        github_id: null,
    });
});

// reset
afterEach(() => {
    ormPMock.getAllPersons.mockReset();
    ormPMock.createPerson.mockReset();
    ormPMock.updatePerson.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Insert a person in the database (email not yet in the database)", async () => {
    await expect(
        addPersonToDatabase({
            name: "Test3",
            email: "test3@mail.com",
        })
    ).resolves.toStrictEqual({
        id: 3,
    });

    expectCall(ormP.createPerson, {
        name: "Test3",
        email: "test3@mail.com",
    });

    expect(ormP.getAllPersons).toHaveBeenCalledTimes(1);
});

test("Insert a person in the database (email already in the database)", async () => {
    await expect(
        addPersonToDatabase({
            name: "Test2",
            email: "test2@mail.com",
        })
    ).resolves.toStrictEqual({
        id: 2,
    });

    expectCall(ormP.updatePerson, {
        name: "Test2",
        personId: 2,
        email: "test2@mail.com",
        github: null,
    });

    expect(ormP.getAllPersons).toHaveBeenCalledTimes(1);
});

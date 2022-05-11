import { student, person } from "@prisma/client";

import { addStudentToDatabase } from "../../../../routes/form";

import * as ormSt from "../../../../orm_functions/student";
jest.mock("../../../../orm_functions/student");
const ormStMock = ormSt as jest.Mocked<typeof ormSt>;

const students: (student & { person: person })[] = [
    {
        student_id: 1,
        person_id: 1,
        gender: "M",
        pronouns: "He/him/his",
        phone_number: "0435721836",
        nickname: "nick",
        alumni: true,
        person: {
            person_id: 1,
            name: "Test1",
            email: "test1@mail.com",
            github: null,
            github_id: null,
        },
    },
    {
        student_id: 2,
        person_id: 2,
        gender: "V",
        pronouns: "She/her/hers",
        phone_number: "0481904236",
        nickname: "nick2",
        alumni: false,
        person: {
            person_id: 2,
            name: "Test2",
            email: "test2@mail.com",
            github: null,
            github_id: null,
        },
    },
];

// setup
beforeEach(() => {
    // mocks for orm
    ormStMock.getAllStudents.mockResolvedValue(students);
    ormStMock.createStudent.mockResolvedValue({
        student_id: 3,
        person_id: 3,
        gender: "M",
        pronouns: "He/him/his",
        phone_number: "0426719124",
        nickname: "Nick3",
        alumni: true,
    });
    ormStMock.updateStudent.mockResolvedValue({
        student_id: 2,
        person_id: 2,
        gender: "M",
        pronouns: "He/him/his",
        phone_number: "0476124356",
        nickname: "Nick4",
        alumni: true,
        person: {
            person_id: 2,
            name: "Test2",
            email: "test2@mail.com",
            github: null,
            github_id: null,
        },
    });
});

// reset
afterEach(() => {
    ormStMock.getAllStudents.mockReset();
    ormStMock.createStudent.mockReset();
    ormStMock.updateStudent.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Insert a student in the database (student not yet in the database)", async () => {
    await expect(
        addStudentToDatabase(
            {
                pronouns: "He/him/his",
                gender: "M",
                phoneNumber: "0426719124",
                nickname: "Nick3",
                alumni: true,
            },
            {
                id: 3,
            }
        )
    ).resolves.toStrictEqual({
        id: 3,
        hasAlreadyTakenPart: true,
    });

    expectCall(ormSt.createStudent, {
        personId: 3,
        pronouns: "He/him/his",
        gender: "M",
        phoneNumber: "0426719124",
        nickname: "Nick3",
        alumni: true,
    });

    expect(ormSt.getAllStudents).toHaveBeenCalledTimes(1);
});

test("Insert a student in the database (student already in the database)", async () => {
    await expect(
        addStudentToDatabase(
            {
                pronouns: "He/him/his",
                gender: "M",
                phoneNumber: "0426719124",
                nickname: "Nick3",
                alumni: true,
            },
            {
                id: 2,
            }
        )
    ).resolves.toStrictEqual({
        id: 2,
        hasAlreadyTakenPart: true,
    });

    expectCall(ormSt.updateStudent, {
        studentId: 2,
        pronouns: "He/him/his",
        gender: "M",
        phoneNumber: "0426719124",
        nickname: "Nick3",
        alumni: true,
    });

    expect(ormSt.getAllStudents).toHaveBeenCalledTimes(1);
});

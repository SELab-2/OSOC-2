import { prismaMock } from "./singleton";
import { CreateStudent, UpdateStudent } from "../../orm_functions/orm_types";
import {
    createStudent,
    deleteStudent,
    deleteStudentFromDB,
    filterStudents,
    getAllStudents,
    getAppliedYearsForStudent,
    getStudent,
    searchStudentByGender,
    updateStudent,
} from "../../orm_functions/student";
import { account_status_enum, decision_enum } from "@prisma/client";

// mock that is used to mock the deletePersonFromDB function
import * as personORM from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
export const personORMMock = personORM as jest.Mocked<typeof personORM>;

const response = {
    student_id: 0,
    alumni: false,
    nickname: "Mozz",
    gender: "Male",
    person_id: 0,
    phone_number: "0118 999 881 999 119 725 3",
    pronouns: "fire",
};

test("should create a student", async () => {
    const student: CreateStudent = {
        alumni: false,
        nickname: "Mozz",
        personId: 0,
        gender: "Male",
        phoneNumber: "0118 999 881 999 119 725 3",
        pronouns: "fire",
    };

    prismaMock.student.create.mockResolvedValue(response);
    await expect(createStudent(student)).resolves.toEqual(response);
});

test("should get all the students", async () => {
    prismaMock.student.findMany.mockResolvedValue([response]);
    await expect(getAllStudents()).resolves.toEqual([response]);
});

test("should return the student with the given student id", async () => {
    prismaMock.student.findUnique.mockResolvedValue(response);
    await expect(getStudent(0)).resolves.toEqual(response);
});

test("should update the student", async () => {
    const student: UpdateStudent = {
        studentId: 0,
        alumni: false,
        nickname: "Mozz",
        phoneNumber: "0118 999 881 999 119 725 3",
        pronouns: "fire",
    };

    prismaMock.student.update.mockResolvedValue(response);
    await expect(updateStudent(student)).resolves.toEqual(response);
});

test("should delete the student", async () => {
    prismaMock.student.delete.mockResolvedValue(response);
    await expect(deleteStudent(0)).resolves.toEqual(response);
});

test("should delete everything related to the student", async () => {
    personORMMock.deletePersonFromDB.mockResolvedValue();

    const student = {
        student_id: 0,
        person_id: 0,
        gender: "",
        pronouns: "",
        phone_number: "",
        nickname: "",
        alumni: false,
    };
    prismaMock.student.findUnique.mockResolvedValue(student);
    await deleteStudentFromDB(0);

    expect(personORMMock.deletePersonFromDB).toBeCalledTimes(1);
    expect(prismaMock.student.findUnique).toBeCalledTimes(1);

    personORMMock.deletePersonFromDB.mockReset();
});

test("should return all the people with the selected gender", async () => {
    prismaMock.student.findMany.mockResolvedValue([response]);
    await expect(searchStudentByGender("female")).resolves.toEqual([response]);
});

test("should return the students that succeed to the filtered fields", async () => {
    const returnval = [
        {
            student_id: 0,
            person_id: 0,
            gender: "",
            pronouns: "",
            phone_number: "",
            nickname: "",
            alumni: false,
        },
    ];

    prismaMock.student.findMany.mockResolvedValue(returnval);
    await expect(
        filterStudents(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            [""],
            undefined,
            undefined,
            undefined,
            2022,
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({ data: [], pagination: { count: 0, page: 0 } });
});

test("should return the students that succeed to the filtered fields but with a status filter", async () => {
    const returnval = [
        {
            student_id: 0,
            person_id: 0,
            gender: "",
            pronouns: "",
            phone_number: "",
            nickname: "",
            alumni: false,
        },
    ];

    prismaMock.student.findMany.mockResolvedValue(returnval);

    await expect(
        filterStudents(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            [""],
            undefined,
            undefined,
            decision_enum.MAYBE,
            2022,
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({ data: [], pagination: { count: 0, page: 0 } });
});

test("should return the students that succeed to the filtered fields but with a status filter", async () => {
    const returnval = [
        {
            student_id: 0,
            person_id: 0,
            gender: "",
            pronouns: "",
            phone_number: "",
            nickname: "",
            alumni: false,
        },
    ];

    prismaMock.student.findMany.mockResolvedValue(returnval);

    await expect(
        filterStudents(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            [""],
            undefined,
            undefined,
            decision_enum.MAYBE,
            undefined,
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({
        data: [
            {
                alumni: false,
                gender: "",
                nickname: "",
                person_id: 0,
                phone_number: "",
                pronouns: "",
                student_id: 0,
            },
        ],
        pagination: { count: undefined, page: 0 },
    });
});

test("should return the students that succeed to the filtered fields but with a status filter", async () => {
    const returnval = [
        {
            student_id: 0,
            person_id: 0,
            gender: "",
            pronouns: "",
            phone_number: "",
            nickname: "",
            alumni: false,
        },
    ];

    const user_response = {
        session_id: "50",
        login_user_id: 1,
        person_id: 0,
        password: "password",
        is_admin: false,
        is_coach: false,
        session_keys: ["key1", "key2"],
        account_status: account_status_enum.DISABLED,
        login_user_osoc: [
            {
                osoc: {
                    year: 2022,
                },
            },
        ],
    };

    prismaMock.student.findMany.mockResolvedValue(returnval);
    prismaMock.login_user.findUnique.mockResolvedValue(user_response);

    await expect(
        filterStudents(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            [""],
            undefined,
            undefined,
            undefined,
            2022,
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({
        data: [
            {
                alumni: false,
                gender: "",
                nickname: "",
                person_id: 0,
                phone_number: "",
                pronouns: "",
                student_id: 0,
            },
        ],
        pagination: { count: undefined, page: 0 },
    });
});

test("should return a list with the applied years", async () => {
    const val = {
        job_application: [
            {
                osoc: {
                    year: 2022,
                },
            },
            {
                osoc: {
                    year: 2023,
                },
            },
        ],
        student_id: 0,
        person_id: 0,
        gender: "",
        pronouns: "",
        phone_number: "",
        nickname: "",
        alumni: false,
    };

    prismaMock.student.findUnique.mockResolvedValue(val);
    await expect(getAppliedYearsForStudent(0)).resolves.toEqual([2022, 2023]);
});

test("should return the empty list of visible years because the student does not exist", async () => {
    prismaMock.student.findUnique.mockResolvedValue(null);
    await expect(getAppliedYearsForStudent(0)).resolves.toEqual([]);
});

import { prismaMock } from "./singleton";
import { CreateStudent, UpdateStudent } from "../../orm_functions/orm_types";
import {
    createStudent,
    deleteStudent,
    deleteStudentFromDB,
    filterStudents,
    getAllStudents,
    getStudent,
    searchStudentByGender,
    updateStudent,
} from "../../orm_functions/student";
import {
    account_status_enum,
    decision_enum,
    email_status_enum,
} from "@prisma/client";

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
    prismaMock.job_application.findMany.mockResolvedValue([
        {
            job_application_id: 0,
            student_id: 0,
            student_volunteer_info: "",
            responsibilities: "",
            fun_fact: "",
            student_coach: false,
            osoc_id: 0,
            edus: [""],
            edu_level: "",
            edu_duration: 0,
            edu_year: "",
            edu_institute: "",
            email_status: email_status_enum.DRAFT,
            created_at: new Date(),
        },
    ]);
    prismaMock.attachment.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.student.delete.mockResolvedValue({
        student_id: 0,
        person_id: 0,
        gender: "",
        pronouns: "",
        phone_number: "",
        nickname: "",
        alumni: false,
    });
    prismaMock.person.delete.mockResolvedValue({
        person_id: 0,
        email: "",
        github: "",
        firstname: "",
        lastname: "",
        github_id: "",
    });

    await deleteStudentFromDB(0);

    expect(prismaMock.job_application.findMany).toBeCalledTimes(1);
    expect(prismaMock.attachment.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.student.delete).toBeCalledTimes(1);
    expect(prismaMock.person.delete).toBeCalledTimes(1);
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
            undefined,
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
            undefined,
            0
        )
    ).resolves.toEqual([]);
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
            undefined,
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
            undefined,
            0
        )
    ).resolves.toEqual([]);
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
            undefined,
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
            undefined,
            0
        )
    ).resolves.toEqual([
        {
            alumni: false,
            gender: "",
            nickname: "",
            person_id: 0,
            phone_number: "",
            pronouns: "",
            student_id: 0,
        },
    ]);
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
            undefined,
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
            undefined,
            0
        )
    ).resolves.toEqual([
        {
            alumni: false,
            gender: "",
            nickname: "",
            person_id: 0,
            phone_number: "",
            pronouns: "",
            student_id: 0,
        },
    ]);
});

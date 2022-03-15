import {prismaMock} from "./singleton";
import {CreateStudent, UpdateStudent} from "../orm_types";
import {createStudent, deleteStudent, getAllStudents, getStudent, updateStudent} from "../student";

test("should create a student", async () => {

    const student: CreateStudent = {
        alumni: false,
        nickname: "Mozz",
        personId: 0,
        phoneNumber: "0118 999 881 999 119 725 3",
        pronouns: ["fire"]
    }

    const response = {
        student_id: 0,
        alumni: false,
        nickname: "Mozz",
        person_id: 0,
        phone_number: "0118 999 881 999 119 725 3",
        pronouns: ["fire"]
    }

    prismaMock.student.create.mockResolvedValue(response);
    await expect(createStudent(student)).resolves.toEqual(response);
});

test("should get all the students", async () => {

    const response = [
        {
            student_id: 0,
            alumni: false,
            nickname: "Mozz",
            person_id: 0,
            phone_number: "0118 999 881 999 119 725 3",
            pronouns: ["fire"]
        },
        {
            student_id: 1,
            alumni: false,
            nickname: "Roy",
            person_id: 1,
            phone_number: "0118 999 881 999 119 725 3",
            pronouns: ["hello IT"]
        }
    ]

    prismaMock.student.findMany.mockResolvedValue(response);
    await expect(getAllStudents()).resolves.toEqual(response);
});

test("should return the student with the given student id", async () => {
    const response = {
        student_id: 0,
        alumni: false,
        nickname: "Mozz",
        person_id: 0,
        phone_number: "0118 999 881 999 119 725 3",
        pronouns: ["fire"]
    }

    prismaMock.student.findUnique.mockResolvedValue(response);
    await expect(getStudent(0)).resolves.toEqual(response);
});

test("should update the student", async () => {
    const student: UpdateStudent = {
        studentId: 0,
        alumni: false,
        nickname: "Mozz",
        phoneNumber: "0118 999 881 999 119 725 3",
        pronouns: ["fire"]
    }

    const response = {
        student_id: 0,
        alumni: false,
        nickname: "Mozz",
        person_id: 0,
        phone_number: "0118 999 881 999 119 725 3",
        pronouns: ["fire, let's just put this here by the trash"]
    }

    prismaMock.student.update.mockResolvedValue(response);
    await expect(updateStudent(student)).resolves.toEqual(response);
});

test("should delete the student", async () => {
    const response = {
        student_id: 0,
        alumni: false,
        nickname: "Mozz",
        person_id: 0,
        phone_number: "0118 999 881 999 119 725 3",
        pronouns: ["fire"]
    }

    prismaMock.student.delete.mockResolvedValue(response);
    await expect(deleteStudent(0)).resolves.toEqual(response);
});
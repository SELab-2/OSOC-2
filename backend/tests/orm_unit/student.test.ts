import {prismaMock} from "./singleton";
import {CreateStudent, UpdateStudent} from "../../orm_functions/orm_types";
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    getStudent,
    searchStudentByGender,
    updateStudent
} from "../../orm_functions/student";

const response = {
    student_id: 0,
    alumni: false,
    nickname: "Mozz",
    gender: 'Male',
    person_id: 0,
    phone_number: "0118 999 881 999 119 725 3",
    pronouns: "fire"
}

test("should create a student", async () => {

    const student: CreateStudent = {
        alumni: false,
        nickname: "Mozz",
        personId: 0,
        gender: 'Male',
        phoneNumber: "0118 999 881 999 119 725 3",
        pronouns: "fire"
    }

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
        pronouns: "fire"
    }

    prismaMock.student.update.mockResolvedValue(response);
    await expect(updateStudent(student)).resolves.toEqual(response);
});

test("should delete the student", async () => {
    prismaMock.student.delete.mockResolvedValue(response);
    await expect(deleteStudent(0)).resolves.toEqual(response);
});

test("should return all the people with the selected gender", async () => {
    prismaMock.student.findMany.mockResolvedValue([response]);
    await expect(searchStudentByGender("female")).resolves.toEqual([response]);
});
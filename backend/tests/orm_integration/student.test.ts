import { CreateStudent, UpdateStudent } from "../../orm_functions/orm_types";
import prisma from "../../prisma/prisma";
import {
  createStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  searchStudentByGender,
  deleteStudent,
} from "../../orm_functions/student";

const student1: UpdateStudent = {
  studentId: 0,
  gender: "Male",
  pronouns: "He/ Him",
  phoneNumber: "013456789",
  nickname: "Superman",
  alumni: true,
};

const student2: UpdateStudent = {
  studentId: 0,
  gender: "Female",
  pronouns: "She/ Her",
  phoneNumber: "9876543210",
  nickname: "Superwoman",
  alumni: true,
};

it("should create 1 new student", async () => {
  const person = await prisma.person.findMany();
  if (person) {
    const student: CreateStudent = {
      personId: person[0].person_id,
      gender: "Male",
      pronouns: "He/ Him",
      phoneNumber: "013456789",
      nickname: "Superman",
      alumni: true,
    };

    const created_student = await createStudent(student);
    student1.studentId = created_student.student_id;
    student2.studentId = created_student.student_id;
    expect(created_student).toHaveProperty(
      "student_id",
      created_student.student_id
    );
    expect(created_student).toHaveProperty("gender", created_student.gender);
    expect(created_student).toHaveProperty(
      "pronouns",
      created_student.pronouns
    );
    expect(created_student).toHaveProperty(
      "phone_number",
      created_student.phone_number
    );
    expect(created_student).toHaveProperty(
      "nickname",
      created_student.nickname
    );
    expect(created_student).toHaveProperty("alumni", created_student.alumni);
  }
});

it("should find all the students in the db, 3 in total", async () => {
  const searched_students = await getAllStudents();
  expect(searched_students.length).toEqual(4);
  expect(searched_students[3]).toHaveProperty("student_id", student1.studentId);
  expect(searched_students[3]).toHaveProperty("gender", student1.gender);
  expect(searched_students[3]).toHaveProperty("pronouns", student1.pronouns);
  expect(searched_students[3]).toHaveProperty(
    "phone_number",
    student1.phoneNumber
  );
  expect(searched_students[3]).toHaveProperty("nickname", student1.nickname);
  expect(searched_students[3]).toHaveProperty("alumni", student1.alumni);
});

it("should return the student, by searching for its id", async () => {
  const searched_student = await getStudent(student1.studentId);
  expect(searched_student).toHaveProperty("student_id", student1.studentId);
  expect(searched_student).toHaveProperty("gender", student1.gender);
  expect(searched_student).toHaveProperty("pronouns", student1.pronouns);
  expect(searched_student).toHaveProperty("phone_number", student1.phoneNumber);
  expect(searched_student).toHaveProperty("nickname", student1.nickname);
  expect(searched_student).toHaveProperty("alumni", student1.alumni);
});

it("should return the students, by searching for gender", async () => {
  const searched_student = await searchStudentByGender("Male");
  expect(searched_student.length).toEqual(2);
  expect(searched_student[1]).toHaveProperty("student_id", student1.studentId);
  expect(searched_student[1]).toHaveProperty("gender", student1.gender);
  expect(searched_student[1]).toHaveProperty("pronouns", student1.pronouns);
  expect(searched_student[1]).toHaveProperty(
    "phone_number",
    student1.phoneNumber
  );
  expect(searched_student[1]).toHaveProperty("nickname", student1.nickname);
  expect(searched_student[1]).toHaveProperty("alumni", student1.alumni);
});

it("should update student based upon student id", async () => {
  const updated_student = await updateStudent(student2);
  expect(updated_student).toHaveProperty("student_id", student2.studentId);
  expect(updated_student).toHaveProperty("gender", student2.gender);
  expect(updated_student).toHaveProperty("pronouns", student2.pronouns);
  expect(updated_student).toHaveProperty("phone_number", student2.phoneNumber);
  expect(updated_student).toHaveProperty("nickname", student2.nickname);
  expect(updated_student).toHaveProperty("alumni", student2.alumni);
});

it("should delete the student based upon student id", async () => {
  const deleted_student = await deleteStudent(student2.studentId);
  expect(deleted_student).toHaveProperty("student_id", student2.studentId);
  expect(deleted_student).toHaveProperty("gender", student2.gender);
  expect(deleted_student).toHaveProperty("pronouns", student2.pronouns);
  expect(deleted_student).toHaveProperty("phone_number", student2.phoneNumber);
  expect(deleted_student).toHaveProperty("nickname", student2.nickname);
  expect(deleted_student).toHaveProperty("alumni", student2.alumni);
});

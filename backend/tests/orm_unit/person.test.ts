import { prismaMock } from "./singleton";
import { CreatePerson, UpdatePerson } from "../../orm_functions/orm_types";
import {
    createPerson,
    deletePersonById,
    deletePersonFromDB,
    getAllPersons,
    getPasswordPersonByEmail,
    getPasswordPersonByGithub,
    searchPersonByLogin,
    searchPersonByName,
    updatePerson,
} from "../../orm_functions/person";
import { account_status_enum, email_status_enum } from "@prisma/client";

const returnValue = {
    person_id: 0,
    email: "email@mail.com",
    name: "name",
    github: null,
    github_id: "666",
};

test("should create a person in the db with the given object, returns the new record", async () => {
    const person: CreatePerson = {
        email: "email@mail.com",
        name: "name",
    };

    prismaMock.person.create.mockResolvedValue(returnValue);
    await expect(createPerson(person)).resolves.toEqual(returnValue);
});

test("should return all people in the db", async () => {
    prismaMock.person.findMany.mockResolvedValue([returnValue]);
    await expect(getAllPersons()).resolves.toEqual([returnValue]);
});

test("should return the HASHED password of the given email", async () => {
    prismaMock.person.findUnique.mockResolvedValue(returnValue);
    await expect(getPasswordPersonByEmail("email@mail.com")).resolves.toEqual(
        returnValue
    );
});

test("should return the password of the user with given github", async () => {
    prismaMock.person.findUnique.mockResolvedValue(returnValue);
    await expect(getPasswordPersonByGithub("github name")).resolves.toEqual(
        returnValue
    );
});

test("should return the searched person record with the given name", async () => {
    prismaMock.person.findMany.mockResolvedValue([returnValue]);
    await expect(searchPersonByName("name")).resolves.toEqual([returnValue]);
});

test("should return all the people with the given login (email or github)", async () => {
    prismaMock.person.findMany.mockResolvedValue([returnValue]);
    await expect(searchPersonByLogin("dvl@github.com")).resolves.toEqual([
        returnValue,
    ]);
});

test("should update the person with the new data and return the updated record", async () => {
    const person: UpdatePerson = {
        email: "email@mail.com",
        name: "new_name",
        github: null,
        personId: 0,
    };

    prismaMock.person.update.mockResolvedValue(returnValue);
    await expect(updatePerson(person)).resolves.toEqual(returnValue);
});

test("should delete the person with the given id and return the deleted record", async () => {
    prismaMock.person.delete.mockResolvedValue(returnValue);
    await expect(deletePersonById(0)).resolves.toEqual(returnValue);
});

test("should delete a person with the given id from the database", async () => {
    const person = {
        person_id: 0,
        email: "",
        github: "",
        name: "",
        github_id: "",
        login_user: {
            login_user_id: 0,
        },
        student: {
            student_id: 0,
        },
    };

    prismaMock.person.findUnique.mockResolvedValue(person);
    prismaMock.password_reset.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.project_user.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.session_keys.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.login_user.delete.mockResolvedValue({
        login_user_id: 0,
        person_id: 0,
        password: "",
        is_admin: false,
        is_coach: true,
        account_status: account_status_enum.DISABLED,
    });
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
            email_status: email_status_enum.APPLIED,
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
        name: "",
        github_id: "",
    });

    await deletePersonFromDB(0);

    expect(prismaMock.person.findUnique).toBeCalledTimes(1);
    expect(prismaMock.password_reset.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.project_user.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.session_keys.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.login_user.delete).toBeCalledTimes(1);
    expect(prismaMock.job_application.findMany).toBeCalledTimes(1);
    expect(prismaMock.attachment.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.student.delete).toBeCalledTimes(1);
    expect(prismaMock.person.delete).toBeCalledTimes(1);
});

import { prismaMock } from "./singleton";
import { CreatePerson, UpdatePerson } from "../../orm_functions/orm_types";
import {
    createPerson,
    deletePersonById,
    getAllPersons,
    getPasswordPersonByEmail,
    getPasswordPersonByGithub,
    searchPersonByLogin,
    searchPersonByName,
    updatePerson,
} from "../../orm_functions/person";

const returnValue = {
    person_id: 0,
    email: "email@mail.com",
    firstname: "FirstName",
    lastname: "LastName",
    github: null,
    github_id: "666",
};

test("should create a person in the db with the given object, returns the new record", async () => {
    const person: CreatePerson = {
        email: "email@mail.com",
        firstname: "FirstName",
        lastname: "LastName",
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
        firstname: "newFirst",
        github: null,
        lastname: "",
        personId: 0,
    };

    prismaMock.person.update.mockResolvedValue(returnValue);
    await expect(updatePerson(person)).resolves.toEqual(returnValue);
});

test("should delete the person with the given id and return the deleted record", async () => {
    prismaMock.person.delete.mockResolvedValue(returnValue);
    await expect(deletePersonById(0)).resolves.toEqual(returnValue);
});

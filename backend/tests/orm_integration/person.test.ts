import { CreatePerson, UpdatePerson } from "../../orm_functions/orm_types";
import {
    createPerson,
    getAllPersons,
    searchPersonByName,
    searchPersonByLogin,
    updatePerson,
    deletePersonById,
} from "../../orm_functions/person";

const person4: CreatePerson = {
    email: "test@email.be",
    name: "name",
};

const person5: CreatePerson = {
    github: "testhub.com",
    name: "person5",
};

import "../integration_setup";

it("should create 1 new person where github is null", async () => {
    const person0: CreatePerson = {
        email: "test@email.be",
        name: "name",
    };

    const created_person = await createPerson(person0);
    expect(created_person).toHaveProperty("github", null);
    expect(created_person).toHaveProperty("name", person0.name);
    expect(created_person).toHaveProperty("email", person0.email);
});

it("should create 1 new person where email is null", async () => {
    const person1: CreatePerson = {
        github: "testhub.com",
        name: "person5",
    };

    const created_person = await createPerson(person1);
    expect(created_person).toHaveProperty("github", person1.github);
    expect(created_person).toHaveProperty("name", person1.name);
    expect(created_person).toHaveProperty("email", null);
});

it("should find all the persons in the db, 2 in total", async () => {
    const searched_persons = await getAllPersons();
    expect(searched_persons[5]).toHaveProperty("github", null);
    expect(searched_persons[5]).toHaveProperty("name", person4.name);
    expect(searched_persons[5]).toHaveProperty("email", person4.email);

    expect(searched_persons[6]).toHaveProperty("github", person5.github);
    expect(searched_persons[6]).toHaveProperty("name", person5.name);
    expect(searched_persons[6]).toHaveProperty("email", null);
});

// Can only be tested with a login user, should therefore be tested in the login user tests?
/*it('should find person 1 in the db, by searching for its email', async () => {
    const searched_person = await getPasswordPersonByEmail(person4.email!);
    expect(searched_person).toHaveProperty("github", person4.github);
    expect(searched_person).toHaveProperty("firstname", person4.firstname);
    expect(searched_person).toHaveProperty("lastname", person4.lastname);
    expect(searched_person).toHaveProperty("email", person4.email);
});*/

it("should find person 1 in the db, by searching for its firstname", async () => {
    const searched_person = await searchPersonByName(person4.name);
    expect(searched_person[0]).toHaveProperty("github", null);
    expect(searched_person[0]).toHaveProperty("name", person4.name);
    expect(searched_person[0]).toHaveProperty("email", person4.email);
});

it("should find all the persons in the db with given email, 1 in total", async () => {
    if (person4.email != undefined) {
        const searched_persons = await searchPersonByLogin(person4.email);
        expect(searched_persons[0]).toHaveProperty("github", null);
        expect(searched_persons[0]).toHaveProperty("name", person4.name);
        expect(searched_persons[0]).toHaveProperty("email", person4.email);
    }
});

it("should find all the persons in the db with given github, 1 in total", async () => {
    if (person5.github) {
        const searched_persons = await searchPersonByLogin(person5.github);
        expect(searched_persons[0]).toHaveProperty("github", person5.github);
        expect(searched_persons[0]).toHaveProperty("name", person5.name);
        expect(searched_persons[0]).toHaveProperty("email", null);
    }
});

it("should update person based upon personid", async () => {
    const searched_person3 = await searchPersonByName(person4.name);
    const personUpdate: UpdatePerson = {
        personId: searched_person3[0].person_id,
        email: "new@email.be",
        name: "new_name",
    };
    const updated_person = await updatePerson(personUpdate);
    expect(updated_person).toHaveProperty("github", null);
    expect(updated_person).toHaveProperty("name", personUpdate.name);
    -expect(updated_person).toHaveProperty("email", personUpdate.email);
});

it("should delete the person based upon personid", async () => {
    const searched_person5 = await searchPersonByName(person5.name);
    const deleted_person = await deletePersonById(
        searched_person5[0].person_id
    );
    expect(deleted_person).toHaveProperty(
        "person_id",
        searched_person5[0].person_id
    );
    expect(deleted_person).toHaveProperty("github", deleted_person.github);
    expect(deleted_person).toHaveProperty("name", deleted_person.name);
    expect(deleted_person).toHaveProperty("email", deleted_person.email);
});

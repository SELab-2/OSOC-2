import {CreatePerson, UpdatePerson} from "../../orm_functions/orm_types";
import {createPerson, getAllPersons,
    searchPersonByName, searchPersonByLogin, updatePerson, deletePersonById} 
    from "../../orm_functions/person";

const person2 : UpdatePerson = {
    personId: 2,
    email: "test@email.be",
    github: null,
    firstname: "first_name",
    lastname: "last_name",
}

const person3: UpdatePerson = {
    personId: 3,
    github: "testhub.com",
    email: null,
    firstname: "person3",
    lastname: "second name",
}

it('should create 1 new person where github is null', async () => {
    const person0: CreatePerson = {
        email: "test@email.be",
        firstname: "first_name",
        lastname: "last_name",
    }

    const created_person = await createPerson(person0);
    expect(created_person).toHaveProperty("github", null);
    expect(created_person).toHaveProperty("firstname", person0.firstname);
    expect(created_person).toHaveProperty("lastname", person0.lastname);
    expect(created_person).toHaveProperty("email", person0.email);
});

it('should create 1 new person where email is null', async () => {
    const person1: CreatePerson = {
        github: "testhub.com",
        firstname: "person3",
        lastname: "second name",
    }

    const created_person = await createPerson(person1);
    expect(created_person).toHaveProperty("github", person1.github);
    expect(created_person).toHaveProperty("firstname", person1.firstname);
    expect(created_person).toHaveProperty("lastname", person1.lastname);
    expect(created_person).toHaveProperty("email", null);
});

it('should find all the persons in the db, 2 in total', async () => {
    const searched_persons = await getAllPersons();
    expect(searched_persons[2]).toHaveProperty("github", person2.github);
    expect(searched_persons[2]).toHaveProperty("firstname", person2.firstname);
    expect(searched_persons[2]).toHaveProperty("lastname", person2.lastname);
    expect(searched_persons[2]).toHaveProperty("email", person2.email);

    expect(searched_persons[3]).toHaveProperty("github", person3.github);
    expect(searched_persons[3]).toHaveProperty("firstname", person3.firstname);
    expect(searched_persons[3]).toHaveProperty("lastname", person3.lastname);
    expect(searched_persons[3]).toHaveProperty("email", person3.email);
});

// Can only be tested with a login user, should therefore be tested in the login user tests?
/*it('should find person 1 in the db, by searching for its email', async () => {
    const searched_person = await getPasswordPersonByEmail(person2.email!);
    expect(searched_person).toHaveProperty("github", person2.github);
    expect(searched_person).toHaveProperty("firstname", person2.firstname);
    expect(searched_person).toHaveProperty("lastname", person2.lastname);
    expect(searched_person).toHaveProperty("email", person2.email);
});*/

it('should find person 1 in the db, by searching for its firstname', async () => {
    const searched_person = await searchPersonByName(person2.firstname!);
    expect(searched_person[0]).toHaveProperty("github", person2.github);
    expect(searched_person[0]).toHaveProperty("firstname", person2.firstname);
    expect(searched_person[0]).toHaveProperty("lastname", person2.lastname);
    expect(searched_person[0]).toHaveProperty("email", person2.email);
});

it('should find person 2 in the db, by searching for its lastname', async () => {
    const searched_person3 = await searchPersonByName(person3.lastname!);
    expect(searched_person3[0]).toHaveProperty("github", person3.github);
    expect(searched_person3[0]).toHaveProperty("firstname", person3.firstname);
    expect(searched_person3[0]).toHaveProperty("lastname", person3.lastname);
    expect(searched_person3[0]).toHaveProperty("email", person3.email);
});

it('should find all the persons in the db with given email, 1 in total', async () => {
    const searched_persons = await searchPersonByLogin(person2.email!);
    expect(searched_persons[0]).toHaveProperty("github", person2.github);
    expect(searched_persons[0]).toHaveProperty("firstname", person2.firstname);
    expect(searched_persons[0]).toHaveProperty("lastname", person2.lastname);
    expect(searched_persons[0]).toHaveProperty("email", person2.email);
});

it('should find all the persons in the db with given github, 1 in total', async () => {
    const searched_persons = await searchPersonByLogin(person3.github!);
    expect(searched_persons[0]).toHaveProperty("github", person3.github);
    expect(searched_persons[0]).toHaveProperty("firstname", person3.firstname);
    expect(searched_persons[0]).toHaveProperty("lastname", person3.lastname);
    expect(searched_persons[0]).toHaveProperty("email", person3.email);
});

it('should update person based upon personid', async () => {
    const searched_person2 = await searchPersonByName(person2.firstname!);
    const personUpdate: UpdatePerson = {
        personId: searched_person2[0].person_id,
        email: "new@email.be",
        firstname: "new_name",
        lastname: "different_name",
    }
    const updated_person = await updatePerson(personUpdate);
    expect(updated_person).toHaveProperty("github", null);
    expect(updated_person).toHaveProperty("firstname", personUpdate.firstname);
    expect(updated_person).toHaveProperty("lastname", personUpdate.lastname);
    expect(updated_person).toHaveProperty("email", personUpdate.email);
});

it('should delete the person based upon personid', async () => {
    const searched_person3 = await searchPersonByName(person3.lastname!);
    const deleted_person = await deletePersonById(searched_person3[0].person_id);
    expect(deleted_person).toHaveProperty("person_id", searched_person3[0].person_id);
    expect(deleted_person).toHaveProperty("github", deleted_person.github);
    expect(deleted_person).toHaveProperty("firstname", deleted_person.firstname);
    expect(deleted_person).toHaveProperty("lastname", deleted_person.lastname);
    expect(deleted_person).toHaveProperty("email", deleted_person.email);
});

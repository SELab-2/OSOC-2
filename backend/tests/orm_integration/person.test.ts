import {CreatePerson} from "../../orm_functions/orm_types";
import {createPerson} from "../../orm_functions/person";


it('should create 1 new person', async () => {
    const person: CreatePerson = {
        email: "test@email.be",
        firstname: "first_name",
        lastname: "last_name",
    }

    const created_person = await createPerson(person);
    expect(created_person).toHaveProperty("github", null);
    expect(created_person).toHaveProperty("firstname", person.firstname);
    expect(created_person).toHaveProperty("github", null);
    expect(created_person).toHaveProperty("firstname", person.firstname);
    expect(created_person).toHaveProperty("lastname", person.lastname);
    expect(created_person).toHaveProperty("email", person.email);
});
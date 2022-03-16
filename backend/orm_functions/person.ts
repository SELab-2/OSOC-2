import prisma from '../prisma/prisma'
import {CreatePerson, UpdatePerson} from './orm_types';


// console.log(await search_person_by_name("Alice"));

/*(async () => {
    console.log(await searchPersonByName("Alice"));
   }
 )()*/

/**
 * 
 * @param person: person object with the needed information
 */
export async function create_person(person: CreatePerson){
    const result = await prisma.person.create({
        data: {
            firstname: person.firstname,
            lastname: person.lastname,
            gender: person.gender,
            github: person.github,
            email: person.email
        },
    });
    return result;
}

/**
 * 
 * @returns a list of all the person objects in the database
 */
 export async function getAllPersons() {
    return await prisma.person.findMany()
}

/**
 * 
 * @param name: This is the name of the person we are looking, can be firstname as lastname
 * @returns: a list of all the person objects in the database that match
 */
export async function searchPersonByName(name : string){
    const result = await prisma.person.findMany({
        where: {
            OR: [
                {
                    firstname: { contains: name },
                },
                {
                    lastname: { contains: name },
                },
            ],
        },
    });
    return result;
}

/**
 * 
 * @param gender: This is the gender of the persons we are looking, can be firstname as lastname
 * @returns: a list of all the person objects in the database that match
 */
export async function searchPersonByGender(gender : string){
    const result = prisma.person.findMany({
        where: { gender : gender },
    });
    return result;
}

/**
 * 
 * @param login: This is the email or GitHub of the person we are looking for
 * @returns: a list of all the person objects in the database that match either the email or github
 */
export async function searchPersonByLogin(login : string){
    const result = prisma.person.findMany({
        where: {
            OR: [
                {
                    email: { contains: login },
                },
                {
                    github: { contains: login },
                },
            ],
        },
    });
    return result;
}

/**
 * 
 * @param person: UpdatePerson object with the values that need to be updated
 * @returns the updated entry in the database 
 */
export async function updatePerson(person: UpdatePerson){
    const result = await prisma.person.update({
        where : {
            person_id: person.personId
        },
        data: {
            firstname: person.firstname,
            lastname: person.lastname,
            gender: person.gender,
            github: person.github,
            email: person.email
        },
    });
    return result;
}

/**
 * 
 * @param personId the person who's info we are deleting from the person-table
 * @returns message //TODO: what does this return
 */
export async function deletePersonById(personId : number){
    const result = await prisma.person.deleteMany({
        where: {
            person_id: personId
        }
    });
    return result;
}

import {prisma} from '../prisma/prisma'


// console.log(await search_person_by_name("Alice"));

(async () => {
    console.log(await searchPersonByName("Alice"));
   }
 )()

// Create Person
export async function create_person(firstname : string, lastname : string, gender : string, github : string, email : string){
    const result = await prisma.person.create({
        data: {
            firstname: firstname,
            lastname: lastname,
            gender: gender,
            github: github,
            email: email
        },
    });
    return result;
}

// Search Person by name
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

// Search Person by gender
export async function searchPersonByGender(gender : string){
    const result = prisma.person.findMany({
        where: { gender : gender },
    });
    return result;
}

// Search Person by login
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

// Remove Person by id
export async function deletePersonById(personId : number){
    const result = await prisma.person.deleteMany({
        where: {
            person_id: personId
        }
    });
    return result;
}

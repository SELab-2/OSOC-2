import {prisma} from '../prisma/prisma'


// console.log(await search_person_by_name("Alice"));

(async () => {
    console.log(await search_person_by_name("Alice"));
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
export async function search_person_by_name(search_string : string){
    const result = await prisma.person.findMany({
        where: {
            OR: [
                {
                    firstname: { contains: search_string },
                },
                {
                    lastname: { contains: search_string },
                },
            ],
        },
    });
    return result;
}

// Search Person by gender
export async function search_person_by_gender(search_string : string){
    const result = prisma.person.findMany({
        where: { gender : search_string},
    });
    return result;
}

// Search Person by login
export async function search_person_by_login(search_string : string){
    const result = prisma.person.findMany({
        where: {
            OR: [
                {
                    email: { contains: search_string },
                },
                {
                    github: { contains: search_string },
                },
            ],
        },
    });
    return result;
}

// Remove Person by id
export async function delete_person_by_id(delete_id : number){
    const result = await prisma.person.deleteMany({
        where: {
            person_id: {
                in: delete_id
            }
        }
    });
    return result;
}

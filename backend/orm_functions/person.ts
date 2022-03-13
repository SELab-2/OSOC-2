import prisma from '../prisma/prisma'


console.log(search_person_by_name("Alice"));

// Create Person
export function create_person(firstname : string, lastname : string, gender : string, github : string, email : string){
    prisma.person.create({
        data: {
            firstname: firstname,
            lastname: lastname,
            gender: gender,
            github: github,
            email: email
        },
    })
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
    })
    return result;
}

// Search Person by gender
export async function search_person_by_gender(search_string : string){
    const result = prisma.person.findMany({
        where: { gender : search_string},
    })
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
    })
    return result;
}

// Remove Person by id
export function delete_person_by_id(delete_id : number){
    prisma.person.deleteMany({
        where: {
            person_id: {
                in: delete_id
            }
        }
    })
}

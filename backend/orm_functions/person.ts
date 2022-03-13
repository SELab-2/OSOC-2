import prisma from '../prisma/prisma'


// Create Person
export function create_person(firstname, lastname, gender, github, email){
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
export function search_person_by_name(search_string){
    prisma.person.findMany({
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
}

// Search Person by gender
export function search_person_by_gender(search_string){
    prisma.person.findMany({
        where: { gender : search_string},
    })
}

// Search Person by login
export function search_person_by_login(search_string){
    prisma.person.findMany({
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
}

// Remove Person by id
export function delete_person_by_id(delete_id){
    prisma.person.deleteMany({
        where: {
            person_id: {
                in: delete_id
            }
        }
    })
}

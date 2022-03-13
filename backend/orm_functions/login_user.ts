import {prisma} from '../prisma/prisma'
import { search_person_by_name } from './person';

(async () => {
    const person = await search_person_by_name("Bob");
    console.log(await person[0].person_id);
    console.log(await search_login_user_by_person(person[0].person_id));
   }
 )()


// Create Login User
export async function create_login_user(person_id : number, password : string, is_admin : boolean, is_coach : boolean){
    const result = await prisma.login_user.create({
        data: {
            person_id: person_id,
            password: password,
            is_admin: is_admin,
            is_coach: is_coach
        },
    });
    return result;
}

// Search Login User by Person
export async function search_login_user_by_person(search_string : number){
    const result = await prisma.login_user.findMany({
        where: { person_id : search_string },
    });
    return result;
}

// Search all admin Login User
export async function search_all_admin_login_users(search : boolean){
    const result = await prisma.login_user.findMany({
        where: { is_admin : search },
    });
    return result;
}

// Search all coach Login User
export async function search_all_coach_login_users(search : boolean){
    const result = await prisma.login_user.findMany({
        where: { is_coach : search },
    });
    return result;
}

// Search all coach Login User
export async function search_all_admin_and_coach_login_users(search : boolean){
    const result = await prisma.login_user.findMany({
        where: { 
            AND: [
                {
                    is_admin: search
                },
                {
                    is_coach: search
                },
            ],
        }
    });
    return result;
}

// Remove Login User by id
export async function delete_login_user_by_id(delete_id : number){
    const result = await prisma.login_user.deleteMany({
        where: { login_user_id: delete_id }
    });
    return result;
}

// Remove Login User by Person id
export async function delete_login_user_by_person_id(delete_id : number){
    const result = await prisma.login_user.deleteMany({
        where: { person_id: delete_id},
    });
    return result;
}

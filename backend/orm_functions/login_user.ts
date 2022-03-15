import prisma from '../prisma/prisma'
import { searchPersonByName } from './person';

(async () => {
    const person = await searchPersonByName("Bob");
    console.log(await person[0].person_id);
    console.log(await searchLoginUserByPerson(person[0].person_id));
   }
 )()


// Create Login User
export async function createLoginUser(personId : number, password : string, isAdmin : boolean, isCoach : boolean){
    const result = await prisma.login_user.create({
        data: {
            person_id: personId,
            password: password,
            is_admin: isAdmin,
            is_coach: isCoach
        },
    });
    return result;
}

// Search Login User by Person
export async function searchLoginUserByPerson(personId : number){
    const result = await prisma.login_user.findMany({
        where: { person_id : personId },
    });
    return result;
}

// Search all admin Login User
export async function searchAllAdminLoginUsers(isAdmin : boolean){
    const result = await prisma.login_user.findMany({
        where: { is_admin : isAdmin },
    });
    return result;
}

// Search all coach Login User
export async function searchAllCoachLoginUsers(isCoach : boolean){
    const result = await prisma.login_user.findMany({
        where: { is_coach : isCoach },
    });
    return result;
}

// Search all coach Login User
export async function searchAllAdminAndCoachLoginUsers(bool : boolean){
    const result = await prisma.login_user.findMany({
        where: { 
            AND: [
                {
                    is_admin: bool
                },
                {
                    is_coach: bool
                },
            ],
        }
    });
    return result;
}

// Update Login User
export async function updateLoginUser(loginUserId : number, personId : number, password : string, isAdmin : boolean, isCoach : boolean){
    const result = await prisma.login_user.update({
        where : {
            login_user_id : loginUserId
        },
        data: {
            person_id: personId,
            password: password,
            is_admin: isAdmin,
            is_coach: isCoach
        },
    });
    return result;
}

// Remove Login User by id
export async function deleteLoginUserById(deleteId : number){
    const result = await prisma.login_user.deleteMany({
        where: { login_user_id: deleteId }
    });
    return result;
}

// Remove Login User by Person id
export async function deleteLoginUserByPersonId(deleteId : number){
    const result = await prisma.login_user.deleteMany({
        where: { person_id: deleteId},
    });
    return result;
}

/**
 * 
 * @param sessionId: the sessionID we want to check if it is valid/exists
 * @returns the found sessionID or null if the session ID doesn't exist in the database
 */
export async function checkValidSession(sessionId: string) {
    const result = await prisma.login_user.findUnique({
        where: {
            session_id: sessionId,
        },
        select: {
            session_id: true,
        }
    });
    return result;
}

/**
 * 
 * @param loginUserId: the user for which we are updating the ID
 * @param sessionId: the new sessionID for this user
 * @returns the updated session id
 */
export async function setSessionId(loginUserId:number, sessionId: string) {
    const result = await prisma.login_user.update({
        where: {
            login_user_id: loginUserId,
        },
        data: {
            session_id: sessionId,
        },
        select: {
            session_id: true,
        }
    });
    return result;
}

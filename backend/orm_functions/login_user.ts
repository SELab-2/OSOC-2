import prisma from '../prisma/prisma'
// import {searchPersonByName} from './person';

// (async () => {
//     const person = await searchPersonByName("Bob");
//     console.log(await person[0].person_id);
//     console.log(await searchLoginUserByPerson(person[0].person_id));
//    }
//  )()


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
 * checks if the sessionID for the loginUser is valid and if true it also removes the key from the keys array
 *
 * @param loginUserId: the userId of the user that tries to make a request
 * @param sessionKey: the sessionKey we want to check if it is valid/exists
 * @returns true if the session key was in the valid keys
 */
export async function checkValidSessionAndRemove(loginUserId: number, sessionKey: string) {
    const keys = await getSessionKeys(loginUserId);
    const result = keys && keys.session_keys.includes(sessionKey)
    // update the database
    if (result) {
        prisma.login_user.update({
            where: {
                login_user_id: loginUserId
            },
            data : {
                session_keys: keys.session_keys.filter(key => key != sessionKey),
            }
        });
    }
    return result;
}

/**
 *
 * @param loginUserId: the user for who we are searching all his (valid) session keys
 * @returns all the valid session keys
 */
export async function getSessionKeys(loginUserId: number) {
    return await prisma.login_user.findUnique({
        where: {
            login_user_id: loginUserId,
        },
        select : {
            session_keys: true,
        }
    });
}

/**
 * 
 * @param loginUserId: the user for which we are updating the session keys
 * @param sessionKey: the new sessionKey for this user
 * @returns the updated sessionKeys array if the loginUserId existed
 */
export async function setSessionId(loginUserId:number, sessionKey: string) {
    const keys = await getSessionKeys(loginUserId);
    if (keys) {
        keys.session_keys.push(sessionKey);
        return await prisma.login_user.update({
            where: {
                login_user_id: loginUserId,
            },
            data: {
                session_keys: keys.session_keys,
            },
            select: {
                session_keys: true,
            }
        });
    }
    return Promise.reject(new Error("login user id does not exist in the database"));

}

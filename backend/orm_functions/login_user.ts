import prisma from '../prisma/prisma'

import {CreateLoginUser, UpdateLoginUser} from './orm_types';

/**
 *
 * @param loginUser: login user object with the needed information
 */
export async function createLoginUser(loginUser: CreateLoginUser) {
  const result = await prisma.login_user.create({
    data : {
      person_id : loginUser.personId,
      password : loginUser.password,
      is_admin : loginUser.isAdmin,
      is_coach : loginUser.isCoach,
      account_status : loginUser.accountStatus
    },
  });
  return result;
}

/**
 *
 * @returns a list of all the login user objects in the database
 */
export async function getAllLoginUsers() {
  return await prisma.login_user.findMany({include : {person : true}});
}

/**
 *
 * @param personId: this is the person id of the login user we are looking up in
 *     the database
 * @returns: password of the login user object
 */
export async function getPasswordLoginUserByPerson(personId: number) {
  const result = await prisma.login_user.findUnique(
      {where : {person_id : personId}, select : {password : true}});
  return result;
}

/**
 *
 * @param loginUserId: this is the login user id of the login user we are
 *     looking up in the database
 * @returns: password of the login user object
 */
export async function getPasswordLoginUser(loginUserId: number) {
  const result = await prisma.login_user.findUnique(
      {where : {login_user_id : loginUserId}, select : {password : true}});
  return result;
}

/**
 *
 * @param personId: this is the person id of the login user we are looking up in
 *     the database
 * @returns: login user object
 */
export async function searchLoginUserByPerson(personId: number){
    const result = await prisma.login_user.findUnique({
        where: { 
            person_id: personId
        },
        include : {
            person: true,
        }
    });
    return result;
}

/**
 *
 * @param isAdmin: boolean value for the admin status
 * @returns: all login user objects that match with the admin status
 */
export async function searchAllAdminLoginUsers(isAdmin: boolean) {
  const result = await prisma.login_user.findMany({
    where : {is_admin : isAdmin},
    include : {
      person : true,
    }
  });
  return result;
}

/**
 *
 * @param isCoach: boolean value for the coach status
 * @returns: all login user objects that match with the coach status
 */
export async function searchAllCoachLoginUsers(isCoach: boolean) {
  const result = await prisma.login_user.findMany({
    where : {is_coach : isCoach},
    include : {
      person : true,
    }
  });
  return result;
}

/**
 *
 * @param bool: boolean value for the admin and coach status
 * @returns: all login user objects where the bool matches with both the admin and coach status
 */
export async function searchAllAdminAndCoachLoginUsers(bool: boolean){
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
        },
        include: {
            person: true,
        }
    });
    return result;
}

/**
 * 
 * @param loginUser: UpdateLoginUser object with the values that need to be updated
 * @returns the updated entry in the database 
 */
export async function updateLoginUser(loginUser: UpdateLoginUser){
    const result = await prisma.login_user.update({
        where : {
            login_user_id: loginUser.loginUserId
        },
        data: {
            password: loginUser.password,
            is_admin: loginUser.isAdmin,
            is_coach: loginUser.isCoach,
            account_status: loginUser.accountStatus
        },
        include: {
            person: true,
        }
    });
    return result;
}

/**
 * 
 * @param loginUserId the login user who's info we are deleting from the login user-table
 * @returns personal info about the login user, this info can be used to further remove the person
 */
export async function deleteLoginUserById(loginUserId: number){
    const result = await prisma.login_user.delete({
        where: { 
            login_user_id: loginUserId 
        },
        include: { // returns the person info of the removed login user
            person: true
        }   
    });
    return result;
}

/**
 *
 * @param personId the login user who's info we are deleting from the login
 *     user-table
 * @returns personal info about the login user, this info can be used to further
 *     remove the person
 */
export async function deleteLoginUserByPersonId(personId: number) {
  const result = await prisma.login_user.delete({
    where : {person_id : personId},
    include : {
      // returns the person info of the removed login user
      person : true
    }
  });
  return result;
}

/**
 *
 * @param loginUserId: the id of the loginUser we are searching
 * @returns promise with the found data, or promise with null inside if no
 *     loginUser has the given id
 */
export async function getLoginUserById(loginUserId: number) {
  return await prisma.login_user.findUnique({
    where : {
      login_user_id : loginUserId,
    },
    include : {person : true}
  });
}

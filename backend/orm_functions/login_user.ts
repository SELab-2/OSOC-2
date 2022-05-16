import prisma from "../prisma/prisma";

import {
    CreateLoginUser,
    DBPagination,
    FilterBoolean,
    FilterSort,
    FilterString,
    UpdateLoginUser,
} from "./orm_types";
import { account_status_enum, Prisma } from "@prisma/client";
import { deletePersonFromDB } from "./person";

/**
 *
 * @param loginUser: login user object with the needed information
 */
export async function createLoginUser(loginUser: CreateLoginUser) {
    const result = await prisma.login_user.create({
        data: {
            person_id: loginUser.personId,
            password: loginUser.password,
            is_admin: loginUser.isAdmin,
            is_coach: loginUser.isCoach,
            account_status: loginUser.accountStatus,
        },
    });
    return result;
}

/**
 *
 * @returns a list of all the login user objects in the database
 */
export async function getAllLoginUsers() {
    return await prisma.login_user.findMany({ include: { person: true } });
}

/**
 *
 * @param personId: this is the person id of the login user we are looking up in
 *     the database
 * @returns: password of the login user object
 */
export async function getPasswordLoginUserByPerson(personId: number) {
    const result = await prisma.login_user.findUnique({
        where: { person_id: personId },
        select: { password: true },
    });
    return result;
}

/**
 *
 * @param loginUserId: this is the login user id of the login user we are
 *     looking up in the database
 * @returns: password of the login user object
 */
export async function getPasswordLoginUser(loginUserId: number) {
    const result = await prisma.login_user.findUnique({
        where: { login_user_id: loginUserId },
        select: { password: true },
    });
    return result;
}

/**
 *
 * @param personId: this is the person id of the login user we are looking up in
 *     the database
 * @returns: login user object
 */
export async function searchLoginUserByPerson(personId: number) {
    const result = await prisma.login_user.findUnique({
        where: {
            person_id: personId,
        },
        include: {
            person: true,
        },
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
        where: { is_admin: isAdmin },
        include: {
            person: true,
        },
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
        where: { is_coach: isCoach },
        include: {
            person: true,
        },
    });
    return result;
}

/**
 *
 * @param bool: boolean value for the admin and coach status
 * @returns: all login user objects where the bool matches with both the admin and coach status
 */
export async function searchAllAdminAndCoachLoginUsers(bool: boolean) {
    const result = await prisma.login_user.findMany({
        where: {
            AND: [
                {
                    is_admin: bool,
                },
                {
                    is_coach: bool,
                },
            ],
        },
        include: {
            person: true,
        },
    });
    return result;
}

/**
 *
 * @param loginUser: UpdateLoginUser object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updateLoginUser(loginUser: UpdateLoginUser) {
    const result = await prisma.login_user.update({
        where: {
            login_user_id: loginUser.loginUserId,
        },
        data: {
            password: loginUser.password,
            is_admin: loginUser.isAdmin,
            is_coach: loginUser.isCoach,
            account_status: loginUser.accountStatus,
        },
        include: {
            person: true,
        },
    });
    return result;
}

/**
 *
 * @param loginUserId the login user who's info we are deleting from the login user-table
 * @returns personal info about the login user, this info can be used to further remove the person
 */
export async function deleteLoginUserById(loginUserId: number) {
    const result = await prisma.login_user.delete({
        where: {
            login_user_id: loginUserId,
        },
        include: {
            // returns the person info of the removed login user
            person: true,
        },
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
        where: { person_id: personId },
        include: {
            // returns the person info of the removed login user
            person: true,
        },
    });
    return result;
}

/**
 *
 * @param loginUserId the login user whose info we are deleting from the database
 */
export async function deleteLoginUserFromDB(loginUserId: number) {
    // search the personId
    const loginUser = await getLoginUserById(loginUserId);

    if (loginUser) {
        // call the delete
        await deletePersonFromDB(loginUser.person_id);
    }
}

/**
 *
 * @param loginUserId: the id of the loginUser we are searching
 * @returns promise with the found data, or promise with null inside if no
 *     loginUser has the given id
 */
export async function getLoginUserById(loginUserId: number) {
    return await prisma.login_user.findUnique({
        where: {
            login_user_id: loginUserId,
        },
        include: { person: true },
    });
}

/**
 *
 * @param nameFilter name that we are filtering on (or undefined if not filtering on name)
 * @param emailFilter email that we are filtering on (or undefined if not filtering on email)
 * @param nameSort asc or desc if we want to sort on name, undefined if we are not sorting on name
 * @param emailSort asc or desc if we are sorting on email, undefined if we are not sorting on email
 * @param statusFilter a given email status to filter on or undefined if we are not filtering on a status
 * @param isCoach: true or false if we want only coaches resp no coaches or undefined if we don't want to filter on this field
 * @param isAdmin: true or false if we want only admins resp no admins or undefined if we don't want to filter on this field
 * @returns the filtered loginUsers with their person data in a promise
 */

export async function filterLoginUsers(
    pagination: DBPagination,
    nameFilter: FilterString = undefined,
    emailFilter: FilterString = undefined,
    nameSort: FilterSort = undefined,
    emailSort: FilterSort = undefined,
    statusFilter: account_status_enum | undefined = undefined,
    isCoach: FilterBoolean = undefined,
    isAdmin: FilterBoolean = undefined
) {
    const filter: Prisma.login_userWhereInput = {
        person: {
            name: {
                contains: nameFilter,
                mode: "insensitive",
            },
            email: {
                contains: emailFilter,
                mode: "insensitive",
            },
        },
        account_status: statusFilter,
        is_coach: isCoach,
        is_admin: isAdmin,
    };
    const count = await prisma.login_user.count({ where: filter });
    // execute the query
    const data = await prisma.login_user.findMany({
        skip: pagination.currentPage * pagination.pageSize,
        take: pagination.pageSize,
        where: filter,
        orderBy: [
            { person: { name: nameSort } },
            { person: { email: emailSort } },
        ],
        include: {
            person: true,
        },
    });

    return {
        pagination: { page: pagination.currentPage, count: count },
        data: data,
    };
}

/**
 * Sets the is_coach field of the loginUser to isCoach
 *
 * @param loginUserId: the id of the loginUser whose field we are updating
 * @param isCoach: the new value of the is_coach field for the loginUser
 * @return a promise with the updated entry, the person object is also included
 */
export async function setCoach(loginUserId: number, isCoach: boolean) {
    return await prisma.login_user.update({
        where: {
            login_user_id: loginUserId,
        },
        data: {
            is_coach: isCoach,
        },
        include: {
            person: true,
        },
    });
}

/**
 * Sets the is_admin field of the loginuser to IsAdmin
 *
 * @param loginUserId the id of the loginUser whose field we are updating
 * @param isAdmin the new value of is_admin
 * @returns a promise with the updated entry, the person object is also included
 */
export async function setAdmin(loginUserId: number, isAdmin: boolean) {
    return await prisma.login_user.update({
        where: {
            login_user_id: loginUserId,
        },
        data: {
            is_admin: isAdmin,
        },
        include: {
            person: true,
        },
    });
}

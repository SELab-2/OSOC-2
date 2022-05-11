import prisma from "../prisma/prisma";

/**
 * creates an entry in the "in between table" for osoc and login_user.
 * An entry in this table indicates that this loginUser should be able to see the osoc edition
 *
 * @param loginUserId: the id of the loginUser that should be able to see the osoc edition
 * @param osoc_id: the id of the osoc edition that the loginUser should see
 */
export async function addOsocToUser(loginUserId: number, osoc_id: number) {
    return await prisma.login_user_osoc.create({
        data: {
            login_user_id: loginUserId,
            osoc_id: osoc_id,
        },
    });
}

/**
 * Delete all connections between the osoc table and loginUser table for a given loginUser
 * @param loginUserId: the id of the loginUser whose connections we will delete
 */
export async function deleteOsocsForLoginuser(loginUserId: number) {
    return await prisma.login_user_osoc.deleteMany({
        where: {
            login_user_id: loginUserId,
        },
    });
}

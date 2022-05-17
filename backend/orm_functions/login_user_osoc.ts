import prisma from "../prisma/prisma";

/**
 * creates an entry in the "in between table" for osoc and login_user.
 * An entry in this table indicates that this loginUser should be able to see the osoc edition
 *
 * @param loginUserId: the id of the loginUser that should be able to see the osoc edition
 * @param osocId: the id of the osoc edition that the loginUser should see
 */
export async function addOsocToUser(loginUserId: number, osocId: number) {
    return await prisma.login_user_osoc.create({
        data: {
            login_user_id: loginUserId,
            osoc_id: osocId,
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

/**
 * Delete all connections between the osoc table and loginUser table for a given osoc edition
 * @param osocId: the id of the osoc whose connections to loginUsers we want to delete
 */
export async function deleteOsocsLoginConnectionFromOsoc(osocId: number) {
    return await prisma.login_user_osoc.deleteMany({
        where: {
            osoc_id: osocId,
        },
    });
}

/**
 * remove the permissions of an loginUser to see data from this osocEdition
 * @param loginUserId: the id of the loginuser
 * @param osocId: the id of the osoc edition
 */
export async function removeOsocFromUser(loginUserId: number, osocId: number) {
    // will only delete 1 entry because each combination o
    return await prisma.login_user_osoc.deleteMany({
        where: {
            login_user_id: loginUserId,
            osoc_id: osocId,
        },
    });
}

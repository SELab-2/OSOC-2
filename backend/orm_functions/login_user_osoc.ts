import prisma from "../prisma/prisma";

/**
 *
 * @param loginUserId: the id of the loginUser whose entry for the connection with the osoc edition we are searching
 * @param osocId: the id of the osoc edition whose entry for the connection with the login user we are searching
 * @returns null if an entry with these values exists, otherwise the entry
 */
export async function getLoginUserOsocByIds(
    loginUserId: number,
    osocId: number
) {
    // will find 0 or 1 entry
    const res = await prisma.login_user_osoc.findMany({
        where: {
            login_user_id: loginUserId,
            osoc_id: osocId,
        },
    });

    if (res.length === 0) {
        return null;
    }
    return res[0];
}

/**
 * creates an entry in the "in between table" for osoc and login_user.
 * An entry in this table indicates that this loginUser should be able to see the osoc edition
 *
 * @param loginUserId: the id of the loginUser that should be able to see the osoc edition
 * @param osocId: the id of the osoc edition that the loginUser should see
 */
export async function addOsocToUser(loginUserId: number, osocId: number) {
    const entry = await getLoginUserOsocByIds(loginUserId, osocId);

    // only create new entry if entry does not yet exists
    if (entry !== null) {
        return await prisma.login_user_osoc.create({
            data: {
                login_user_id: loginUserId,
                osoc_id: osocId,
            },
        });
    }
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
    const entry = await getLoginUserOsocByIds(loginUserId, osocId);

    // only delete if there is an entry
    if (entry !== null) {
        // will only delete 1 entry because each combination of loginUserId and osocId in this table is unique
        return await prisma.login_user_osoc.deleteMany({
            where: {
                login_user_id: loginUserId,
                osoc_id: osocId,
            },
        });
    }
}

/**
 *
 * @param loginUserId: the Id of the loginUser
 * @returns a promise with inside al list of objects with references to the osoc editions that are visible for the given loginUser
 */
export async function getOsocYearsForLoginUserById(loginUserId: number) {
    return await prisma.login_user_osoc.findMany({
        where: {
            login_user_id: loginUserId,
        },
        include: {
            osoc: true,
        },
    });
}

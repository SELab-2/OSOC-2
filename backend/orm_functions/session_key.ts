import prisma from "../prisma/prisma";

/**
 * adds session key to loginUser
 *
 * @param loginUserId the id of the loginUser for whom we are adding a session key
 * @param key the new session key
 * @param date
 * @returns the new record in the database in a promise
 */
export async function addSessionKey(
    loginUserId: number,
    key: string,
    date: Date
) {
    return await prisma.session_keys.create({
        data: {
            login_user_id: loginUserId,
            session_key: key,
            valid_until: date,
        },
    });
}

/**
 * checks if the session key exists
 *
 * @param key: the key whose validity we want to check
 * @returns the loginUser associated with the key in a promise if the keys is valid otherwise an error in a promise
 */
export async function checkSessionKey(key: string) {
    console.log("key: " + key);
    return await prisma.session_keys.findFirst({
        where: {
            AND: [{ session_key: key }, { valid_until: { gte: new Date() } }],
        },
        select: {
            login_user_id: true,
        },
    });
}

/**
 *
 * @param key: the old key we want to overwrite
 * @param date
 * @returns the updated record in a promise
 */
export async function refreshKey(key: string, date: Date) {
    return await prisma.session_keys.update({
        where: {
            session_key: key,
        },
        data: {
            valid_until: date,
        },
    });
}

/**
 * deletes all session keys of the user that has the given key
 *
 * @param key a key of a user whose keys we want to delete
 * @returns the number of deleted records in a promise
 */
export async function removeAllKeysForUser(key: string) {
    return await checkSessionKey(key).then((uid) => {
        if (uid != null) {
            return prisma.session_keys.deleteMany({
                where: {
                    login_user_id: uid.login_user_id,
                },
            });
        } else {
            return { count: 0 };
        }
    });
}

/**
 *
 * @param loginUserId the id of the loginUser whose session keys we want to remove
 * @returns a promise with the number of deleted records
 */
export async function removeAllKeysForLoginUserId(loginUserId: number) {
    return await prisma.session_keys.deleteMany({
        where: {
            login_user_id: loginUserId,
        },
    });
}

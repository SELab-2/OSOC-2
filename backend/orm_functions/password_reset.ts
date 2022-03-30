import prisma from "../prisma/prisma";

/**
 * creates a new entry for password reset if none exists yet.
 * overwrites the info of the old reset entry if a reset entry already exists
 *
 * @param loginUserId the id of the loginUser whose passport we want to reset
 * @param resetId the unique id to reset the passport of the login user
 * @param validUntil timestamp that shows until when the resetId is valid
 * @return the created/updated entry from the database in a promise
 */
export async function createOrUpdateReset(loginUserId: number, resetId: string, validUntil: Date) {
    return await prisma.password_reset.upsert({
        where: {
            login_user_id: loginUserId,
        },
        create: {
            login_user_id: loginUserId,
            reset_id: resetId,
            valid_until: validUntil
        },
        update : {
            reset_id: resetId,
            valid_until: validUntil
        }
    });
}

/**
 *
 * @param loginUserId the id of the loginUser whose reset entry we want to delete
 * @returns the deleted entry (or null if there was no entry) inside a promise
 */
export async function deleteResetWithLoginUser(loginUserId: number) {
    return await prisma.password_reset.delete({
        where: {
            login_user_id: loginUserId
        }
    });
}

/**
 *
 * @param resetId the resetId of the entry we want to delete
 * @returns the deleted entry (or null if there was no entry) inside a promise
 */
export async function deleteResetWithResetId(resetId: string) {
    return await prisma.password_reset.delete({
        where : {
            reset_id: resetId,
        }
    });
}
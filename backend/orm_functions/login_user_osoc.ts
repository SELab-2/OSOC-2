import prisma from "../prisma/prisma";
import { getOsocByYear } from "./osoc";

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

export async function getYearsForUser(loginUserId: number) {
    const res = await prisma.login_user_osoc.findMany({
        where: {
            login_user_id: loginUserId,
        },
        include: {
            osoc: true,
        },
    });

    return res.map((obj) => obj.osoc.year);
}

export async function deleteEntry(loginUserId: number, year: number) {
    // will always only delete 1 thing even though this is a deleteMany
    await prisma.login_user_osoc.deleteMany({
        where: {
            login_user_id: loginUserId,
            osoc: {
                year: year,
            },
        },
    });
}

export async function createEntry(loginUserId: number, year: number) {
    const osoc = await getOsocByYear(year);

    if (osoc) {
        await prisma.login_user_osoc.create({
            data: {
                login_user_id: loginUserId,
                osoc_id: osoc.osoc_id,
            },
        });
    }
}

export async function setOsocYearsForUsers(
    loginUserId: number,
    years: number[]
) {
    const yearsCurrent = await getYearsForUser(loginUserId);

    await Promise.all(
        yearsCurrent.filter((year) => {
            if (!years.includes(year)) {
                return deleteEntry(loginUserId, year);
            }
        })
    );

    await Promise.all(
        years.filter((year) => {
            if (!years.includes(year)) {
                return createEntry(loginUserId, year);
            }
        })
    );
}

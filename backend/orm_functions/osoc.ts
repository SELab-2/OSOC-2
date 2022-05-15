import prisma from "../prisma/prisma";
import {
    UpdateOsoc,
    FilterNumber,
    FilterSort,
    DBPagination,
} from "./orm_types";

/**
 *
 * @param year: create osoc edition, only needs year
 */
export async function createOsoc(year: number) {
    return await prisma.osoc.create({
        data: {
            year: year,
        },
    });
}

/**
 *
 * @returns a list of all the osoc objects in the database
 */
export async function getAllOsoc() {
    return prisma.osoc.findMany({
        include: {
            _count: {
                select: { project: true },
            },
        },
    });
}

/**
 *
 * @returns the latest the osoc edition in the database
 */
export async function getLatestOsoc() {
    return prisma.osoc.findFirst({
        orderBy: {
            year: "desc",
        },
    });
}

/**
 *
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: osoc object
 */
export async function getOsocByYear(year: number) {
    return prisma.osoc.findUnique({
        where: {
            year: year,
        },
    });
}

/**
 *
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: all the osoc objects that took place before the supplied year
 */
export async function getOsocBeforeYear(year: number) {
    return prisma.osoc.findMany({
        where: {
            year: {
                lt: year,
            },
        },
    });
}

/**
 *
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: all the osoc objects that took place after the supplied year
 */
export async function getOsocAfterYear(year: number) {
    return prisma.osoc.findMany({
        where: {
            year: {
                gt: year,
            },
        },
    });
}

/**
 *
 * @param osoc: UpdateOsoc object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updateOsoc(osoc: UpdateOsoc) {
    return await prisma.osoc.update({
        where: {
            osoc_id: osoc.osocId,
        },
        data: {
            year: osoc.year,
        },
    });
}

/**
 *
 * @param osocId the osoc edition we are deleting from the osoc-table
 * @returns the deleted osoc record
 */
export async function deleteOsoc(osocId: number) {
    return await prisma.osoc.delete({
        where: {
            osoc_id: osocId,
        },
    });
}

/**
 *
 * @param year the year we are deleting from the osoc-table
 * @returns the deleted osoc record
 */
export async function deleteOsocByYear(year: number) {
    return await prisma.osoc.delete({
        where: {
            year: year,
        },
    });
}

/**
 *
 * @param osocId: the id of the osoc edition we want to delete
 */
export async function deleteOsocFromDB(osocId: number) {
    const project_ids = await prisma.project.findMany({
        where: {
            osoc_id: osocId,
        },
        select: {
            project_id: true,
        },
    });

    const project_roles_ids = await prisma.project_role.findMany({
        where: {
            project_id: {
                in: project_ids.map((X) => X.project_id),
            },
        },
        select: {
            project_role_id: true,
        },
    });

    const job_application_ids = await prisma.job_application.findMany({
        where: {
            osoc_id: osocId,
        },
        select: {
            job_application_id: true,
        },
    });

    // Remove all the linked projectUsers
    await prisma.project_user.deleteMany({
        where: {
            project_id: {
                in: project_ids.map((X) => X.project_id),
            },
        },
    });

    // Remove all the linked contracts
    await prisma.contract.deleteMany({
        where: {
            project_role_id: {
                in: project_roles_ids.map((X) => X.project_role_id),
            },
        },
    });

    // Remove all the linked projectroles
    await prisma.project_role.deleteMany({
        where: {
            project_id: {
                in: project_ids.map((X) => X.project_id),
            },
        },
    });

    // Remove all the linked projects
    await prisma.project.deleteMany({
        where: {
            osoc_id: osocId,
        },
    });

    // Remove all the linked evaluations
    await prisma.evaluation.deleteMany({
        where: {
            job_application_id: {
                in: job_application_ids.map((X) => X.job_application_id),
            },
        },
    });

    // Remove all the linked applied roles
    await prisma.applied_role.deleteMany({
        where: {
            job_application_id: {
                in: job_application_ids.map((X) => X.job_application_id),
            },
        },
    });

    // Remove all the linked job application skills
    await prisma.job_application_skill.deleteMany({
        where: {
            job_application_id: {
                in: job_application_ids.map((X) => X.job_application_id),
            },
        },
    });

    // Remove all the linked attachments
    await prisma.attachment.deleteMany({
        where: {
            job_application_id: {
                in: job_application_ids.map((X) => X.job_application_id),
            },
        },
    });

    // Remove all the linked job applications
    await prisma.job_application.deleteMany({
        where: {
            osoc_id: osocId,
        },
    });

    await prisma.osoc.delete({
        where: {
            osoc_id: osocId,
        },
    });
}

/**
 * @returns the newest Osoc edition
 */
export async function getNewestOsoc() {
    return await prisma.osoc.findFirst({
        orderBy: {
            year: "desc",
        },
    });
}

/**
 *
 * @param yearFilter year that we are filtering on (or undefined if not filtering on year)
 * @param yearSort asc or desc if we are sorting on year, undefined if we are not sorting on year
 * @returns the filtered osoc editions with their project count in a promise
 */
export async function filterOsocs(
    pagination: DBPagination,
    yearFilter: FilterNumber = undefined,
    yearSort: FilterSort = undefined
) {
    const count = await prisma.osoc.count({ where: { year: yearFilter } });
    const data = await prisma.osoc.findMany({
        skip: pagination.currentPage * pagination.pageSize,
        take: pagination.pageSize,
        where: {
            year: yearFilter,
        },
        orderBy: {
            year: yearSort,
        },
        include: {
            _count: {
                select: { project: true },
            },
        },
    });

    return {
        pagination: { page: pagination.currentPage, count: count },
        data: data,
    };
}

import prisma from "../prisma/prisma";
import { Prisma } from "@prisma/client";
import {
    CreateProject,
    UpdateProject,
    FilterString,
    FilterSort,
    FilterBoolean,
    FilterNumberArray,
    DBPagination,
} from "./orm_types";

/**
 *
 * @param project: project object with the needed information
 */
export async function createProject(project: CreateProject) {
    const result = await prisma.project.create({
        data: {
            name: project.name,
            osoc_id: project.osocId,
            partner: project.partner,
            start_date: project.startDate,
            end_date: project.endDate,
        },
    });
    return result;
}

/**
 *
 * @returns a list of all the project objects in the database
 */
export async function getAllProjects() {
    const result = await prisma.project.findMany();
    return result;
}

/**
 *
 * @param projectId: this is the id of the project we are looking up in the database
 * @returns: object with all the info about this project
 */
export async function getProjectById(projectId: number) {
    const result = prisma.project.findUnique({
        where: {
            project_id: projectId,
        },
    });
    return result;
}

/**
 *
 * @param projectName: this is the name of the project we are looking up in the database
 * @returns: object with all the info about this project
 */
export async function getProjectByName(projectName: string) {
    const result = prisma.project.findMany({
        where: {
            name: projectName,
        },
    });
    return result;
}

/**
 *
 * @param osocId: this is the id of the osoc edition for wich we want al the projects
 * @returns: all projects with all the info
 */
export async function getProjectsByOsocEdition(osocId: number) {
    const result = prisma.project.findMany({
        where: {
            osoc_id: osocId,
        },
    });
    return result;
}

/**
 *
 * @param partner: this is the name of the partner for which we want the project
 * @returns all the project objects for that partner
 */
export async function getProjectsByPartner(partner: string) {
    const result = prisma.project.findMany({
        where: {
            partner: partner,
        },
    });
    return result;
}

/**
 *
 * @param startDate: the  start date of the project we are looking for
 * @returns all the projects with a matching start date in the database
 */
export async function getProjectsByStartDate(startDate: Date) {
    const result = prisma.project.findMany({
        where: {
            start_date: startDate,
        },
    });
    return result;
}

/**
 *
 * @param date: the  start date of the project we are looking for
 * @returns all the projects that started after the supplied date
 */
export async function getProjectsStartedAfterDate(date: Date) {
    const result = prisma.project.findMany({
        where: {
            start_date: {
                gte: date,
            },
        },
    });
    return result;
}

/**
 *
 * @param date: the  start date of the project we are looking for
 * @returns all the projects that started before the supplied date
 */
export async function getProjectsStartedBeforeDate(date: Date) {
    const result = prisma.project.findMany({
        where: {
            start_date: {
                lte: date,
            },
        },
    });
    return result;
}

/**
 *
 * @param endDate: the  end date of the project we are looking for
 * @returns all the projects with a matching end date in the database
 */
export async function getProjectsByEndDate(endDate: Date) {
    const result = prisma.project.findMany({
        where: {
            end_date: endDate,
        },
    });
    return result;
}

/**
 *
 * @param date: the  end date of the project we are looking for
 * @returns all the projects that ended after the supplied date
 */
export async function getProjectsEndedAfterDate(date: Date) {
    const result = prisma.project.findMany({
        where: {
            end_date: {
                gte: date,
            },
        },
    });
    return result;
}

/**
 *
 * @param date: the  end date of the project we are looking for
 * @returns all the projects that ended before the supplied date
 */
export async function getProjectsEndedBeforeDate(date: Date) {
    const result = prisma.project.findMany({
        where: {
            end_date: {
                lte: date,
            },
        },
    });
    return result;
}

/**
 *
 * @param project: UpdateProject object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updateProject(project: UpdateProject) {
    const result = await prisma.project.update({
        where: {
            project_id: project.projectId,
        },
        data: {
            name: project.name,
            osoc_id: project.osocId,
            partner: project.partner,
            start_date: project.startDate,
            end_date: project.endDate,
            description: project.description,
        },
    });
    return result;
}

/**
 *
 * @param projectId the project that we are deleting from the project-table
 * @returns return deleted project, with all its fields
 */
export async function deleteProject(projectId: number) {
    const result = await prisma.project.delete({
        where: {
            project_id: projectId,
        },
    });
    return result;
}

/**
 *
 * @param osocId the osoc id of all the projects we want to delete
 * @returns returns batch payload object, with holds count of number of deleted objects
 */
export async function deleteProjectByOsocEdition(osocId: number) {
    const result = await prisma.project.deleteMany({
        where: {
            osoc_id: osocId,
        },
    });
    return result;
}

/**
 *
 * @param partner the partner of who we want to delete all the projects
 * @returns returns batch payload object, with holds count of number of deleted objects
 */
export async function deleteProjectByPartner(partner: string) {
    const result = await prisma.project.deleteMany({
        where: {
            partner: partner,
        },
    });
    return result;
}

/**
 * @param page current page and page size
 * @param projectNameFilter project name that we are filtering on (or undefined if not filtering on name)
 * @param clientNameFilter client name that we are filtering on (or undefined if not filtering on name)
 * @param assignedCoachesFilterArray assigned coaches that we are filtering on (or undefined if not filtering on assigned coaches)
 * @param fullyAssignedFilter fully assigned status that we are filtering on (or undefined if not filtering on assigned)
 * @param osocYearFilter: the osoc year the project belongs to (or undefined if not filtering on year)
 * @param projectNameSort asc or desc if we want to sort on project name, undefined if we are not sorting on project name
 * @param clientNameSort asc or desc if we want to sort on client name, undefined if we are not sorting on client name
 * @returns the filtered students with their person data and other filter fields in a promise
 */
export async function filterProjects(
    page: DBPagination,
    projectNameFilter: FilterString = undefined,
    clientNameFilter: FilterString = undefined,
    assignedCoachesFilterArray: FilterNumberArray = undefined,
    fullyAssignedFilter: FilterBoolean = undefined,
    osocYearFilter: number | undefined = undefined,
    projectNameSort: FilterSort = undefined,
    clientNameSort: FilterSort = undefined
) {
    const projects = await prisma.project.findMany({
        include: {
            project_role: {
                include: {
                    _count: {
                        select: { contract: true },
                    },
                },
            },
        },
    });

    let assignedCoachesArray = undefined;
    if (assignedCoachesFilterArray !== undefined) {
        assignedCoachesArray = {
            some: {
                login_user_id: { in: assignedCoachesFilterArray },
            },
        };
    }

    const actualFilter: Prisma.projectWhereInput = {
        osoc: {
            year: osocYearFilter,
        },
        name: {
            contains: projectNameFilter,
            mode: "insensitive",
        },
        partner: {
            contains: clientNameFilter,
            mode: "insensitive",
        },
        project_user: assignedCoachesArray,
    };

    // create the orderby object
    let sortObject;
    if (projectNameSort === undefined && clientNameSort !== undefined) {
        sortObject = [{ name: projectNameSort }];
    } else if (projectNameSort !== undefined && clientNameSort === undefined) {
        sortObject = [{ partner: clientNameSort }];
    } else if (projectNameSort !== undefined && clientNameSort !== undefined) {
        sortObject = [{ name: projectNameSort }, { partner: clientNameSort }];
    }

    let filtered_projects = await prisma.project.findMany({
        where: actualFilter,
        orderBy: sortObject,
        include: {
            project_user: {
                select: {
                    login_user: {
                        select: {
                            login_user_id: true,
                            is_coach: true,
                        },
                    },
                },
            },
            project_role: {
                select: {
                    positions: true,
                    role: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    // if (filtered_projects.length === 0) {
    //     return filtered_projects;
    // }

    if (
        fullyAssignedFilter != undefined &&
        fullyAssignedFilter &&
        filtered_projects.length !== 0
    ) {
        filtered_projects = filtered_projects.filter((project) => {
            const project_found = projects.filter(
                (elem) => elem.project_id === project.project_id
            );

            for (const c of project_found[0].project_role) {
                console.log(c._count.contract);
                console.log(c.positions);
                if (c._count.contract < c.positions) return false;
            }

            return true;
        });
    }

    const count = filtered_projects.length;
    const start = page.currentPage * page.pageSize;
    const end = start + page.pageSize;

    return {
        pagination: { page: page.currentPage, count: count },
        data: filtered_projects.slice(start, end),
    };
}

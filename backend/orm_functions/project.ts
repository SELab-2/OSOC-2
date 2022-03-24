import prisma from '../prisma/prisma'
import {CreateProject, UpdateProject} from './orm_types';

/**
 * 
 * @param project: project object with the needed information
 */
export async function createProject(project: CreateProject){
    const result = await prisma.project.create({
        data: {
            name: project.name,
            osoc_id: project.osocId,
            partner: project.partner,
            start_date: project.startDate,
            end_date: project.endDate,
            positions: project.positions
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
    return result
}

/**
 * 
 * @param projectId: this is the id of the project we are looking up in the database
 * @returns: object with all the info about this project
 */
 export async function getProjectById(projectId: number) {
    const result = prisma.project.findUnique({
        where: { 
            project_id: projectId
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
            name: projectName
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
            osoc_id: osocId
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
            partner: partner
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
            start_date: startDate 
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
            end_date: endDate 
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
 * @param positions: this is the number of positions in the project
 * @returns all the project objects that have the exact amount of positions
 */
export async function getProjectsByNumberPositions(positions: number) {
    const result = prisma.project.findMany({
        where: { 
            positions: positions 
        },
    });
    return result;
}

/**
 * 
 * @param positions: this is the number of positions in the project
 * @returns all the project objects that have less positions
 */
export async function getProjectsLessPositions(positions: number) {
    const result = prisma.project.findMany({
        where: { 
            positions: {
                lt: positions,
              },
         },
    });
    return result;
}

/**
 * 
 * @param positions: this is the number of positions in the project
 * @returns all the project objects that have more positions
 */
export async function getProjectsMorePositions(positions: number) {
    const result = prisma.project.findMany({
        where: { 
            positions: {
                gt: positions,
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
export async function updateProject(project: UpdateProject){
    const result = await prisma.project.update({
        where: {
            project_id :project.projectId
        },
        data: {
            name: project.name,
            osoc_id: project.osocId,
            partner: project.partner,
            start_date: project.startDate,
            end_date: project.endDate,
            positions: project.positions
        },
    });
    return result;
}

/**
 * 
 * @param projectId the project that we are deleting from the project-table
 * @returns TODO what does this return?
 */
export async function deleteProject(projectId: number){
    const result = await prisma.project.delete({
        where: {
            project_id: projectId
        }
    });
    return result;
}

/**
 * 
 * @param osocId the osoc id of all the projects we want to delete
 * @returns TODO what does this return?
 */
export async function deleteProjectByOsocEdition(osocId: number){
    const result = await prisma.project.deleteMany({
        where: {
            osoc_id: osocId
        }
    });
    return result;
}

/**
 * 
 * @param partner the partner of who we want to delete all the projects
 * @returns TODO what does this return?
 */
export async function deleteProjectByPartner(partner: string){
    const result = await prisma.project.deleteMany({
        where: {
            partner: partner
        }
    });
    return result;
}

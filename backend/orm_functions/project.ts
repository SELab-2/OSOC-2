import {prisma} from '../prisma/prisma'


// Create Project
export async function createProject(name : string, osocId : number, partner : string, startDate : Date, endDate : Date, positions : number){
    const result = await prisma.project.create({
        data: {
            name: name,
            osoc_id: osocId,
            partner: partner,
            start_date: startDate,
            end_date : endDate,
            positions : positions
        },
    });
    return result;
}

// Search all the Projects
export async function getAllProjects() {
    const result = await prisma.project.findMany();
    return result
}

// Search Project by Name
export async function getProjectByName(projectName : string) {
    const result = prisma.project.findMany({
        where: { name : projectName},
    });
    return result;
}

// Search all the Projects for certain Osoc Edition
export async function getProjectsByOsocEdition(edition : number) {
    const result = prisma.project.findMany({
        where: { osoc_id : edition},
    });
    return result;
}

// Search all the Projects for certain Partner
export async function getProjectsByPartner(name : string) {
    const result = prisma.project.findMany({
        where: { partner : name},
    });
    return result;
}

// Search all the Projects with certain Start Date
export async function getProjectsByStartDate(date : Date) {
    const result = prisma.project.findMany({
        where: { start_date: date },
    });
    return result;
}

// Search all the Projects that start after a certain Date
export async function getProjectsStartedAfterDate(date : Date) {
    const result = prisma.project.findMany({
        where: {
            start_date: {
              gte: date,
            },
        },
    });
    return result;
}

// Search all the Projects that start before a certain Date
export async function getProjectsStartedBeforeDate(date : Date) {
    const result = prisma.project.findMany({
        where: {
            start_date: {
              lte: date,
            },
        },
    });
    return result;
}

// Search all the Projects with certain End Date
export async function getProjectsByEndDate(date : Date) {
    const result = prisma.project.findMany({
        where: { end_date: date },
    });
    return result;
}

// Search all the Projects that end after a certain Date
export async function getProjectsEndedAfterDate(date : Date) {
    const result = prisma.project.findMany({
        where: {
            end_date: {
              gte: date,
            },
        },
    });
    return result;
}

// Search all the Projects that start before a certain Date
export async function getProjectsEndedBeforeDate(date : Date) {
    const result = prisma.project.findMany({
        where: {
            end_date: {
              lte: date,
            },
        },
    });
    return result;
}

// Search all the Projects with a number of Positions
export async function getProjectsByNumberPositions(numberPositions : number) {
    const result = prisma.project.findMany({
        where: { positions :numberPositions },
    });
    return result;
}

// Search all the Projects with less or equal Positions than number
export async function getProjectsLessPositions(numberPositions : number) {
    const result = prisma.project.findMany({
        where: { 
            positions: {
                lte: numberPositions,
              },
         },
    });
    return result;
}

// Search all the Projects with more or equal Positions than number
export async function getProjectsMorePositions(numberPositions : number) {
    const result = prisma.project.findMany({
        where: { 
            positions: {
                gte: numberPositions,
              },
         },
    });
    return result;
}

// Update Project
export async function updateProject(projectId : number, name : string, osocId : number, partner : string, startDate : Date, endDate : Date, positions : number){
    const result = await prisma.project.update({
        where : {
            project_id : projectId
        },
        data: {
            name: name,
            osoc_id: osocId,
            partner: partner,
            start_date: startDate,
            end_date : endDate,
            positions : positions
        },
    });
    return result;
}

// Delete Project
export async function deleteProject(projectId : number){
    const result = await prisma.project.delete({
        where : {
            project_id : projectId
        }
    });
    return result;
}

// Delete Project by Osoc Edition
export async function deleteProjectByOsocEdition(osocEditionId : number){
    const result = await prisma.project.deleteMany({
        where : {
            osoc_id : osocEditionId
        }
    });
    return result;
}

// Delete Project by Partner
export async function deleteProjectByPartner(name : string){
    const result = await prisma.project.deleteMany({
        where : {
            partner : name
        }
    });
    return result;
}

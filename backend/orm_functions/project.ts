import {prisma} from '../prisma/prisma'


// Create Project
export async function createProject(name : string, osoc_id : number, partner : string, start_date : Date, end_date : Date, positions : number){
    const result = await prisma.project.create({
        data: {
            name: name,
            osoc_id: osoc_id,
            partner: partner,
            start_date: start_date,
            end_date : end_date,
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
export async function getProjectByName(project_name : string) {
    const result = prisma.project.findMany({
        where: { name : project_name},
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
export async function getProjectsByNumberPositions(number_positions : number) {
    const result = prisma.project.findMany({
        where: { positions :number_positions },
    });
    return result;
}

// Search all the Projects with less or equal Positions than number
export async function getProjectsLessPositions(number_positions : number) {
    const result = prisma.project.findMany({
        where: { 
            positions: {
                lte: number_positions,
              },
         },
    });
    return result;
}

// Search all the Projects with more or equal Positions than number
export async function getProjectsMorePositions(number_positions : number) {
    const result = prisma.project.findMany({
        where: { 
            positions: {
                gte: number_positions,
              },
         },
    });
    return result;
}

// Update Project
export async function updateProject(project_id : number, name : string, osoc_id : number, partner : string, start_date : Date, end_date : Date, positions : number){
    const result = await prisma.project.update({
        where : {
            project_id : project_id
        },
        data: {
            name: name,
            osoc_id: osoc_id,
            partner: partner,
            start_date: start_date,
            end_date : end_date,
            positions : positions
        },
    });
    return result;
}

// Delete Project
export async function deleteProject(project_id : number){
    const result = await prisma.project.delete({
        where : {
            project_id : project_id
        }
    });
    return result;
}

// Delete Project by Osoc Edition
export async function deleteProjectByOsocEdition(osoc_edition_id : number){
    const result = await prisma.project.deleteMany({
        where : {
            osoc_id : osoc_edition_id
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

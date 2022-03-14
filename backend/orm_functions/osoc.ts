import {prisma} from '../prisma/prisma'


// Create Osoc Edition
export async function createOsoc(year : number){
    const result = await prisma.osoc.create({
        data: {
            year : year
        },
    });
    return result;
}

// Get all Osoc Editions
export async function getAllOsoc() {
    const result = prisma.osoc.findMany();
    return result;
}

// Get Osoc for By year
export async function getOsocByYear(year : number) {
    const result = prisma.osoc.findMany({
        where: { year : year},
    });
    return result;
}

// Get all Osoc before certain year
export async function getOsocBeforeYear(year : number) {
    const result = prisma.osoc.findMany({
        where: {
            year: {
              lt: year,
            },
        },
    });
    return result;
}

// Get all Osoc after certain year
export async function getOsocAfterYear(year : number) {
    const result = prisma.osoc.findMany({
        where: {
            year: {
              gt: year,
            },
        },
    });
    return result;
}

// Update Osoc Edition
export async function updateOsoc(osocId : number, year : number){
        const result = await prisma.osoc.update({
        where : {
            osoc_id : osocId
        },
        data: {
            year : year
        },
    });
    return result;
}

// Delete Osoc Edition by Id
export async function deleteOsoc(osocId : number){
    const result = await prisma.osoc.delete({
        where : {
            osoc_id : osocId
        }
    });
    return result;
}

// Delete Osoc Edition by year
export async function deleteOsocByYear(year : number){
    const result = await prisma.osoc.deleteMany({
        where : {
            year : year
        }
    });
    return result;
}

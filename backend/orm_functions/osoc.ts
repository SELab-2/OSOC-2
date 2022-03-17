import prisma from '../prisma/prisma'
import {UpdateOsoc} from './orm_types';

/**
 * 
 * @param year: create osoc edition, only needs year
 */
export async function createOsoc(year: number){
    const result = await prisma.osoc.create({
        data: {
            year: year
        },
    });
    return result;
}

/**
 * 
 * @returns a list of all the osoc objects in the database
 */
export async function getAllOsoc() {
    const result = prisma.osoc.findMany();
    return result;
}

/**
 * 
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: osoc object
 */
export async function getOsocByYear(year: number) {
    const result = prisma.osoc.findMany({
        where: { 
            year: year
        },
    });
    return result;
}

/**
 * 
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: all the osoc objects that took place before the supplied year
 */
export async function getOsocBeforeYear(year: number) {
    const result = prisma.osoc.findMany({
        where: {
            year: {
              lt: year,
            },
        },
    });
    return result;
}

/**
 * 
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: all the osoc objects that took place after the supplied year
 */
export async function getOsocAfterYear(year: number) {
    const result = prisma.osoc.findMany({
        where: {
            year: {
              gt: year,
            },
        },
    });
    return result;
}

/**
 * 
 * @param osoc: UpdateOsoc object with the values that need to be updated
 * @returns the updated entry in the database 
 */
export async function updateOsoc(osoc: UpdateOsoc){
        const result = await prisma.osoc.update({
        where: {
            osoc_id: osoc.osocId
        },
        data: {
            year: osoc.year
        },
    });
    return result;
}

/**
 * 
 * @param osocId the osoc edition we are deleting from the osoc-table
 * @returns TODO: WHAT DOES THIS RETURNS
 */
export async function deleteOsoc(osocId: number){
    const result = await prisma.osoc.delete({
        where: {
            osoc_id: osocId
        }
    });
    return result;
}

/**
 * 
 * @param year the year we are deleting from the osoc-table
 * @returns TODO: WHAT DOES THIS RETURNS
 */
export async function deleteOsocByYear(year: number){
    const result = await prisma.osoc.deleteMany({
        where: {
            year: year
        }
    });
    return result;
}

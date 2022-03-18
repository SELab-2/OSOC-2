import prisma from '../prisma/prisma'
import {UpdateOsoc} from './orm_types';

/**
 * 
 * @param year: create osoc edition, only needs year
 */
export async function createOsoc(year: number){
    return await prisma.osoc.create({
        data: {
            year: year
        },
    });
}

/**
 * 
 * @returns a list of all the osoc objects in the database
 */
export async function getAllOsoc() {
    return prisma.osoc.findMany();
}

/**
 * 
 * @param year: this is the year of the osoc we are looking up in the database
 * @returns: osoc object
 */
export async function getOsocByYear(year: number) {
    return prisma.osoc.findUnique({
        where: {
            year: year
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
export async function updateOsoc(osoc: UpdateOsoc){
    return await prisma.osoc.update({
        where: {
            osoc_id: osoc.osocId
        },
        data: {
            year: osoc.year
        },
    });
}

/**
 * 
 * @param osocId the osoc edition we are deleting from the osoc-table
 * @returns the deleted osoc record
 */
export async function deleteOsoc(osocId: number){
    return await prisma.osoc.delete({
        where: {
            osoc_id: osocId
        }
    });
}

/**
 * 
 * @param year the year we are deleting from the osoc-table
 * @returns the deleted osoc record
 */
export async function deleteOsocByYear(year: number){
    return await prisma.osoc.delete({
        where: {
            year: year
        }
    });
}

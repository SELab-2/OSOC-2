import prisma from '../prisma/prisma'
import {UpdateLanguage} from './orm_types';

/**
 * 
 * @param name: the name of the language we want to add to the database
 */
 export async function createLanguage(name: string){
    return await prisma.language.create({
        data: {
            name: name
        },
    });
}

/**
 * 
 * @returns a list of all the language objects in the database
 */
export async function getAllLanguages() {
    return await prisma.language.findMany()
}

/**
 * 
 * @param languageId: this is the id of the language we are looking up in the database
 * @returns: object with the name of the language
 */
 export async function getLanguage(languageId: number) {
    return await prisma.language.findUnique({
        where: {
            language_id: languageId,
        }
    });
}

/**
 * 
 * @param name: this is the name of the language we are looking up in the database
 * @returns: the language object with a matching name
 */
 export async function getLanguageByName(name: string) {
    return await prisma.language.findUnique({
        where: {
            name: name,
        }
    });
}

/**
 * 
 * @param language: UpdateLanguage object with the values that need to be updated
 * @returns the updated entry in the database 
 */
 export async function updateLanguage(language: UpdateLanguage) {
    return await prisma.language.update({
        where: {
            language_id: language.languageId,
        },
        data: {
            name: language.name,
        }
    });
}

/**
 * 
 * @param languageId: the language we are deleting from the language-table
 * @returns the deleted record in the database
 */
 export async function deleteLanguage(languageId: number) {
    return await prisma.language.delete({
        where: {
            language_id: languageId,
        }
    });
}

/**
 * 
 * @param name the name of the language we are deleting from the language-table
 * @returns the deleted record in the database
 */
 export async function deleteLanguageByName(name: string) {
    return await prisma.language.delete({
        where: {
            name: name,
        }
    });
}

import {type_enum} from "@prisma/client";
import prisma from "../prisma/prisma";

/**
 * create an attachment for job_application_id
 * 
 * @param jobApplicationId: the application to which this attachment belongs
 * @param data: url where we can find this attachment OR the raw string with the data
 * @param type: the type of the attachment (CV, PORTFOLIO, FILE)
 * @returns the created attachment
 */
 export async function createAttachment(jobApplicationId: number, data: string, type: type_enum) {
    return await prisma.attachment.create({
        data: {
            job_application_id: jobApplicationId,
            data: data,
            type: type
        }
    });
}

/**
 * 
 * @param attachmentId: the attachment we are going to remove
 * @returns the removed entry in the database
 */
export async function deleteAttachment(attachmentId:number) {
    return await prisma.attachment.delete({
        where: {
            attachment_id: attachmentId
        }
    });
}


/**
 * removes all attachments associated with the given job application
 * 
 * @param jobApplicationId: the attachments that belong to this job_application are going to be removed
 * @returns the number of removed attachments {count: number}
 */
export async function deleteAllAttachmentsForApplication(jobApplicationId:number) {
    return await prisma.attachment.deleteMany({
        where: {
            job_application_id: jobApplicationId
        }
    });
}

/**
 *
 * @param attachmentId: the id of the attachment we are looking for
 * @returns promise with the found attachment or null
 */
export async function getAttachmentById(attachmentId: number) {
    return await prisma.attachment.findUnique({
       where : {
           attachment_id: attachmentId
       }
    });
}
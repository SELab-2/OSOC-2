import {type_enum} from "@prisma/client";
import prisma from "../prisma/prisma";

/**
 * create an attachment for job_application_id
 * 
 * @param jobApplicationId: the application to which this attachment belongs
 * @param url: url where we can find this attachment back
 * @param type: the type of the attachment (CV, PORTFOLIO, FILE)
 * @returns the created attachment
 */
 export async function createAttachment(jobApplicationId: number, url: string, type: type_enum) {
    return await prisma.attachment.create({
        data: {
            job_application_id: jobApplicationId,
            url: url,
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
 * removes all attachments associated with given application
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
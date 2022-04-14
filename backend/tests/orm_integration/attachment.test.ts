import prisma from "../../prisma/prisma";
import {createAttachment, deleteAttachment, getAttachmentById,
    deleteAllAttachmentsForApplication} from "../../orm_functions/attachment";
import { type_enum } from "@prisma/client";

const attachment1 = {
    attachmentId: 0,
    jobApplicationID: 0,
    data: ["mycvlink.com"],
    type: ["CV_URL"]
}

const attachment2 = {
    attachmentId: 0,
    jobApplicationID: 0,
    data: ["myportfoliolink.com"],
    type: ["PORTFOLIO_URL"]
}


it('should create 1 new attachment linked to a job application', async () => {
    const job_application = await prisma.job_application.findFirst();
    if (job_application){
        const created_attachment = await createAttachment(job_application.job_application_id, attachment1.data, (attachment1.type as type_enum[]));
        attachment1.jobApplicationID = created_attachment.job_application_id;
        attachment1.attachmentId = created_attachment.attachment_id;
        expect(created_attachment).toHaveProperty("data", attachment1.data);
        expect(created_attachment).toHaveProperty("type", attachment1.type);
    }
});

it('should create 1 new attachment linked to a job application', async () => {
    const job_application = await prisma.job_application.findFirst();
    if (job_application){
        const created_attachment = await createAttachment(job_application.job_application_id, attachment2.data, (attachment2.type as type_enum[]));
        attachment2.jobApplicationID = created_attachment.job_application_id;
        attachment2.attachmentId = created_attachment.attachment_id;
        expect(created_attachment).toHaveProperty("data", attachment2.data);
        expect(created_attachment).toHaveProperty("type", attachment2.type);
    }
});

it('should return the attachment, by searching for its attachment id', async () => {
    const searched_attachment = await getAttachmentById(attachment1.attachmentId);
    expect(searched_attachment).toHaveProperty("data", attachment1.data);
    expect(searched_attachment).toHaveProperty("type", attachment1.type);
});

it('should delete the attachment based upon attachment id', async () => {
    const deleted_attachment = await deleteAttachment(attachment1.attachmentId);
    expect(deleted_attachment).toHaveProperty("data", attachment1.data);
    expect(deleted_attachment).toHaveProperty("type", attachment1.type);
});

it('should delete the attachment based upon job application id', async () => {
    const deleted_attachments = await deleteAllAttachmentsForApplication(attachment2.jobApplicationID);
    expect(deleted_attachments).toHaveProperty("count", 1);
});

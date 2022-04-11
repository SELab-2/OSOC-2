import {prismaMock} from "./singleton";
import {type_enum} from "@prisma/client";
import {
    createAttachment,
    deleteAllAttachmentsForApplication,
    deleteAttachment,
    getAttachmentById
} from "../../orm_functions/attachment";

test("should create a new attachment", async () => {
    const attachment = {
        attachment_id: 1,
        job_application_id: 1,
        data: ["www.testurl.com"],
        type: type_enum.FILE_URL
    }

    prismaMock.attachment.create.mockResolvedValue(attachment);

    await expect(createAttachment(attachment.job_application_id, attachment.data, attachment.type))
        .resolves
        .toEqual(attachment);
});

test("should delete the attachment with the given id", async () => {
    const attachementId = 2;

    const attachment = {
        attachment_id: 2,
        job_application_id: 1,
        data: ["www.testurl.com"],
        type: type_enum.FILE_URL
    }

    prismaMock.attachment.delete.mockResolvedValue(attachment);

    await expect(deleteAttachment(attachementId)).resolves.toEqual(attachment);
});

test("should delete all attachments of a job application", async () => {

    const count = { count: 5}

    prismaMock.attachment.deleteMany.mockResolvedValue(count);
    await expect(deleteAllAttachmentsForApplication(1)).resolves.toEqual(count);
});

test("should return the found attachment", async () => {
    const attachment = {
        attachment_id: 2,
        job_application_id: 1,
        data: ["www.testurl.com"],
        type: type_enum.FILE_URL
    }

    prismaMock.attachment.findUnique.mockResolvedValue(attachment);

    await expect(getAttachmentById(0)).resolves.toEqual(attachment);
});
import {prismaMock} from "./singleton";
import {type_enum} from "@prisma/client";
import {createAttachment, deleteAllAttachmentsForApplication, deleteAttachment} from "../attachment";

test("should create a new attachment", async () => {
    const attachment = {
        attachment_id: 1,
        job_application_id: 1,
        url: "www.testurl.com",
        type: type_enum.FILE
    }

    prismaMock.attachment.create.mockResolvedValue(attachment);

    await expect(createAttachment(attachment.job_application_id, attachment.url, attachment.type))
        .resolves
        .toEqual(attachment);
});

test("should delete the attachment with the given id", async () => {
    const attachementId = 2;

    const attachment = {
        attachment_id: 2,
        job_application_id: 1,
        url: "www.testurl.com",
        type: type_enum.FILE
    }

    prismaMock.attachment.delete.mockResolvedValue(attachment);

    await expect(deleteAttachment(attachementId)).resolves.toEqual(attachment);
});

test("should delete all attachments of a job application", async () => {

    const count = { count: 5}

    prismaMock.attachment.deleteMany.mockResolvedValue(count);
    await expect(deleteAllAttachmentsForApplication(1)).resolves.toEqual(count);
});
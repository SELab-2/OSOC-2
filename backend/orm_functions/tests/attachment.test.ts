import {prismaMock} from "./singleton";
import {type_enum} from "@prisma/client";
import {createAttachment} from "../attachment";

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
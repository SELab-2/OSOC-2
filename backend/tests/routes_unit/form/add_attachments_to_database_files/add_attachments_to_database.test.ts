import { addAttachmentsToDatabase } from "../../../../routes/form";

import * as ormAt from "../../../../orm_functions/attachment";
jest.mock("../../../../orm_functions/attachment");
const ormAtMock = ormAt as jest.Mocked<typeof ormAt>;

test("Insert no attachments in the database", async () => {
    await expect(
        addAttachmentsToDatabase(
            {
                cv_links: {
                    data: [],
                    types: [],
                },
                portfolio_links: {
                    data: [],
                    types: [],
                },
                motivations: {
                    data: [],
                    types: [],
                },
            },
            { id: 1 }
        )
    ).resolves.toStrictEqual({});
});

test("Insert attachments in the database", async () => {
    ormAtMock.createAttachment.mockResolvedValueOnce({
        attachment_id: 1,
        job_application_id: 1,
        data: ["url1"],
        type: ["CV_URL"],
    });

    ormAtMock.createAttachment.mockResolvedValueOnce({
        attachment_id: 2,
        job_application_id: 1,
        data: ["url2"],
        type: ["PORTFOLIO_URL"],
    });

    ormAtMock.createAttachment.mockResolvedValueOnce({
        attachment_id: 3,
        job_application_id: 1,
        data: ["url3", "string1"],
        type: ["MOTIVATION_URL", "MOTIVATION_STRING"],
    });

    await expect(
        addAttachmentsToDatabase(
            {
                cv_links: {
                    data: ["url1"],
                    types: ["CV_URL"],
                },
                portfolio_links: {
                    data: ["url2"],
                    types: ["PORTFOLIO_URL"],
                },
                motivations: {
                    data: ["url3", "string1"],
                    types: ["MOTIVATION_URL", "MOTIVATION_STRING"],
                },
            },
            { id: 1 }
        )
    ).resolves.toStrictEqual({});

    ormAtMock.createAttachment.mockReset();
});

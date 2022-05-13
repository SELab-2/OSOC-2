import {
    job_application,
    attachment,
    job_application_skill,
    applied_role,
} from "@prisma/client";

import { addJobApplicationToDatabase } from "../../../../routes/form";

import * as ormJo from "../../../../orm_functions/job_application";
jest.mock("../../../../orm_functions/job_application");
const ormJoMock = ormJo as jest.Mocked<typeof ormJo>;

import * as ormApRo from "../../../../orm_functions/applied_role";
jest.mock("../../../../orm_functions/applied_role");
const ormApRoMock = ormApRo as jest.Mocked<typeof ormApRo>;

import * as ormAtt from "../../../../orm_functions/attachment";
jest.mock("../../../../orm_functions/attachment");
const ormAttMock = ormAtt as jest.Mocked<typeof ormAtt>;

import * as ormJoSk from "../../../../orm_functions/job_application_skill";
jest.mock("../../../../orm_functions/job_application_skill");
const ormJoSkMock = ormJoSk as jest.Mocked<typeof ormJoSk>;

const jobApplication: job_application & {
    attachment: attachment[];
    job_application_skill: job_application_skill[];
    applied_role: applied_role[];
} = {
    job_application_id: 1,
    student_id: 1,
    student_volunteer_info: "volunteer info",
    responsibilities: null,
    fun_fact: "I am funny",
    student_coach: true,
    osoc_id: 1,
    edus: ["Backend development"],
    edu_level: "A professional Bachelor",
    edu_duration: 5,
    edu_year: "3rd",
    edu_institute: "Ghent university",
    email_status: "DRAFT",
    created_at: new Date("December 17, 2021 03:24:00"),
    attachment: [],
    job_application_skill: [],
    applied_role: [],
};

// setup
beforeEach(() => {
    // mocks for orm
    ormJoMock.getLatestJobApplicationOfStudent.mockResolvedValue(
        jobApplication
    );
    ormApRoMock.deleteAppliedRolesByJobApplication.mockResolvedValue({
        count: 0,
    });
    ormAttMock.deleteAllAttachmentsForApplication.mockResolvedValue({
        count: 0,
    });
    ormJoSkMock.deleteSkillsByJobApplicationId.mockResolvedValue({
        count: 0,
    });
    ormJoMock.deleteJobApplication.mockResolvedValue(jobApplication);

    ormJoMock.createJobApplication.mockResolvedValue({
        job_application_id: 1,
        student_id: 1,
        student_volunteer_info: "volunteer info",
        responsibilities: null,
        fun_fact: "I am funny",
        student_coach: true,
        osoc_id: 1,
        edus: ["Backend development"],
        edu_level: "A professional Bachelor",
        edu_duration: 5,
        edu_year: "3rd",
        edu_institute: "Ghent university",
        email_status: "DRAFT",
        created_at: new Date("December 17, 2021 03:24:00"),
    });
});

// reset
afterEach(() => {
    ormJoMock.getLatestJobApplicationOfStudent.mockReset();
    ormApRoMock.deleteAppliedRolesByJobApplication.mockReset();
    ormAttMock.deleteAllAttachmentsForApplication.mockReset();
    ormJoSkMock.deleteSkillsByJobApplicationId.mockReset();
    ormJoMock.deleteJobApplication.mockReset();
    ormJoMock.createJobApplication.mockReset();
});

test("Insert a job application in the database, studentCoach not null", async () => {
    await expect(
        addJobApplicationToDatabase(
            {
                responsibilities: null,
                funFact: "I am funny",
                volunteerInfo: "volunteer info",
                studentCoach: true,
                osocId: 1,
                educations: ["Backend development"],
                educationLevel: "A professional Bachelor",
                educationDuration: 5,
                educationYear: "3rd",
                educationInstitute: "Ghent university",
                emailStatus: "DRAFT",
                createdAt: "December 17, 2021 03:24:00",
            },
            {
                id: 1,
            }
        )
    ).resolves.toStrictEqual({
        id: 1,
    });
});

test("Insert a job application in the database, studentCoach null", async () => {
    await expect(
        addJobApplicationToDatabase(
            {
                responsibilities: null,
                funFact: "I am funny",
                volunteerInfo: "volunteer info",
                studentCoach: null,
                osocId: 1,
                educations: ["Backend development"],
                educationLevel: "A professional Bachelor",
                educationDuration: 5,
                educationYear: "3rd",
                educationInstitute: "Ghent university",
                emailStatus: "DRAFT",
                createdAt: "December 17, 2021 03:24:00",
            },
            {
                id: 1,
            }
        )
    ).resolves.toStrictEqual({
        id: 1,
    });
});

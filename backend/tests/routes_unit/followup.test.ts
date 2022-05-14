// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import express from "express";
import { getMockReq } from "@jest-mock/express";
import {
    osoc,
    job_application,
    attachment,
    job_application_skill,
    applied_role,
} from "@prisma/client";

// setup mock for request
import * as req from "../../request";
jest.mock("../../request");
const reqMock = req as jest.Mocked<typeof req>;

// setup mock for utility
import * as util from "../../utility";
jest.mock("../../utility", () => {
    const og = jest.requireActual("../../utility");
    return {
        ...og,
        checkSessionKey: jest.fn(),
        isAdmin: jest.fn(),
        checkYearPermissionStudent: jest.fn(),
    }; // we want to only mock checkSessionKey, isAdmin and checkYearPermissionStudent
});
export const utilMock = util as jest.Mocked<typeof util>;

// setup mocks for orm
import * as japp from "../../orm_functions/job_application";
jest.mock("../../orm_functions/job_application");
const jappMock = japp as jest.Mocked<typeof japp>;

import * as osoc_ from "../../orm_functions/osoc";
jest.mock("../../orm_functions/osoc");
const osocMock = osoc_ as jest.Mocked<typeof osoc_>;

import * as login_user_orm from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormlMock = login_user_orm as jest.Mocked<typeof login_user_orm>;

import * as followup from "../../routes/followup";
import { errors } from "../../utility";

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

function expectNoCall<T>(func: T) {
    expect(func).toHaveBeenCalledTimes(0);
}

const osocdat: osoc = {
    osoc_id: 0,
    year: 2022,
};

type _appl = job_application & {
    attachment: attachment[];
    job_application_skill: job_application_skill[];
    applied_role: applied_role[];
};

const jobapps: _appl[] = [
    {
        job_application_id: 1,
        student_id: 5,
        student_volunteer_info: "no idea",
        responsibilities: "none",
        fun_fact: "not so fun",
        student_coach: false,
        osoc_id: 0,
        edus: [],
        edu_duration: 0,
        edu_level: "noob",
        edu_year: "pro",
        edu_institute: "someones basement",
        email_status: "SCHEDULED",
        created_at: new Date(Date.now()),
        job_application_skill: [
            {
                job_application_skill_id: 0,
                job_application_id: 1,
                skill: "useless",
                language_id: 6,
                level: 5,
                is_preferred: false,
                is_best: true,
            },
        ],
        attachment: [
            { attachment_id: 5, job_application_id: 0, data: [], type: [] },
        ],
        applied_role: [
            { applied_role_id: 2, job_application_id: 0, role_id: 6 },
        ],
    },
    {
        job_application_id: 2,
        student_id: 7,
        student_volunteer_info: "no idea",
        responsibilities: "none",
        fun_fact: "not so fun",
        student_coach: false,
        osoc_id: 0,
        edus: [],
        edu_duration: 0,
        edu_level: "noob",
        edu_year: "pro",
        edu_institute: "someones basement",
        email_status: "SCHEDULED",
        created_at: new Date(Date.now()),
        job_application_skill: [
            {
                job_application_skill_id: 0,
                job_application_id: 2,
                skill: "useless",
                language_id: 6,
                level: 5,
                is_preferred: false,
                is_best: true,
            },
        ],
        attachment: [
            { attachment_id: 5, job_application_id: 2, data: [], type: [] },
        ],
        applied_role: [
            { applied_role_id: 2, job_application_id: 2, role_id: 6 },
        ],
    },
];

beforeEach(() => {
    reqMock.parseFollowupAllRequest.mockResolvedValue({ sessionkey: "abcd" });
    reqMock.parseGetFollowupStudentRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 5,
    });
    reqMock.parseSetFollowupStudentRequest.mockImplementation((r) =>
        Promise.resolve(r.body)
    );

    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );
    utilMock.isAdmin.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );
    utilMock.checkYearPermissionStudent.mockImplementation((v) =>
        Promise.resolve(v)
    );

    osocMock.getLatestOsoc.mockResolvedValue(osocdat);
    osocMock.getOsocById.mockResolvedValue(osocdat);
    jappMock.getJobApplicationByYear.mockResolvedValue(jobapps);
    jappMock.getLatestJobApplicationOfStudent.mockImplementation((v) =>
        v == 5
            ? Promise.resolve(jobapps[0])
            : v == 7
            ? Promise.resolve(jobapps[1])
            : Promise.resolve(null)
    );
    jappMock.changeEmailStatusOfJobApplication.mockImplementation((id, u) =>
        id == 1
            ? Promise.resolve({ ...jobapps[0], email_status: u })
            : id == 2
            ? Promise.resolve({ ...jobapps[1], email_status: u })
            : Promise.reject()
    );

    ormlMock.getOsocYearsForLoginUser.mockResolvedValue([2022]);
});

afterEach(() => {
    reqMock.parseFollowupAllRequest.mockReset();
    reqMock.parseGetFollowupStudentRequest.mockReset();
    reqMock.parseSetFollowupStudentRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();
    utilMock.checkYearPermissionStudent.mockReset();

    osocMock.getLatestOsoc.mockReset();
    osocMock.getOsocById.mockReset();
    jappMock.getJobApplicationByYear.mockReset();
    jappMock.getLatestJobApplicationOfStudent.mockReset();
    jappMock.changeEmailStatusOfJobApplication.mockReset();

    ormlMock.getOsocYearsForLoginUser.mockReset();
});

test("Can get all followup data", async () => {
    const req: express.Request = getMockReq();

    await expect(followup.listFollowups(req)).resolves.toStrictEqual({
        data: jobapps.map((x) => ({
            student: x.student_id,
            application: x.job_application_id,
            status: x.email_status,
        })),
    });
    expectCall(utilMock.checkSessionKey, { sessionkey: "abcd" });
    expectCall(reqMock.parseFollowupAllRequest, req);
    expect(osocMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expectCall(jappMock.getJobApplicationByYear, osocdat.year);
    expectNoCall(utilMock.isAdmin);
});

test("Cannot get all followup data because invalid year permissions", async () => {
    const req: express.Request = getMockReq();

    // set the visible years NOT to 2022
    ormlMock.getOsocYearsForLoginUser.mockReset();
    ormlMock.getOsocYearsForLoginUser.mockResolvedValue([2000, 2001]);

    await expect(followup.listFollowups(req)).rejects.toBe(
        errors.cookInsufficientRights()
    );
    expectCall(utilMock.checkSessionKey, { sessionkey: "abcd" });
    expectCall(reqMock.parseFollowupAllRequest, req);
    expect(osocMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expectNoCall(jappMock.getJobApplicationByYear);
    expectNoCall(utilMock.isAdmin);
});

test("Can get single followup", async () => {
    const req: express.Request = getMockReq();
    await expect(followup.getFollowup(req)).resolves.toStrictEqual({
        student: jobapps[0].student_id,
        application: jobapps[0].job_application_id,
        status: jobapps[0].email_status,
    });
    expectCall(utilMock.checkSessionKey, { sessionkey: "abcd", id: 5 });
    expectCall(reqMock.parseGetFollowupStudentRequest, req);
    expectCall(jappMock.getLatestJobApplicationOfStudent, 5);
    expectNoCall(utilMock.isAdmin);
});

test("Cannot get single followup because invalid year permissions", async () => {
    const req: express.Request = getMockReq();
    // set the visible years NOT to 2022
    ormlMock.getOsocYearsForLoginUser.mockReset();
    ormlMock.getOsocYearsForLoginUser.mockResolvedValue([2000, 2001]);

    await expect(followup.getFollowup(req)).rejects.toBe(
        errors.cookInsufficientRights()
    );
    expectCall(utilMock.checkSessionKey, { sessionkey: "abcd", id: 5 });
    expectCall(reqMock.parseGetFollowupStudentRequest, req);
    expectCall(jappMock.getLatestJobApplicationOfStudent, 5);
    expectNoCall(utilMock.isAdmin);
});

test("Can update single followup", async () => {
    const req: express.Request = getMockReq();
    req.body.type = "SENT";
    req.body.id = 5;
    req.body.sessionkey = "abcd";
    await expect(followup.updateFollowup(req)).resolves.toStrictEqual({
        student: 5,
        application: 1,
        status: "SENT",
    });
});

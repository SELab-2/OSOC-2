import { getMockReq } from "@jest-mock/express";

import express from "express";
import { errors } from "../../../../utility";
import { createForm, readFile } from "../../../../routes/form";

import * as ormOs from "../../../../orm_functions/osoc";
import { job_application, osoc } from "@prisma/client";
jest.mock("../../../../orm_functions/osoc");
const ormOsMock = ormOs as jest.Mocked<typeof ormOs>;

import * as ormJo from "../../../../orm_functions/job_application";
jest.mock("../../../../orm_functions/job_application");
const ormJoMock = ormJo as jest.Mocked<typeof ormJo>;

import * as ormP from "../../../../orm_functions/person";
jest.mock("../../../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;

import * as ormSt from "../../../../orm_functions/student";
jest.mock("../../../../orm_functions/student");
const ormStMock = ormSt as jest.Mocked<typeof ormSt>;

import * as ormL from "../../../../orm_functions/language";
jest.mock("../../../../orm_functions/language");
const ormLMock = ormL as jest.Mocked<typeof ormL>;

import * as ormJoSk from "../../../../orm_functions/job_application_skill";
jest.mock("../../../../orm_functions/job_application_skill");
const ormJoSkMock = ormJoSk as jest.Mocked<typeof ormJoSk>;

import * as ormRo from "../../../../orm_functions/role";
jest.mock("../../../../orm_functions/role");
const ormRoMock = ormRo as jest.Mocked<typeof ormRo>;

import * as ormAppRo from "../../../../orm_functions/applied_role";
jest.mock("../../../../orm_functions/applied_role");
const ormAppRoMock = ormAppRo as jest.Mocked<typeof ormAppRo>;

const jobApplication: job_application = {
    job_application_id: 1,
    student_id: 1,
    student_volunteer_info: "Yes, I can work as a volunteer in Belgium",
    responsibilities: "not really, I'm available the whole day",
    fun_fact: "I like running and baking",
    student_coach: false,
    osoc_id: 1,
    edus: ["Computer Sciences", "baking"],
    edu_level: "An academic Bachelor",
    edu_duration: 3,
    edu_year: "3",
    edu_institute: "UGent",
    email_status: "NONE",
    created_at: new Date("2022-04-14T18:15:30.245Z"),
};

test("Live in Belgium question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "failLiveInBelgiumAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Live in Belgium value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "failLiveInBelgiumValueNull.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in july value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "failWorkInJulyValueNull.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in July question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "failWorkInJulyAbsent.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());
});

test("Work in July 'no' answer", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "liveInBelgiumAnswerNo.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).resolves.toStrictEqual({});
});

test("Work in July 'null' answer", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "liveInBelgiumAnswerNull.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).resolves.toStrictEqual({});
});

test("No osoc year specified", async () => {
    mockDatabaseCalls(null);

    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "allValidForm.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).rejects.toBe(errors.cookArgumentError());

    resetDatabaseCalls();
});

function mockDatabaseCalls(latestOsocValue: osoc | null) {
    ormPMock.searchPersonByLogin.mockResolvedValue([]);
    ormOsMock.getLatestOsoc.mockResolvedValue(latestOsocValue);
    ormPMock.getAllPersons.mockResolvedValue([]);
    ormPMock.createPerson.mockResolvedValue({
        name: "Bram Devlaminck",
        person_id: 1,
        email: "T.h.i.s.i.s.a.t.e.s.t.m.a.i.l@gmail.com",
        github: null,
        github_id: null,
    });
    ormStMock.getAllStudents.mockResolvedValue([]);
    ormStMock.createStudent.mockResolvedValue({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "+32 477 47 47 47",
        nickname: null,
        alumni: true,
    });
    ormJoMock.getLatestJobApplicationOfStudent.mockResolvedValue(null);
    ormJoMock.createJobApplication.mockResolvedValue(jobApplication);
    ormLMock.getLanguageByName.mockResolvedValueOnce({
        language_id: 1,
        name: "Dutch",
    });
    ormLMock.getLanguageByName.mockResolvedValueOnce({
        language_id: 2,
        name: "English",
    });
    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: null,
        language_id: 2,
        job_application_skill_id: 1,
        level: 4,
        is_preferred: false,
        is_best: false,
    });

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: "backend development",
        language_id: null,
        job_application_skill_id: 2,
        level: null,
        is_preferred: false,
        is_best: true,
    });
    ormRoMock.getRolesByName.mockResolvedValueOnce({
        role_id: 1,
        name: "Front-end developer",
    });
    ormRoMock.getRolesByName.mockResolvedValueOnce({
        role_id: 2,
        name: "Back-end developer",
    });
    ormAppRoMock.createAppliedRole.mockResolvedValueOnce({
        applied_role_id: 1,
        job_application_id: 1,
        role_id: 1,
    });
    ormAppRoMock.createAppliedRole.mockResolvedValueOnce({
        applied_role_id: 2,
        job_application_id: 1,
        role_id: 2,
    });
}

function resetDatabaseCalls() {
    ormPMock.searchPersonByLogin.mockReset();
    ormOsMock.getLatestOsoc.mockReset();
    ormPMock.getAllPersons.mockReset();
    ormPMock.createPerson.mockReset();
    ormStMock.getAllStudents.mockReset();
    ormStMock.createStudent.mockReset();
    ormJoMock.getLatestJobApplicationOfStudent.mockReset();
    ormJoMock.createJobApplication.mockReset();
    ormLMock.getLanguageByName.mockReset();
    ormJoSkMock.createJobApplicationSkill.mockReset();
    ormRoMock.getRolesByName.mockReset();
    ormAppRoMock.createAppliedRole.mockReset();
}

test("Osoc year specified", async () => {
    mockDatabaseCalls({
        osoc_id: 1,
        year: 2023,
    });

    const data = await readFile(
        "../tests/routes_unit/form/create_form_files",
        "allValidForm.json"
    );
    expect(data).not.toBeNull();

    const req: express.Request = getMockReq();
    req.body = { ...data };
    await expect(createForm(req)).resolves.toStrictEqual({});

    resetDatabaseCalls();
});

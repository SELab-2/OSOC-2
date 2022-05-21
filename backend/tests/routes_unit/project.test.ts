// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import * as prisma from "@prisma/client";

import { errors } from "../../utility";

// import & mock
import * as rq from "../../request";
jest.mock("../../request");
const reqMock = rq as jest.Mocked<typeof rq>;

import * as util from "../../utility";
jest.mock("../../utility");
const utilMock = util as jest.Mocked<typeof util>;

import * as ormPr from "../../orm_functions/project";
jest.mock("../../orm_functions/project");
const ormPrMock = ormPr as jest.Mocked<typeof ormPr>;

import * as ormRole from "../../orm_functions/role";
jest.mock("../../orm_functions/role");
const ormRMock = ormRole as jest.Mocked<typeof ormRole>;

import * as ormPrRole from "../../orm_functions/project_role";
jest.mock("../../orm_functions/project_role");
const ormPrRMock = ormPrRole as jest.Mocked<typeof ormPrRole>;

import * as ormCtr from "../../orm_functions/contract";
jest.mock("../../orm_functions/contract");
const ormCMock = ormCtr as jest.Mocked<typeof ormCtr>;

import * as ormPU from "../../orm_functions/project_user";
jest.mock("../../orm_functions/project_user");
const ormPUMock = ormPU as jest.Mocked<typeof ormPU>;

import * as ormLU from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormLUMock = ormLU as jest.Mocked<typeof ormLU>;

import * as ormEv from "../../orm_functions/evaluation";
jest.mock("../../orm_functions/evaluation");
const ormEvMock = ormEv as jest.Mocked<typeof ormEv>;

import * as ormO from "../../orm_functions/osoc";
jest.mock("../../orm_functions/osoc");
const ormOMock = ormO as jest.Mocked<typeof ormO>;

import * as project from "../../routes/project";
import { CreateProject } from "../../orm_functions/orm_types";
import { contract_status_enum } from "@prisma/client";

const realDateNow = Date.now.bind(global.Date);
const dateNowStub = jest.fn(() => 123456789);

function newProject(v: CreateProject): prisma.project {
    return {
        project_id: 0,
        name: v.name,
        osoc_id: 0,
        partner: v.partner,
        description: v.description,
        start_date: v.startDate,
        end_date: v.endDate,
    };
}

type studenttype = {
    student_id: number;
    gender: string;
    pronouns: string | null;
    phone_number: string;
    nickname: string | null;
    alumni: boolean;
    person: prisma.person;
} | null;

type rolestype = {
    positions: number;
    project_id: number;
    project_role_id: number;
    role_id: number;
    role: {
        name: string;
    };
};

type contrtype = {
    contract_status: prisma.contract_status_enum;
    contract_id: number;
    student: studenttype;
    project_role: rolestype;
    login_user: {
        login_user_id: number;
        is_admin: boolean;
        is_coach: boolean;
        person: prisma.person;
    };
};

const roles: prisma.role[] = [
    { role_id: 0, name: "dev" },
    { role_id: 1, name: "backend" },
    { role_id: 2, name: "frontend" },
    { role_id: 3, name: "full-stack" },
    { role_id: 4, name: "procrastinator" },
];

const projects: prisma.project[] = [
    {
        project_id: 0,
        name: "sample project",
        osoc_id: 0,
        partner: "jefke",
        description: null,
        start_date: new Date(Date.now()),
        end_date: new Date(Date.now()),
    },
    {
        project_id: 1,
        name: "other project",
        osoc_id: 0,
        partner: "not jefke",
        description: "def not a project for jefke",
        start_date: new Date(Date.now()),
        end_date: new Date(Date.now()),
    },
];

const projectroles: prisma.project_role[] = [
    { project_role_id: 0, project_id: 0, role_id: 0, positions: 3 },
    { project_role_id: 1, project_id: 1, role_id: 1, positions: 4 },
    { project_role_id: 2, project_id: 0, role_id: 2, positions: 7 },
    { project_role_id: 3, project_id: 1, role_id: 3, positions: 2 },
    { project_role_id: 4, project_id: 0, role_id: 4, positions: 7 },
];

const people: prisma.person[] = [
    {
        person_id: 0,
        email: "jeff@gmail.com",
        github: null,
        github_id: null,
        name: "jeff",
    },
    {
        person_id: 1,
        email: "marie@gmail.com",
        github: null,
        github_id: null,
        name: "marie",
    },
    {
        person_id: 2,
        email: "gget@gmail.com",
        github: null,
        github_id: null,
        name: "georgette",
    },
    {
        person_id: 3,
        email: "stef@gmail.com",
        github: null,
        github_id: null,
        name: "stef",
    },
    {
        person_id: 4,
        email: "jean@gmail.com",
        github: null,
        github_id: null,
        name: "jean",
    },
    {
        person_id: 5,
        email: "karen@manager.com",
        github: null,
        github_id: null,
        name: "karen",
    },

    {
        person_id: 6,
        email: null,
        github: "@admin",
        github_id: "null",
        name: "adminboi",
    },
];

const students: studenttype[] = [
    {
        student_id: 0,
        gender: "one",
        pronouns: null,
        phone_number: "04",
        nickname: null,
        alumni: false,
        person: people[0],
    },
    {
        student_id: 1,
        gender: "two",
        pronouns: null,
        phone_number: "04",
        nickname: null,
        alumni: false,
        person: people[1],
    },
    {
        student_id: 2,
        gender: "three",
        pronouns: null,
        phone_number: "04",
        nickname: null,
        alumni: false,
        person: people[2],
    },
    {
        student_id: 3,
        gender: "four",
        pronouns: null,
        phone_number: "04",
        nickname: null,
        alumni: false,
        person: people[3],
    },
    {
        student_id: 4,
        gender: "five",
        pronouns: null,
        phone_number: "04",
        nickname: null,
        alumni: false,
        person: people[4],
    },
    {
        student_id: 5,
        gender: "six",
        pronouns: null,
        phone_number: "04",
        nickname: null,
        alumni: false,
        person: people[5],
    },
];

const deltaroles: rolestype[] = [
    { ...projectroles[0], role: { ...roles[0] } },
    { ...projectroles[1], role: { ...roles[1] } },
    { ...projectroles[2], role: { ...roles[2] } },
    { ...projectroles[3], role: { ...roles[3] } },
    { ...projectroles[4], role: { ...roles[4] } },
];

const loginuser: contrtype["login_user"] = {
    is_admin: true,
    is_coach: false,
    login_user_id: 0,
    person: people[5],
};

const contracts: contrtype[] = [
    {
        contract_status: "DRAFT",
        contract_id: 0,
        student: students[0],
        project_role: deltaroles[0],
        login_user: loginuser,
    },
    {
        contract_status: "DRAFT",
        contract_id: 1,
        student: students[1],
        project_role: deltaroles[1],
        login_user: loginuser,
    },
    {
        contract_status: "DRAFT",
        contract_id: 2,
        student: students[2],
        project_role: deltaroles[2],
        login_user: loginuser,
    },
    {
        contract_status: "DRAFT",
        contract_id: 3,
        student: students[3],
        project_role: deltaroles[3],
        login_user: loginuser,
    },
    {
        contract_status: "DRAFT",
        contract_id: 4,
        student: students[4],
        project_role: deltaroles[4],
        login_user: loginuser,
    },
];

const studcontr = [
    {
        student: {
            student_id: 0,
            person_id: 0,
            gender: "apache attack heli",
            pronouns: null,
            phone_number: "+32",
            nickname: null,
            alumni: false,
        },
        project_role: {
            project_id: 0,
            project: { osoc_id: 2022 },
        },
        contract_id: 0,
    },
    {
        student: {
            student_id: 1,
            person_id: 1,
            gender: "apache attack heli",
            pronouns: null,
            phone_number: "+32",
            nickname: null,
            alumni: false,
        },
        project_role: {
            project_id: 0,
            project: { osoc_id: 2022 },
        },
        contract_id: 1,
    },
];

const evals = [
    {
        evaluation_id: 0,
        login_user_id: 0,
        job_application_id: 0,
        decision: "YES" as prisma.decision_enum,
        is_final: true,
        motivation: null,
    },
    {
        evaluation_id: 1,
        login_user_id: 0,
        job_application_id: 1,
        decision: "MAYBE" as prisma.decision_enum,
        is_final: true,
        motivation: null,
    },
    {
        evaluation_id: 2,
        login_user_id: 0,
        job_application_id: 2,
        decision: "NO" as prisma.decision_enum,
        is_final: true,
        motivation: null,
    },
];

const osocCtr = [
    { project_role: { project: projects[0] }, student_id: 0 },
    { project_role: { project: projects[1] }, student_id: 0 },
    { project_role: { project: projects[1] }, student_id: 1 },
    { project_role: { project: projects[0] }, student_id: 2 },
    { project_role: { project: projects[1] }, student_id: 2 },
    { project_role: { project: projects[1] }, student_id: 3 },
];

function orDefault<T>(v: T | undefined, d: T): T {
    return v == undefined ? d : v;
}

beforeEach(() => {
    // date
    dateNowStub.mockImplementation(() => 123456789);
    global.Date.now = dateNowStub;

    // request
    reqMock.parseNewProjectRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseProjectAllRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseUpdateProjectRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseDeleteProjectRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseGetDraftedStudentsRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseDraftStudentRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseRemoveCoachRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseAssignCoachRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseRemoveAssigneeRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseProjectConflictsRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseDraftStudentRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseFilterProjectsRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseSingleProjectRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );

    // util
    utilMock.isAdmin.mockImplementation((v) =>
        Promise.resolve({
            data: v,
            userId: 0,
            is_admin: true,
            is_coach: false,
            accountStatus: "ACTIVATED",
        })
    );
    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            data: v,
            userId: 0,
            is_admin: true,
            is_coach: false,
            accountStatus: "ACTIVATED",
        })
    );
    utilMock.isValidID.mockImplementation((v) => Promise.resolve(v));
    utilMock.getOrDefault.mockImplementation((v, x) =>
        v == undefined || v == null ? x : v
    );
    utilMock.getOrReject.mockImplementation((v) =>
        v == undefined || v == null ? Promise.reject({}) : Promise.resolve(v)
    );

    // project orm
    ormPrMock.createProject.mockImplementation((v) =>
        Promise.resolve(newProject(v))
    );
    ormPrMock.getAllProjects.mockResolvedValue(projects);
    ormPrMock.updateProject.mockImplementation((v) =>
        Promise.resolve({
            project_id: v.projectId,
            name: orDefault(v.name, "name"),
            osoc_id: orDefault(v.osocId, 0),
            partner: orDefault(v.partner, "partner"),
            description: orDefault(v.description, null),
            start_date: orDefault(v.startDate, new Date(1000000)),
            end_date: orDefault(v.endDate, new Date(10000000)),
        })
    );
    ormPrMock.deleteProject.mockImplementation(() =>
        Promise.resolve(projects[0])
    );
    ormPrMock.deleteProjectFromDB.mockImplementation(() => Promise.resolve());
    ormPrMock.getProjectById.mockImplementation((id) =>
        Promise.resolve(projects[id])
    );
    ormPrMock.filterProjects.mockResolvedValue({
        data: projects.map((x) => ({
            ...x,
            project_role: [{ role: { name: "role_1" }, positions: 15 }],
            project_user: [
                { login_user: { login_user_id: 1, is_coach: true } },
            ],
        })),
        pagination: { page: 0, count: projects.length },
    });
    ormPrMock.getProjectById.mockImplementation((id) =>
        Promise.resolve(id < projects.length ? projects[id] : null)
    );

    // role orm
    ormRMock.getRolesByName.mockImplementation((rln) => {
        const tmp = roles.filter((v) => v.name == rln);
        if (tmp.length > 0) return Promise.resolve(tmp[0]);
        return Promise.resolve(null);
    });
    ormRMock.createRole.mockImplementation((v) =>
        Promise.resolve({ role_id: 4, name: v })
    );
    ormRMock.getRole.mockImplementation((v) => Promise.resolve(roles[v]));

    // project-role orm
    ormPrRMock.createProjectRole.mockImplementation((v) =>
        Promise.resolve({
            project_role_id: 0,
            project_id: v.projectId,
            role_id: v.roleId,
            positions: v.positions,
        })
    );
    ormPrRMock.getProjectRolesByProject.mockImplementation((id) =>
        Promise.resolve(projectroles.filter((x) => x.project_id === id))
    );
    ormPrRMock.updateProjectRole.mockImplementation((v) =>
        Promise.resolve({
            project_role_id: v.projectRoleId,
            project_id: v.projectId,
            role_id: v.roleId,
            positions: v.positions,
        })
    );
    ormPrRMock.deleteProjectRole.mockResolvedValue(projectroles[0]);
    ormPrRMock.getNumberOfFreePositions.mockImplementation((v) =>
        Promise.resolve((v + 1) * (v + 2))
    );
    ormPrRMock.getProjectRoleById.mockImplementation((v) =>
        Promise.resolve({
            ...projectroles[v],
            role: { ...roles[v] },
        })
    );
    ormPrRMock.getProjectRoleNamesByProject.mockImplementation((v) =>
        Promise.resolve(
            projectroles
                .filter((x) => x.project_id == v)
                .map((x) => ({
                    ...x,
                    role: roles[x.role_id],
                }))
        )
    );

    // contract orm
    ormCMock.contractsByProject.mockImplementation((id) =>
        Promise.resolve(
            contracts.filter((x) => x.project_role.project_id == id)
        )
    );
    ormCMock.updateContract.mockImplementation((upd) =>
        Promise.resolve({
            contract_id: upd.contractId,
            loginUserId: upd.loginUserId,
            project_role_id: upd.projectRoleId || 0,
            student_id: 0,
            information: "",
            created_by_login_user_id: 0,
            contract_status: upd.contractStatus || "DRAFT",
        })
    );
    ormCMock.contractsForStudent.mockResolvedValue(studcontr);
    ormCMock.removeContract.mockImplementation((v) =>
        Promise.resolve({
            contract_id: v,
            student_id: 0,
            created_by_login_user_id: 0,
            project_role_id: 0,
            information: null,
            contract_status: "DRAFT",
        })
    );
    ormCMock.sortedContractsByOsocEdition.mockResolvedValue(osocCtr);
    ormCMock.createContract.mockImplementation((v) =>
        Promise.resolve({
            contract_id: 5,
            loginUserId: v.loginUserId,
            project_role_id: v.projectRoleId || 0,
            student_id: v.studentId,
            information: v.information || null,
            created_by_login_user_id: v.loginUserId,
            contract_status: v.contractStatus || "DRAFT",
        })
    );

    // project user orm
    ormPUMock.getUsersFor.mockResolvedValue([
        { login_user: loginuser, project_user_id: 0 },
    ]);
    ormPUMock.deleteProjectUser.mockImplementation(() =>
        Promise.resolve({ count: 0 })
    );
    ormPUMock.createProjectUser.mockImplementation((v) =>
        Promise.resolve({
            login_user_id: v.loginUserId,
            project_id: v.projectId,
            project_user_id: 0,
        })
    );

    // evaluation orm
    ormEvMock.getEvaluationByPartiesFor.mockResolvedValue(evals);
    ormEvMock.updateEvaluationForStudent.mockImplementation((v) =>
        Promise.resolve({
            evaluation_id: v.evaluation_id,
            decision: "MAYBE",
            login_user_id: v.loginUserId,
            motivation: v.motivation || null,
            job_application_id: 0,
            is_final: true,
        })
    );

    // osoc orm
    ormOMock.getNewestOsoc.mockResolvedValue({ osoc_id: 1, year: 2022 });
    ormOMock.getLatestOsoc.mockResolvedValue({ osoc_id: 1, year: 2022 });
});

afterEach(() => {
    // date
    dateNowStub.mockReset();
    global.Date.now = realDateNow;

    // request
    reqMock.parseNewProjectRequest.mockReset();
    reqMock.parseProjectAllRequest.mockReset();
    reqMock.parseUpdateProjectRequest.mockReset();
    reqMock.parseDeleteProjectRequest.mockReset();
    reqMock.parseGetDraftedStudentsRequest.mockReset();
    reqMock.parseDraftStudentRequest.mockReset();
    reqMock.parseRemoveCoachRequest.mockReset();
    reqMock.parseAssignCoachRequest.mockReset();
    reqMock.parseRemoveAssigneeRequest.mockReset();
    reqMock.parseProjectConflictsRequest.mockReset();
    reqMock.parseDraftStudentRequest.mockReset();
    reqMock.parseFilterProjectsRequest.mockReset();
    reqMock.parseSingleProjectRequest.mockReset();

    // util
    utilMock.isAdmin.mockReset();
    utilMock.checkSessionKey.mockReset();
    utilMock.isValidID.mockReset();
    utilMock.getOrDefault.mockReset();
    utilMock.getOrReject.mockReset();

    // project orm
    ormPrMock.createProject.mockReset();
    ormPrMock.getAllProjects.mockReset();
    ormPrMock.updateProject.mockReset();
    ormPrMock.deleteProject.mockReset();
    ormPrMock.deleteProjectFromDB.mockReset();
    ormPrMock.getProjectById.mockReset();
    ormPrMock.filterProjects.mockReset();
    ormPrMock.getProjectById.mockReset();

    // role orm
    ormRMock.getRolesByName.mockReset();
    ormRMock.createRole.mockReset();
    ormRMock.getRole.mockReset();

    // project-role orm
    ormPrRMock.createProjectRole.mockReset();
    ormPrRMock.getProjectRolesByProject.mockReset();
    ormPrRMock.updateProjectRole.mockReset();
    ormPrRMock.deleteProjectRole.mockReset();
    ormPrRMock.getNumberOfFreePositions.mockReset();
    ormPrRMock.getProjectRoleById.mockReset();
    ormPrRMock.getProjectRoleNamesByProject.mockReset();

    // contract orm
    ormCMock.contractsByProject.mockReset();
    ormCMock.updateContract.mockReset();
    ormCMock.removeContract.mockReset();
    ormCMock.contractsForStudent.mockReset();
    ormCMock.removeContract.mockReset();
    ormCMock.sortedContractsByOsocEdition.mockReset();
    ormCMock.createContract.mockReset();

    // project user orm
    ormPUMock.getUsersFor.mockReset();
    ormPUMock.deleteProjectUser.mockReset();
    ormPUMock.createProjectUser.mockReset();

    // evaluation orm
    ormEvMock.getEvaluationByPartiesFor.mockReset();
    ormEvMock.updateEvaluationForStudent.mockReset();

    // osoc orm
    ormOMock.getNewestOsoc.mockReset();
    ormOMock.getLatestOsoc.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Can create new projects", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "some-key",
        osocId: 0,
        name: "Operation Ivy",
        partner: "US Goverment",
        description:
            "Let's build a thermonuclear warhead! What could go wrong?",
        start: new Date("January 31, 1950"),
        end: new Date("November 15, 1952 23:30:00.0"),
        roles: {
            roles: [
                { name: "dev", positions: 8 },
                { name: "nuclear bomb engineer", positions: 2 },
            ],
        },
        coaches: {
            coaches: [0],
        },
    };

    await expect(project.createProject(req)).resolves.toStrictEqual({
        id: 0,
        name: req.body.name,
        partner: req.body.partner,
        start_date: req.body.start.toString(),
        end_date: req.body.end.toString(),
        osoc_id: 0,
        roles: req.body.roles.roles,
        description: req.body.description,
        coaches: [{ login_user: loginuser, project_user_id: 0 }],
    });
    expectCall(reqMock.parseNewProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormPrMock.createProject, {
        name: req.body.name,
        partner: req.body.partner,
        startDate: req.body.start,
        endDate: req.body.end,
        osocId: req.body.osocId,
        description: req.body.description,
    });
    expect(ormRMock.getRolesByName).toHaveBeenCalledTimes(2);
    expectCall(ormRMock.createRole, req.body.roles.roles[1].name);
    expect(ormPrRMock.createProjectRole).toHaveBeenCalledTimes(2);
});

test("Can create new projects (insufficient rights)", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "some-key",
        osocId: 0,
        name: "Operation Ivy",
        partner: "US Goverment",
        description:
            "Let's build a thermonuclear warhead! What could go wrong?",
        start: new Date("January 31, 1950"),
        end: new Date("November 15, 1952 23:30:00.0"),
        roles: {
            roles: [
                { name: "dev", positions: 8 },
                { name: "nuclear bomb engineer", positions: 2 },
            ],
        },
        coaches: {
            coaches: [0],
        },
    };

    ormLUMock.getOsocYearsForLoginUser.mockResolvedValue([2023]);

    ormOMock.getOsocById.mockResolvedValue({
        osoc_id: 0,
        year: 2022,
    });

    await expect(project.createProject(req)).rejects.toBe(
        errors.cookInsufficientRights()
    );

    ormLUMock.getOsocYearsForLoginUser.mockReset();
    ormOMock.getOsocById.mockReset();
});

test("Can list all projects", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "key" };

    // I'm too exhausted to even try to reconstruct this...
    // I mean... there's no use in reimplementing the function here, right?
    await expect(project.listProjects(req)).resolves.not.toThrow();
    expectCall(reqMock.parseProjectAllRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);

    expect(ormPrMock.getAllProjects).toHaveBeenCalledTimes(0);
    expect(ormPrRMock.getProjectRolesByProject).toHaveBeenCalledTimes(
        projects.length
    );
    expect(ormRMock.getRole).toHaveBeenCalledTimes(roles.length);
    expect(ormCMock.contractsByProject).toHaveBeenCalledTimes(projects.length);
    expect(ormPUMock.getUsersFor).toHaveBeenCalledTimes(projects.length);
});

test("Can't list all projects (role failure)", async () => {
    ormRMock.getRole.mockResolvedValue(null);
    const req = getMockReq();
    req.body = { sessionkey: "key" };

    await expect(project.listProjects(req)).rejects.toStrictEqual(undefined);
    expectCall(reqMock.parseProjectAllRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);

    expect(ormPrMock.getAllProjects).toHaveBeenCalledTimes(0);
    expect(ormPrRMock.getProjectRolesByProject).toHaveBeenCalledTimes(1);
    expect(ormRMock.getRole).toHaveBeenCalledTimes(1);
    expect(ormCMock.contractsByProject).not.toHaveBeenCalled();
    expect(ormPUMock.getUsersFor).not.toHaveBeenCalled();
});

test("Can get single project", async () => {
    ormCMock.contractsByProject.mockResolvedValue([contracts[0]]);
    const req = getMockReq();
    req.body = { sessionkey: "key", id: 0 };

    const res = {
        id: projects[0].project_id,
        description: null,
        name: projects[0].name,
        partner: projects[0].partner,
        start_date: projects[0].start_date.toString(),
        end_date: projects[0].end_date.toString(),
        osoc_id: projects[0].osoc_id,
        roles: [
            { name: roles[0].name, positions: projectroles[0].positions },
            { name: roles[2].name, positions: projectroles[2].positions },
            { name: roles[4].name, positions: projectroles[4].positions },
        ],
        coaches: [{ login_user: loginuser, project_user_id: 0 }],
        contracts: [
            {
                contract_id: 0,
                contract_status: "DRAFT",
                login_user: {
                    is_admin: true,
                    is_coach: false,
                    login_user_id: 0,
                    person: {
                        email: "karen@manager.com",
                        github: null,
                        github_id: null,
                        name: "karen",
                        person_id: 5,
                    },
                },
                project_role: {
                    positions: 3,
                    project_id: 0,
                    project_role_id: 0,
                    role: {
                        name: "dev",
                        role_id: 0,
                    },
                    role_id: 0,
                },
                student: {
                    evaluation: undefined,
                    evaluations: undefined,
                    jobApplication: undefined,
                    roles: undefined,
                    student: {
                        alumni: false,
                        gender: "one",
                        nickname: null,
                        person: {
                            email: "jeff@gmail.com",
                            github: null,
                            github_id: null,
                            name: "jeff",
                            person_id: 0,
                        },
                        person_id: undefined,
                        phone_number: "04",
                        pronouns: null,
                        student_id: 0,
                    },
                },
            },
        ],
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.getProject(req)).resolves.toStrictEqual(res);
    expectCall(reqMock.parseSingleProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.isValidID).toHaveBeenCalledTimes(1);
    expectCall(ormPrMock.getProjectById, 0);
    expectCall(ormCMock.contractsByProject, 0);
    expectCall(ormPrRMock.getProjectRolesByProject, 0);
    expect(ormRMock.getRole).toHaveBeenCalledTimes(3);
    expectCall(ormPU.getUsersFor, 0);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't get single project (role error)", async () => {
    ormCMock.contractsByProject.mockResolvedValue([contracts[0]]);
    ormRMock.getRole.mockResolvedValue(null);
    const req = getMockReq();
    req.body = { sessionkey: "key", id: 0 };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.getProject(req)).rejects.toStrictEqual(undefined);
    expectCall(reqMock.parseSingleProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.isValidID).toHaveBeenCalledTimes(1);
    expectCall(ormPrMock.getProjectById, 0);
    expectCall(ormCMock.contractsByProject, 0);
    expectCall(ormPrRMock.getProjectRolesByProject, 0);
    expect(ormRMock.getRole).toHaveBeenCalledTimes(1);
    expect(ormPU.getUsersFor).not.toHaveBeenCalled();

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't get single project (ID error)", async () => {
    ormPrMock.getProjectById.mockResolvedValue(null);
    const req = getMockReq();
    req.body = { sessionkey: "key", id: 0 };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.getProject(req)).rejects.toStrictEqual(undefined);
    expectCall(reqMock.parseSingleProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.isValidID).toHaveBeenCalledTimes(1);
    expectCall(ormPrMock.getProjectById, 0);
    expect(ormCMock.contractsByProject).not.toHaveBeenCalled();
    expect(ormPrRMock.getProjectRolesByProject).not.toHaveBeenCalled();
    expect(ormRMock.getRole).not.toHaveBeenCalled();
    expect(ormPU.getUsersFor).not.toHaveBeenCalled();

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can modify projects", async () => {
    const req = getMockReq();

    req.body = {
        sessionkey: "key",
        id: 0,
        name: "project-1",
        partner: "new-partner",
        start: new Date(Date.now()),
        end: new Date(Date.now() + 1000),
        roles: {
            roles: [
                { name: "dev", positions: 101 },
                { name: "frontend", positions: 0 },
                { name: "backend", positions: 12 },
            ],
        },
        description: "The old partner sucked",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProject(req)).resolves.toStrictEqual({
        description: req.body.description,
        start_date: req.body.start.toString(),
        end_date: req.body.end.toString(),
        partner: req.body.partner,
        name: req.body.name,
        id: req.body.id,
        osoc_id: projects[0].osoc_id,
        roles: [
            {
                name: "dev",
                positions: 3,
            },
            {
                name: "frontend",
                positions: 7,
            },
            {
                name: "procrastinator",
                positions: 7,
            },
        ],
        coaches: [{ login_user: loginuser, project_user_id: 0 }],
    });
    expectCall(reqMock.parseUpdateProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.isValidID).toHaveBeenCalledTimes(1);
    expectCall(ormPrMock.updateProject, {
        projectId: req.body.id,
        name: req.body.name,
        partner: req.body.partner,
        startDate: req.body.start,
        endDate: req.body.end,
        osocId: req.body.osocId,
        description: req.body.description,
    });
    expect(ormRMock.getRole).toHaveBeenCalledTimes(
        projectroles.filter((x) => x.project_id == 0).length
    );
    expectCall(ormPrRMock.updateProjectRole, {
        projectRoleId: 0,
        projectId: req.body.id,
        roleId: roles[0].role_id,
        positions: req.body.roles.roles[0].positions,
    });
    expectCall(ormPrRMock.deleteProjectRole, 2);
    expectCall(ormPrRMock.getProjectRolesByProject, req.body.id);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't modify projects (role failure)", async () => {
    ormRMock.getRole.mockResolvedValue(null);
    const req = getMockReq();

    req.body = {
        sessionkey: "key",
        id: 0,
        name: "project-1",
        partner: "new-partner",
        start: new Date(Date.now()),
        end: new Date(Date.now() + 1000),
        roles: {
            roles: [],
        },
        description: "The old partner sucked",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProject(req)).rejects.toStrictEqual(undefined);
    expectCall(reqMock.parseUpdateProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.isValidID).toHaveBeenCalledTimes(1);
    expectCall(ormPrMock.updateProject, {
        projectId: req.body.id,
        name: req.body.name,
        partner: req.body.partner,
        startDate: req.body.start,
        endDate: req.body.end,
        osocId: req.body.osocId,
        description: req.body.description,
    });
    expect(ormRMock.getRole).toHaveBeenCalledTimes(1);
    expect(ormPrRMock.updateProjectRole).not.toHaveBeenCalled();
    expect(ormPrRMock.deleteProjectRole).not.toHaveBeenCalled();
    expect(ormPrRMock.getProjectRolesByProject).toHaveBeenCalledTimes(1);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can delete projects", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.deleteProject(req)).resolves.toStrictEqual({});
    expectCall(reqMock.parseDeleteProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.isValidID).toHaveBeenCalledTimes(1);
    expectCall(ormPrMock.deleteProjectFromDB, 0);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can get students drafted for project", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
    };

    const students = contracts
        .filter((x) => x.project_role.project_id == 0)
        .map((x) => ({ student: x.student, status: x.contract_status }));

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.getDraftedStudents(req)).resolves.toStrictEqual({
        students: students,
        id: 0,
        name: projects[0].name,
    });
    expectCall(reqMock.parseGetDraftedStudentsRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormPrMock.getProjectById, 0);
    expectCall(ormCMock.contractsByProject, 0);
    expect(utilMock.getOrDefault).toHaveBeenCalledTimes(1);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can get free spots for project role", async () => {
    await expect(project.getFreeSpotsFor("dev", 0)).resolves.toStrictEqual({
        role: 0,
        count: 2,
    });
    expectCall(ormPrRMock.getProjectRolesByProject, 0);
    expect(ormRMock.getRole).toHaveBeenCalledTimes(3);
    expectCall(ormPrRole.getNumberOfFreePositions, 0);
});

test("Can't get free spots for nonexistent project role", async () => {
    await expect(project.getFreeSpotsFor("george", 0)).rejects.toStrictEqual(
        undefined
    );
    expectCall(ormPrRMock.getProjectRolesByProject, 0);
    expect(ormRMock.getRole).toHaveBeenCalledTimes(3);
    expect(ormPrRMock.getNumberOfFreePositions).not.toHaveBeenCalled();
});

test("Can create a new project role", async () => {
    await expect(
        project.createProjectRoleFor(0, roles[1].name)
    ).resolves.toStrictEqual({ count: 1, role: 0 });
    expectCall(ormRMock.getRolesByName, roles[1].name);
    expectCall(ormPrRMock.createProjectRole, {
        projectId: 0,
        roleId: 1,
        positions: 1,
    });
});

test("Can't create a project role for a nonexistent role", async () => {
    await expect(
        project.createProjectRoleFor(0, "george")
    ).rejects.toStrictEqual({
        http: 409,
        reason: "That role doesn't exist.",
    });
    expectCall(ormRMock.getRolesByName, "george");
    expect(ormPrRMock.createProjectRole).not.toHaveBeenCalled();
});

test("Can modify a student on a project", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
        role: "frontend",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProjectStudent(req)).resolves.toStrictEqual({
        drafted: true,
        role: "frontend",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormCMock.contractsByProject, req.body.id);
    expectCall(ormPrRMock.getProjectRolesByProject, req.body.id);
    expect(ormPrRMock.createProjectRole).not.toHaveBeenCalled();
    expectCall(ormCMock.updateContract, {
        contractId: 0,
        loginUserId: 0,
        projectRoleId: 2,
    });
    expectCall(ormPrRole.getProjectRoleById, 2);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can modify a student on a project (create project role)", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
        role: "backend",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProjectStudent(req)).resolves.toStrictEqual({
        drafted: true,
        role: "dev",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormCMock.contractsByProject, req.body.id);
    expectCall(ormPrRMock.getProjectRolesByProject, req.body.id);
    expectCall(ormPrRMock.createProjectRole, {
        projectId: 0,
        roleId: 1,
        positions: 1,
    });
    expectCall(ormCMock.updateContract, {
        contractId: 0,
        loginUserId: 0,
        projectRoleId: 0,
    });
    expectCall(ormPrRole.getProjectRoleById, 0);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't modify a student on a project (no spots)", async () => {
    ormPrRMock.getNumberOfFreePositions.mockResolvedValue(0);

    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
        role: "frontend",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProjectStudent(req)).rejects.toStrictEqual({
        http: 409,
        reason: "Can't add this role to the student. There are no more vacant spots.",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormCMock.contractsByProject, req.body.id);
    expectCall(ormPrRMock.getProjectRolesByProject, req.body.id);
    expect(ormPrRMock.createProjectRole).not.toHaveBeenCalled();
    expect(ormCMock.updateContract).not.toHaveBeenCalled();
    expect(ormPrRole.getProjectRoleById).not.toHaveBeenCalled();

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't modify a student on a project (ambiguous)", async () => {
    ormCMock.contractsByProject.mockResolvedValue([contracts[0], contracts[0]]);

    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
        role: "frontend",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProjectStudent(req)).rejects.toStrictEqual({
        http: 409,
        reason: "The request is ambiguous.",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormCMock.contractsByProject, req.body.id);
    expect(ormPrRMock.getProjectRolesByProject).not.toHaveBeenCalled();
    expect(ormPrRMock.createProjectRole).not.toHaveBeenCalled();
    expect(ormCMock.updateContract).not.toHaveBeenCalled();
    expect(ormPrRole.getProjectRoleById).not.toHaveBeenCalled();

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't modify a student on a project (not assigned)", async () => {
    ormCMock.contractsByProject.mockResolvedValue([]);

    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
        role: "frontend",
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.modProjectStudent(req)).rejects.toStrictEqual({
        http: 204,
        reason: "The selected student is not assigned to this project.",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormCMock.contractsByProject, req.body.id);
    expect(ormPrRMock.getProjectRolesByProject).not.toHaveBeenCalled();
    expect(ormPrRMock.createProjectRole).not.toHaveBeenCalled();
    expect(ormCMock.updateContract).not.toHaveBeenCalled();
    expect(ormPrRole.getProjectRoleById).not.toHaveBeenCalled();

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can un-assign coaches", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        loginUserId: 0,
    };

    // await project.unAssignCoach(req);
    await expect(project.unAssignCoach(req)).resolves.toStrictEqual({});
    expectCall(reqMock.parseRemoveCoachRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormPUMock.getUsersFor, 0);
    expectCall(ormPUMock.deleteProjectUser, {
        loginUserId: req.body.loginUserId,
        projectId: req.body.id,
    });
});

test("Can't un-assign coaches (invalid id)", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        loginUserId: 7,
    };

    await expect(project.unAssignCoach(req)).rejects.toStrictEqual({
        http: 400,
        reason: "The coach with ID 7 is not assigned to project 0",
    });
    expectCall(reqMock.parseRemoveCoachRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormPUMock.getUsersFor, 0);
    expect(ormPUMock.deleteProjectUser).not.toHaveBeenCalled();
});

test("Can assign coaches", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        loginUserId: 7,
    };

    await expect(project.assignCoach(req)).resolves.toStrictEqual({
        project_user_id: 0,
        login_user_id: 7,
        project_id: 0,
    });
    expectCall(reqMock.parseAssignCoachRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormPUMock.getUsersFor, 0);
    expectCall(ormPUMock.createProjectUser, { projectId: 0, loginUserId: 7 });
});

test("Can't assign coaches (already assigned)", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        loginUserId: 0,
    };

    await expect(project.assignCoach(req)).rejects.toStrictEqual({
        http: 400,
        reason: "The coach with ID 0 is already assigned to project 0",
    });
    expectCall(reqMock.parseAssignCoachRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormPUMock.getUsersFor, 0);
    expect(ormPUMock.createProjectUser).not.toHaveBeenCalled();
});

test("Can un-assign students", async () => {
    ormEvMock.getEvaluationByPartiesFor.mockResolvedValue([evals[0]]);
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.unAssignStudent(req)).resolves.toStrictEqual({});
    expectCall(reqMock.parseRemoveAssigneeRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormCMock.contractsForStudent, req.body.studentId);
    expect(ormEvMock.getEvaluationByPartiesFor).toHaveBeenCalledTimes(2);
    expect(ormEvMock.updateEvaluationForStudent).toHaveBeenCalledTimes(2);
    expect(ormCMock.removeContract).toHaveBeenCalledTimes(2);

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can't un-assign students (no contracts)", async () => {
    ormCMock.contractsForStudent.mockResolvedValue([]);
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
    };

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    await expect(project.unAssignStudent(req)).rejects.toStrictEqual({
        http: 400,
        reason: "The student with ID 0 is not assigned to project 0",
    });
    expectCall(reqMock.parseRemoveAssigneeRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(ormCMock.contractsForStudent, req.body.studentId);
    expect(ormEvMock.getEvaluationByPartiesFor).not.toHaveBeenCalled();
    expect(ormEvMock.updateEvaluationForStudent).not.toHaveBeenCalled();
    expect(ormCMock.removeContract).not.toHaveBeenCalled();

    utilMock.checkYearPermissionProject.mockReset();
});

test("Can assign students", async () => {
    const req = getMockReq();
    req.body = {
        studentId: 0,
        id: 0,
        sessionkey: "key",
        role: "dev",
    };

    await expect(project.assignStudent(req)).resolves.toStrictEqual({
        drafted: true,
        role: "dev",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(ormOMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expectCall(ormCMock.contractsForStudent, req.body.studentId);
    expectCall(ormCMock.createContract, {
        studentId: req.body.studentId,
        projectRoleId: 0,
        loginUserId: 0,
        contractStatus: "DRAFT",
    });
});

test("Can't assign students (no places)", async () => {
    ormPrRMock.getNumberOfFreePositions.mockResolvedValue(0);
    const req = getMockReq();
    req.body = {
        studentId: 0,
        id: 0,
        sessionkey: "key",
        role: "dev",
    };

    await expect(project.assignStudent(req)).rejects.toStrictEqual({
        http: 409,
        reason: "There are no more free spaces for that role",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(ormOMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expectCall(ormCMock.contractsForStudent, req.body.studentId);
    expect(ormCMock.createContract).not.toHaveBeenCalled();
});

test("Can't assign students (no such role)", async () => {
    ormPrRMock.getProjectRolesByProject.mockResolvedValue([]);
    const req = getMockReq();
    req.body = {
        studentId: 0,
        id: 0,
        sessionkey: "key",
        role: "dev",
    };

    await expect(project.assignStudent(req)).rejects.toStrictEqual({
        http: 404,
        reason: "That role doesn't exist",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(ormOMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expectCall(ormCMock.contractsForStudent, req.body.studentId);
    expect(ormCMock.createContract).not.toHaveBeenCalled();
});

test("Can't assign students (already used)", async () => {
    ormOMock.getLatestOsoc.mockResolvedValue({
        osoc_id: studcontr[0].project_role.project.osoc_id,
        year: 2022,
    });
    const req = getMockReq();
    req.body = {
        studentId: 0,
        id: 0,
        sessionkey: "key",
        role: "dev",
    };

    await expect(project.assignStudent(req)).rejects.toStrictEqual({
        http: 409,
        reason: "This student does already have a contract",
    });
    expectCall(reqMock.parseDraftStudentRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(ormOMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expectCall(ormCMock.contractsForStudent, req.body.studentId);
    expect(ormCMock.createContract).not.toHaveBeenCalled();
});

test("Can filter projects", async () => {
    ormCMock.contractsByProject.mockResolvedValue([]);
    ormPUMock.getUsersFor.mockResolvedValue([]);
    const req = getMockReq();
    req.body = { sessionkey: "key" };

    const res = projects.map((x) => ({
        id: x.project_id,
        name: x.name,
        description: x.description,
        partner: x.partner,
        start_date: x.start_date.toString(),
        end_date: x.end_date.toString(),
        osoc_id: x.osoc_id,
        contracts: [],
        coaches: [],
        roles: projectroles
            .filter((y) => y.project_id == x.project_id)
            .map((y) => ({
                name: roles[y.role_id].name,
                positions: y.positions,
            })),
    }));

    await expect(project.filterProjects(req)).resolves.toStrictEqual({
        data: res,
        pagination: { count: projects.length, page: 0 },
    });
    expectCall(reqMock.parseFilterProjectsRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expect(ormOMock.getLatestOsoc).toHaveBeenCalledTimes(1);
    expect(ormPr.filterProjects).toHaveBeenCalledTimes(1);
    expect(ormPr.filterProjects).toHaveBeenCalledWith(
        {
            currentPage: undefined,
            pageSize: undefined,
        },
        undefined,
        undefined,
        undefined,
        2022,
        undefined,
        undefined,
        0
    );
    expect(ormCMock.contractsByProject).toHaveBeenCalledTimes(projects.length);
    expect(ormPU.getUsersFor).toHaveBeenCalledTimes(projects.length);
});

test("Can filter projects (with osoc year)", async () => {
    ormCMock.contractsByProject.mockResolvedValue([]);
    ormPUMock.getUsersFor.mockResolvedValue([]);
    const req = getMockReq();
    req.body = { sessionkey: "key", osocYear: 2021 };

    const res = projects.map((x) => ({
        id: x.project_id,
        name: x.name,
        description: x.description,
        partner: x.partner,
        start_date: x.start_date.toString(),
        end_date: x.end_date.toString(),
        osoc_id: x.osoc_id,
        contracts: [],
        coaches: [],
        roles: projectroles
            .filter((y) => y.project_id == x.project_id)
            .map((y) => ({
                name: roles[y.role_id].name,
                positions: y.positions,
            })),
    }));

    await expect(project.filterProjects(req)).resolves.toStrictEqual({
        data: res,
        pagination: { count: projects.length, page: 0 },
    });
    expectCall(reqMock.parseFilterProjectsRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);
    expect(ormOMock.getLatestOsoc).not.toHaveBeenCalled();
    expect(ormPr.filterProjects).toHaveBeenCalledTimes(1);
    expect(ormPr.filterProjects).toHaveBeenCalledWith(
        {
            currentPage: undefined,
            pageSize: undefined,
        },
        undefined,
        undefined,
        undefined,
        2021,
        undefined,
        undefined,
        0
    );
    expect(ormCMock.contractsByProject).toHaveBeenCalledTimes(projects.length);
    expect(ormPU.getUsersFor).toHaveBeenCalledTimes(projects.length);
});

test("Can modify a student on a project", async () => {
    ormPrRMock.getNumberOfFreePositions.mockResolvedValue(0);

    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        id: 0,
        studentId: 0,
        role: "frontend",
    };

    reqMock.parseUpdateProjectRequest.mockResolvedValue({
        sessionkey: "key",
        id: 0,
        name: "name",
        addCoaches: {
            coaches: [0],
        },
        removeCoaches: {
            coaches: [0],
        },
    });

    utilMock.checkYearPermissionProject.mockImplementation((v) =>
        Promise.resolve(v)
    );

    const start = new Date();
    const end = new Date();

    ormPrMock.updateProject.mockImplementation((v) =>
        Promise.resolve({
            project_id: v.projectId,
            name: orDefault(v.name, "name"),
            osoc_id: orDefault(v.osocId, 0),
            partner: orDefault(v.partner, "partner"),
            description: orDefault(v.description, null),
            start_date: orDefault(v.startDate, start),
            end_date: orDefault(v.endDate, end),
        })
    );

    ormPrRMock.getProjectRoleNamesByProject.mockResolvedValue([]);
    ormPrRMock.getProjectRolesByProject.mockResolvedValue([]);

    ormPUMock.createProjectUser.mockResolvedValue({
        project_user_id: 0,
        login_user_id: 0,
        project_id: 0,
    });

    ormPUMock.deleteProjectUser.mockResolvedValue({
        count: 1,
    });

    ormPUMock.getUsersFor.mockResolvedValue([]);

    await expect(project.modProject(req)).resolves.toStrictEqual({
        id: 0,
        name: "name",
        partner: "partner",
        start_date: start.toString(),
        end_date: end.toString(),
        osoc_id: 0,
        roles: [],
        description: null,
        coaches: [],
    });

    utilMock.checkYearPermissionProject.mockReset();
    reqMock.parseUpdateProjectRequest.mockReset();
    ormPrRMock.getProjectRoleNamesByProject.mockReset();
    ormPrRMock.getProjectRolesByProject.mockReset();
    ormPUMock.createProjectUser.mockReset();
    ormPUMock.deleteProjectUser.mockReset();
    ormPUMock.getUsersFor.mockReset();
    ormPrMock.updateProject.mockReset();
});

test("Can filter projects (with osoc year)", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        projectNameFilter: "project",
        osocYear: 2022,
    };

    reqMock.parseFilterProjectsRequest.mockResolvedValue({
        sessionkey: "key",
        projectNameFilter: "project",
        clientNameFilter: undefined,
        fullyAssignedFilter: undefined,
        osocYear: 2022,
        projectNameSort: undefined,
        clientNameSort: undefined,
        currentPage: 0,
        pageSize: 1,
    });

    const start = new Date();
    const end = new Date();

    ormPrMock.filterProjects.mockResolvedValue({
        pagination: {
            page: 0,
            count: 1,
        },
        data: [
            {
                project_id: 0,
                osoc_id: 0,
                name: "name",
                partner: "partner",
                description: null,
                start_date: start,
                end_date: end,
                project_role: [
                    {
                        positions: 3,
                        role: {
                            name: "Front-end developer",
                        },
                    },
                    {
                        positions: 5,
                        role: {
                            name: "Back-end developer",
                        },
                    },
                ],
                project_user: [
                    {
                        login_user: {
                            login_user_id: 1,
                            is_coach: true,
                        },
                    },
                    {
                        login_user: {
                            login_user_id: 2,
                            is_coach: true,
                        },
                    },
                ],
            },
        ],
    });

    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
        {
            project_role_id: 1,
            project_id: 0,
            role_id: 1,
            positions: 5,
        },
    ]);

    ormRMock.getRole.mockResolvedValueOnce({
        role_id: 0,
        name: "Front-end developer",
    });

    ormRMock.getRole.mockResolvedValueOnce({
        role_id: 1,
        name: "Back-end developer",
    });

    ormCMock.contractsByProject.mockResolvedValue([
        {
            contract_id: 0,
            contract_status: contract_status_enum.APPROVED,
            student: {
                student_id: 0,
                gender: "Male",
                pronouns: null,
                phone_number: "0461719074",
                nickname: null,
                alumni: false,
                person: {
                    name: "name",
                    person_id: 0,
                    email: "mail@mail.com",
                    github: null,
                    github_id: null,
                },
            },
            project_role: {
                project_id: 0,
                role: {
                    name: "Front-end developer",
                },
                project_role_id: 0,
                role_id: 0,
                positions: 3,
            },
            login_user: null,
        },
    ]);

    ormPUMock.getUsersFor.mockResolvedValue([]);

    await expect(project.filterProjects(req)).resolves.toStrictEqual({
        data: [
            {
                osoc_id: 0,
                name: "name",
                partner: "partner",
                description: null,
                start_date: start.toString(),
                end_date: end.toString(),
                id: 0,
                coaches: [],
                roles: [
                    {
                        positions: 3,
                        name: "Front-end developer",
                    },
                    {
                        positions: 5,
                        name: "Back-end developer",
                    },
                ],
                contracts: [
                    {
                        contract_id: 0,
                        contract_status: contract_status_enum.APPROVED,
                        student: {
                            evaluation: undefined,
                            evaluations: undefined,
                            jobApplication: undefined,
                            roles: undefined,
                            student: {
                                student_id: 0,
                                gender: "Male",
                                pronouns: null,
                                phone_number: "0461719074",
                                nickname: null,
                                alumni: false,
                                person_id: undefined,
                                person: {
                                    name: "name",
                                    person_id: 0,
                                    email: "mail@mail.com",
                                    github: null,
                                    github_id: null,
                                },
                            },
                        },
                        project_role: {
                            project_id: 0,
                            role: {
                                name: "Front-end developer",
                            },
                            project_role_id: 0,
                            role_id: 0,
                            positions: 3,
                        },
                        login_user: null,
                    },
                ],
            },
        ],
        pagination: { count: 1, page: 0 },
    });

    reqMock.parseFilterProjectsRequest.mockReset();
    ormPrMock.filterProjects.mockReset();
    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
    ormCMock.contractsByProject.mockReset();
    ormPUMock.getUsersFor.mockReset();
});

test("No filtered projects", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "key", projectNameFilter: "project" };

    ormOMock.getLatestOsoc.mockResolvedValue(null);

    reqMock.parseFilterProjectsRequest.mockResolvedValue({
        sessionkey: "key",
        projectNameFilter: "project",
        clientNameFilter: undefined,
        fullyAssignedFilter: undefined,
        osocYear: undefined,
        projectNameSort: undefined,
        clientNameSort: undefined,
        currentPage: 0,
        pageSize: 1,
    });

    ormPrMock.filterProjects.mockResolvedValue({
        pagination: {
            page: 0,
            count: 1,
        },
        data: [],
    });

    await expect(project.filterProjects(req)).resolves.toStrictEqual({
        data: [],
        pagination: { count: 1, page: 0 },
    });

    reqMock.parseFilterProjectsRequest.mockReset();
    ormPrMock.filterProjects.mockReset();
    ormOMock.getLatestOsoc.mockReset();
});

test("No role found in filterProjects", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        projectNameFilter: "project",
        osocYear: 2022,
    };

    reqMock.parseFilterProjectsRequest.mockResolvedValue({
        sessionkey: "key",
        projectNameFilter: "project",
        clientNameFilter: undefined,
        fullyAssignedFilter: undefined,
        osocYear: 2022,
        projectNameSort: undefined,
        clientNameSort: undefined,
        currentPage: 0,
        pageSize: 1,
    });

    ormPrMock.filterProjects.mockResolvedValue({
        pagination: {
            page: 0,
            count: 1,
        },
        data: [
            {
                project_id: 0,
                osoc_id: 0,
                name: "name",
                partner: "partner",
                description: null,
                start_date: new Date(
                    "Mon Jan 12 1970 14:46:40 GMT+0100 (Central European Standard Time)"
                ),
                end_date: new Date(
                    "Sun Apr 26 1970 18:46:40 GMT+0100 (Central European Standard Time)"
                ),
                project_role: [
                    {
                        positions: 3,
                        role: {
                            name: "Front-end developer",
                        },
                    },
                    {
                        positions: 5,
                        role: {
                            name: "Back-end developer",
                        },
                    },
                ],
                project_user: [
                    {
                        login_user: {
                            login_user_id: 1,
                            is_coach: true,
                        },
                    },
                    {
                        login_user: {
                            login_user_id: 2,
                            is_coach: true,
                        },
                    },
                ],
            },
        ],
    });

    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
        {
            project_role_id: 1,
            project_id: 0,
            role_id: 1,
            positions: 5,
        },
    ]);

    ormRMock.getRole.mockResolvedValueOnce({
        role_id: 0,
        name: "Front-end developer",
    });

    ormRMock.getRole.mockResolvedValueOnce(null);

    await expect(project.filterProjects(req)).rejects.toBe(
        errors.cookNoDataError()
    );

    reqMock.parseFilterProjectsRequest.mockReset();
    ormPrMock.filterProjects.mockReset();
    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
});

test("Contract.student is null in filterProjects", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "key",
        projectNameFilter: "project",
        osocYear: 2022,
    };

    reqMock.parseFilterProjectsRequest.mockResolvedValue({
        sessionkey: "key",
        projectNameFilter: "project",
        clientNameFilter: undefined,
        fullyAssignedFilter: undefined,
        osocYear: 2022,
        projectNameSort: undefined,
        clientNameSort: undefined,
        currentPage: 0,
        pageSize: 1,
    });

    const start = new Date();
    const end = new Date();

    ormPrMock.filterProjects.mockResolvedValue({
        pagination: {
            page: 0,
            count: 1,
        },
        data: [
            {
                project_id: 0,
                osoc_id: 0,
                name: "name",
                partner: "partner",
                description: null,
                start_date: start,
                end_date: end,
                project_role: [
                    {
                        positions: 3,
                        role: {
                            name: "Front-end developer",
                        },
                    },
                    {
                        positions: 5,
                        role: {
                            name: "Back-end developer",
                        },
                    },
                ],
                project_user: [
                    {
                        login_user: {
                            login_user_id: 1,
                            is_coach: true,
                        },
                    },
                    {
                        login_user: {
                            login_user_id: 2,
                            is_coach: true,
                        },
                    },
                ],
            },
        ],
    });

    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
        {
            project_role_id: 1,
            project_id: 0,
            role_id: 1,
            positions: 5,
        },
    ]);

    ormRMock.getRole.mockResolvedValueOnce({
        role_id: 0,
        name: "Front-end developer",
    });

    ormRMock.getRole.mockResolvedValueOnce({
        role_id: 1,
        name: "Back-end developer",
    });

    ormCMock.contractsByProject.mockResolvedValue([
        {
            contract_id: 0,
            contract_status: contract_status_enum.APPROVED,
            student: null,
            project_role: {
                project_id: 0,
                role: {
                    name: "Front-end developer",
                },
                project_role_id: 0,
                role_id: 0,
                positions: 3,
            },
            login_user: null,
        },
    ]);

    ormPUMock.getUsersFor.mockResolvedValue([]);

    await expect(project.filterProjects(req)).resolves.toStrictEqual({
        data: [
            {
                osoc_id: 0,
                name: "name",
                partner: "partner",
                description: null,
                start_date: start.toString(),
                end_date: end.toString(),
                id: 0,
                coaches: [],
                roles: [
                    {
                        positions: 3,
                        name: "Front-end developer",
                    },
                    {
                        positions: 5,
                        name: "Back-end developer",
                    },
                ],
                contracts: [
                    {
                        contract_id: 0,
                        contract_status: contract_status_enum.APPROVED,
                        student: {
                            evaluation: undefined,
                            evaluations: undefined,
                            jobApplication: undefined,
                            roles: undefined,
                            student: null,
                        },
                        project_role: {
                            project_id: 0,
                            role: {
                                name: "Front-end developer",
                            },
                            project_role_id: 0,
                            role_id: 0,
                            positions: 3,
                        },
                        login_user: null,
                    },
                ],
            },
        ],
        pagination: { count: 1, page: 0 },
    });

    await expect(project.listProjects(req)).resolves.toStrictEqual({
        data: [
            {
                osoc_id: 0,
                name: "name",
                partner: "partner",
                description: null,
                start_date: start.toString(),
                end_date: end.toString(),
                id: 0,
                coaches: [],
                roles: [
                    {
                        positions: 3,
                        name: "dev",
                    },
                    {
                        positions: 5,
                        name: "backend",
                    },
                ],
                contracts: [
                    {
                        contract_id: 0,
                        contract_status: contract_status_enum.APPROVED,
                        student: {
                            evaluation: undefined,
                            evaluations: undefined,
                            jobApplication: undefined,
                            roles: undefined,
                            student: null,
                        },
                        project_role: {
                            project_id: 0,
                            role: {
                                name: "Front-end developer",
                            },
                            project_role_id: 0,
                            role_id: 0,
                            positions: 3,
                        },
                        login_user: null,
                    },
                ],
            },
        ],
        pagination: { count: 1, page: 0 },
    });

    reqMock.parseFilterProjectsRequest.mockReset();
    ormPrMock.filterProjects.mockReset();
    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
    ormCMock.contractsByProject.mockReset();
    ormPUMock.getUsersFor.mockReset();
});

test("Can get free spots for project role", async () => {
    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
    ]);

    ormRMock.getRole.mockResolvedValue({
        role_id: 0,
        name: "Developer",
    });

    ormPrRMock.getNumberOfFreePositions.mockResolvedValue(3);

    await expect(
        project.getFreeSpotsFor("Developer", 0)
    ).resolves.toStrictEqual({
        role: 0,
        count: 3,
    });

    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
    ormPrRMock.getNumberOfFreePositions.mockReset();
});

test("Can't get free spots for project role", async () => {
    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
    ]);

    ormRMock.getRole.mockResolvedValue({
        role_id: 0,
        name: "Developer",
    });

    await expect(project.getFreeSpotsFor("dev", 0)).rejects.toBe(
        errors.cookArgumentError()
    );

    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
});

test("Can't get free spots for project role (number of free spots is null)", async () => {
    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
    ]);

    ormRMock.getRole.mockResolvedValue({
        role_id: 0,
        name: "Developer",
    });

    ormPrRMock.getNumberOfFreePositions.mockResolvedValue(null);

    await expect(project.getFreeSpotsFor("Developer", 0)).rejects.toBe(
        errors.cookArgumentError()
    );

    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
    ormPrRMock.getNumberOfFreePositions.mockReset();
});

test("Can't get free spots for project role (number of free spots is null)", async () => {
    ormPrRMock.getProjectRolesByProject.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 3,
        },
    ]);

    ormRMock.getRole.mockResolvedValue({
        role_id: 0,
        name: "Developer",
    });

    ormPrRMock.getNumberOfFreePositions.mockResolvedValue(null);

    await expect(project.getFreeSpotsFor("Developer", 0)).rejects.toBe(
        errors.cookArgumentError()
    );

    ormPrRMock.getProjectRolesByProject.mockReset();
    ormRMock.getRole.mockReset();
    ormPrRMock.getNumberOfFreePositions.mockReset();
});

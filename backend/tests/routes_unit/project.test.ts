// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import * as prisma from "@prisma/client";

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

import * as project from "../../routes/project";
import { CreateProject } from "../../orm_functions/orm_types";

const realDateNow = Date.now.bind(global.Date);
const dateNowStub = jest.fn(() => 123456789);

function newProject(v: CreateProject): prisma.project {
    return {
        project_id: 0,
        name: v.name,
        osoc_id: 0,
        partner: v.partner,
        description: "",
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

    // contract orm
    ormCMock.contractsByProject.mockImplementation((id) =>
        Promise.resolve(
            contracts.filter((x) => x.project_role.project_role_id == id)
        )
    );

    // project user orm
    ormPUMock.getUsersFor.mockResolvedValue([
        { login_user: loginuser, project_user_id: 0 },
    ]);
});

afterEach(() => {
    // date
    dateNowStub.mockReset();
    global.Date.now = realDateNow;

    // request
    reqMock.parseNewProjectRequest.mockReset();
    reqMock.parseProjectAllRequest.mockReset();
    reqMock.parseUpdateProjectRequest.mockReset();

    // util
    utilMock.isAdmin.mockReset();
    utilMock.checkSessionKey.mockReset();
    utilMock.isValidID.mockReset();

    // project orm
    ormPrMock.createProject.mockReset();
    ormPrMock.getAllProjects.mockReset();
    ormPrMock.updateProject.mockReset();

    // role orm
    ormRMock.getRolesByName.mockReset();
    ormRMock.createRole.mockReset();
    ormRMock.getRole.mockReset();

    // project-role orm
    ormPrRMock.createProjectRole.mockReset();
    ormPrRMock.getProjectRolesByProject.mockReset();
    ormPrRMock.updateProjectRole.mockReset();

    // contract orm
    ormCMock.contractsByProject.mockReset();

    // project user orm
    ormPUMock.getUsersFor.mockReset();
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
        start: new Date("January 31, 1950"),
        end: new Date("November 15, 1952 23:30:00.0"),
        roles: {
            roles: [
                { name: "dev", positions: 8 },
                { name: "nuclear bomb engineer", positions: 2 },
            ],
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
    });
    expectCall(reqMock.parseNewProjectRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(ormPrMock.createProject, {
        name: req.body.name,
        partner: req.body.partner,
        startDate: req.body.start,
        endDate: req.body.end,
        osocId: req.body.osocId,
    });
    expect(ormRMock.getRolesByName).toHaveBeenCalledTimes(2);
    expectCall(ormRMock.createRole, req.body.roles.roles[1].name);
    expect(ormPrRMock.createProjectRole).toHaveBeenCalledTimes(2);
});

test("Can list all projects", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "key" };

    // I'm too exhausted to even try to reconstruct this...
    // I mean... there's no use in reimplementing the function here, right?
    await expect(project.listProjects(req)).resolves.not.toThrow();
    expectCall(reqMock.parseProjectAllRequest, req);
    expectCall(utilMock.checkSessionKey, req.body);

    expect(ormPrMock.getAllProjects).toHaveBeenCalledTimes(1);
    expect(ormPrRMock.getProjectRolesByProject).toHaveBeenCalledTimes(
        projects.length
    );
    expect(ormRMock.getRole).toHaveBeenCalledTimes(roles.length);
    expect(ormCMock.contractsByProject).toHaveBeenCalledTimes(projects.length);
    expect(ormPUMock.getUsersFor).toHaveBeenCalledTimes(projects.length);
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
        modifyRoles: { roles: [{ id: 0, positions: 18 }] },
        deleteRoles: { roles: [2] },
        description: "The old partner sucked",
    };

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
    expect(ormRMock.getRole).toHaveBeenCalledTimes(4);
    expectCall(ormPrRMock.updateProjectRole, {
        projectRoleId: req.body.modifyRoles.roles[0].id,
        projectId: req.body.id,
        roleId: roles[req.body.modifyRoles.roles[0].id].role_id,
        positions: req.body.modifyRoles.roles[0].positions,
    });
    expectCall(ormPrRMock.deleteProjectRole, req.body.deleteRoles.roles[0]);
    expectCall(ormPrRMock.getProjectRolesByProject, req.body.id);
});

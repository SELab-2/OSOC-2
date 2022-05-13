import { prismaMock } from "./singleton";
import {
    FilterProjects,
    UpdateProject,
    CreateProject,
} from "../../orm_functions/orm_types";
import {
    createProject,
    getProjectByName,
    getAllProjects,
    getProjectsByOsocEdition,
    getProjectsByPartner,
    getProjectsStartedAfterDate,
    getProjectsByStartDate,
    getProjectsStartedBeforeDate,
    getProjectsByEndDate,
    getProjectsEndedBeforeDate,
    getProjectsEndedAfterDate,
    getProjectsByNumberPositions,
    getProjectsLessPositions,
    getProjectsMorePositions,
    deleteProject,
    updateProject,
    deleteProjectByOsocEdition,
    deleteProjectByPartner,
    getProjectById,
    filterProjects,
} from "../../orm_functions/project";
import { account_status_enum } from "@prisma/client";

const user_return = {
    session_id: "50",
    login_user_id: 1,
    person_id: 0,
    password: "password",
    is_admin: false,
    is_coach: false,
    session_keys: ["key1", "key2"],
    account_status: account_status_enum.DISABLED,
    login_user_osoc: [
        {
            osoc: {
                year: 2022,
            },
        },
    ],
};

const returnValue = {
    project_id: 0,
    name: "Test project",
    osoc_id: 0,
    partner: "Best partner",
    start_date: new Date("2022-07-13"),
    end_date: new Date("2022-08-31"),
    positions: 10,
    description: "",
};

const filteredProject1: FilterProjects = {
    project_id: 1,
    name: "project 1",
    osoc_id: 1,
    partner: "partner 1",
    start_date: new Date("2022-08-13"),
    end_date: new Date("2022-08-15"),
    positions: 8,
    description: "description 1",
    project_role: [
        {
            positions: 3,
            role: {
                name: "Front-end developer",
            },
            _count: {
                contract: 3,
            },
        },
        {
            positions: 5,
            role: {
                name: "Back-end developer",
            },
            _count: {
                contract: 5,
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
};

const filteredProject2: FilterProjects = {
    project_id: 2,
    name: "project 2",
    osoc_id: 1,
    partner: "partner 2",
    start_date: new Date("2022-08-17"),
    end_date: new Date("2022-08-29"),
    positions: 9,
    description: "description 1",
    project_role: [
        {
            positions: 2,
            role: {
                name: "Front-end developer",
            },
            _count: {
                contract: 1,
            },
        },
        {
            positions: 7,
            role: {
                name: "Back-end developer",
            },
            _count: {
                contract: 0,
            },
        },
    ],
    project_user: [
        {
            login_user: {
                login_user_id: 3,
                is_coach: true,
            },
        },
        {
            login_user: {
                login_user_id: 4,
                is_coach: true,
            },
        },
    ],
};

test("should create a project in the db with the given object, returns the new record", async () => {
    const project: CreateProject = {
        name: "Test project",
        osocId: 0,
        partner: "Best partner",
        startDate: new Date("2022-07-13"),
        endDate: new Date("2022-08-31"),
        positions: 10,
    };

    prismaMock.project.create.mockResolvedValue(returnValue);
    await expect(createProject(project)).resolves.toEqual(returnValue);
});

test("should return all projects in the db", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getAllProjects()).resolves.toEqual([returnValue]);
});

test("should return the project with the given project id", async () => {
    prismaMock.project.findUnique.mockResolvedValue(returnValue);
    await expect(getProjectById(0)).resolves.toEqual(returnValue);
});

test("should return all the projects with the given name", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectByName("Test project")).resolves.toEqual([
        returnValue,
    ]);
});

test("should return all the projects with the given osoc edition", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectsByOsocEdition(0)).resolves.toEqual([returnValue]);
});

test("should return all the project with the given partner name", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectsByPartner("Best partner")).resolves.toEqual([
        returnValue,
    ]);
});

test("should return all the project with the given start date", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(
        getProjectsByStartDate(new Date("2022-07-13"))
    ).resolves.toEqual([returnValue]);
});

test("should return all the project that started after the given start date", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(
        getProjectsStartedAfterDate(new Date("2022-01-01"))
    ).resolves.toEqual([returnValue]);
});

test("should return all the project that started before the given start date", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(
        getProjectsStartedBeforeDate(new Date("2023-01-01"))
    ).resolves.toEqual([returnValue]);
});

test("should return all the project with the given end date", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectsByEndDate(new Date("2022-08-31"))).resolves.toEqual(
        [returnValue]
    );
});

test("should return all the project that ended after the given end date", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(
        getProjectsEndedAfterDate(new Date("2022-01-01"))
    ).resolves.toEqual([returnValue]);
});

test("should return all the project that ended before the given end date", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(
        getProjectsEndedBeforeDate(new Date("2023-01-01"))
    ).resolves.toEqual([returnValue]);
});

test("should return all the projects with the given number of positions", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectsByNumberPositions(10)).resolves.toEqual([
        returnValue,
    ]);
});

test("should return all the projects with less positions", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectsLessPositions(20)).resolves.toEqual([returnValue]);
});

test("should return all the projects with more positions", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getProjectsMorePositions(5)).resolves.toEqual([returnValue]);
});

test("should update the project with the new data and return the updated record", async () => {
    const project: UpdateProject = {
        projectId: 0,
        name: "Different project",
        osocId: 0,
        partner: "UGent",
        startDate: new Date("2022-06-05"),
        endDate: new Date("2022-09-16"),
        positions: 7,
    };

    prismaMock.project.update.mockResolvedValue(returnValue);
    await expect(updateProject(project)).resolves.toEqual(returnValue);
});

test("should delete the project with the given id and return the deleted record", async () => {
    prismaMock.project.delete.mockResolvedValue(returnValue);
    await expect(deleteProject(0)).resolves.toEqual(returnValue);
});

test("should delete all the projects with the given osoc id and return number of deleted records", async () => {
    const count = { count: 2 };
    prismaMock.project.deleteMany.mockResolvedValue(count);
    await expect(deleteProjectByOsocEdition(0)).resolves.toEqual(count);
});

test("should delete all the projects with the given partner name and return the number of deleted records", async () => {
    const count = { count: 2 };
    prismaMock.project.deleteMany.mockResolvedValue(count);
    await expect(deleteProjectByPartner("UGent")).resolves.toEqual(count);
});

test("should return all filtered projects by name", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(user_return);
    prismaMock.project.findMany.mockResolvedValue([filteredProject1]);
    await expect(
        filterProjects(
            { currentPage: 0, pageSize: 25 },
            "project 1",
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({
        data: [filteredProject1],
        pagination: { page: 0, count: 1 },
    });
});

test("should return all filtered projects by partner", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(user_return);
    prismaMock.project.findMany.mockResolvedValue([filteredProject1]);
    await expect(
        filterProjects(
            { currentPage: 0, pageSize: 25 },
            undefined,
            "partner 1",
            undefined,
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({
        data: [filteredProject1],
        pagination: { page: 0, count: 1 },
    });
});

test("should return all filtered projects by assigned coaches", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(user_return);
    prismaMock.project.findMany.mockResolvedValue([filteredProject1]);
    await expect(
        filterProjects(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            [1],
            undefined,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({
        data: [filteredProject1],
        pagination: { page: 0, count: 1 },
    });
});

test("should return all filtered projects by fully assigned status", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(user_return);
    prismaMock.project.findMany.mockResolvedValue([filteredProject1]);
    prismaMock.contract.findMany.mockResolvedValue([
        {
            contract_id: 1,
            student_id: 1,
            project_role_id: 1,
            information: "info",
            created_by_login_user_id: 1,
            contract_status: "APPROVED",
        },
    ]);
    await expect(
        filterProjects(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            undefined,
            true,
            undefined,
            undefined,
            0
        )
    ).resolves.toEqual({
        pagination: { count: 1, page: 0 },
        data: [filteredProject1],
    });
});

test("should return all filtered projects sorted by the fully assigned status", async () => {
    prismaMock.project.findMany.mockResolvedValue([
        filteredProject2,
        filteredProject1,
    ]);
    await expect(
        filterProjects(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "desc",
            0
        )
    ).resolves.toEqual({
        data: [filteredProject2, filteredProject1],
        pagination: { count: 2, page: 0 },
    });

    prismaMock.project.findMany.mockResolvedValue([
        filteredProject1,
        filteredProject2,
    ]);

    await expect(
        filterProjects(
            { currentPage: 0, pageSize: 25 },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "desc",
            0
        )
    ).resolves.toEqual({
        data: [filteredProject1, filteredProject2],
        pagination: { count: 2, page: 0 },
    });
});
